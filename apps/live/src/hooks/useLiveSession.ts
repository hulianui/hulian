/**
 * useLiveSession — 管理与 Live 服务端的 WebSocket 连接
 *
 * 设计要点：
 *   - 按按钮立即切 recording 状态（不等服务端确认），视觉反馈零延迟
 *   - 麦克风流和波形分析共享同一 getUserMedia，不重复调用
 *   - iOS HTTPS 自动用 wss://
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type LivePhase =
  | "disconnected"
  | "connecting"
  | "ready"
  | "recording"
  | "processing"
  | "asr"
  | "llm"
  | "tts"
  | "play"
  | "error";

export interface LiveMessage {
  role: "user" | "assistant" | "system";
  text: string;
  widget?: LiveWidget;
  timestamp: number;
}

export interface LiveWidget {
  type: "weather" | "stocks" | "sports" | "time" | "search";
  data: Record<string, unknown>;
}

export interface LiveSessionActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearHistory: () => void;
  reasoningLevel: "instant" | "medium" | "high";
  setReasoningLevel: (level: "instant" | "medium" | "high") => void;
  webSearch: boolean;
  setWebSearch: (on: boolean) => void;
}

const WS_PORT = 6818;
const WSS_PORT = 6819;

function getWsUrl(): string {
  if (typeof window === "undefined") return `ws://localhost:${WS_PORT}`;
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  return protocol === "https:" ? `wss://${host}:${WSS_PORT}` : `ws://${host}:${WS_PORT}`;
}

const PHASE_LABELS: Record<LivePhase, string> = {
  disconnected: "未连接",
  connecting: "连接中…",
  ready: "🎤 按住说话",
  recording: "🔴 录音中…",
  processing: "⏳ 处理中…",
  asr: "👂 听取中…",
  llm: "🧠 思考中…",
  tts: "🗣 合成语音…",
  play: "🔊 播放中…",
  error: "⚠️ 出错",
};

export interface LiveSessionResult {
  phase: LivePhase;
  error: string | null;
  messages: LiveMessage[];
  statusText: string;
  /** 音频分析级别（0-1），录音中实时更新，用于驱动 VoiceRecord 波形 */
  audioLevels: number[];
  actions: LiveSessionActions;
}

export function useLiveSession(): LiveSessionResult {
  const [phase, setPhase] = useState<LivePhase>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [audioLevels, setAudioLevels] = useState<number[]>([]);
  const [reasoningLevel, setReasoningLevel] = useState<"instant" | "medium" | "high">("medium");
  const [webSearch, setWebSearch] = useState(false);

  // refs
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const statusText = PHASE_LABELS[phase];

  // ── 清理录音 / 波形资源 ──
  const cleanupMic = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    analyserRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    // 不关 audioCtx — 播放音频还需要它
  }, []);

  // ── 启动波形分析（与录音共享同一个 getUserMedia 流） ──
  const startWaveform = useCallback((stream: MediaStream) => {
    // 先清理旧的
    cancelAnimationFrame(rafRef.current);
    // 创建新的 AnalyzerNode
    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    src.connect(analyser);
    analyserRef.current = analyser;

    // RAF 循环采样
    const sample = () => {
      const data = new Uint8Array(32);
      analyserRef.current?.getByteFrequencyData(data);
      setAudioLevels(Array.from(data, (v) => v / 255));
      rafRef.current = requestAnimationFrame(sample);
    };
    sample();
  }, []);

  // ── WebSocket 连接 ──
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    setPhase("connecting");

    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setPhase("ready");
      setError(null);
    };

    ws.onclose = () => {
      setPhase("disconnected");
      wsRef.current = null;
      reconnectTimer.current = setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      setError("连接失败");
      setPhase("error");
    };

    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        playAudioBlob(event.data);
        return;
      }
      try {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg);
      } catch {
        // 忽略
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 服务端消息 ──
  function handleServerMessage(msg: Record<string, unknown>) {
    switch (msg.type) {
      case "status":
        setPhase(msg.phase as LivePhase);
        break;
      case "transcript":
        setMessages((prev) => [
          ...prev,
          { role: "user", text: msg.text as string, timestamp: Date.now() },
        ]);
        break;
      case "response":
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...last, text: last.text + ((msg.text as string) || "") },
            ];
          }
          return [
            ...prev,
            { role: "assistant", text: msg.text as string, timestamp: Date.now() },
          ];
        });
        break;
      case "error":
        setError(msg.message as string);
        setPhase("error");
        break;
    }
  }

  // ── 播放音频 ──
  async function playAudioBlob(blob: Blob) {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const buf = await blob.arrayBuffer();
      const audioBuf = await audioCtxRef.current.decodeAudioData(buf);
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = audioBuf;
      source.connect(audioCtxRef.current.destination);
      source.start(0);
    } catch {
      // 播放失败静默
    }
  }

  // ── 开始录音 ──
  const startRecording = useCallback(async () => {
    // 立即切 recording（不等服务器确认），按钮波形立刻响应
    setPhase("recording");
    setError(null);
    setAudioLevels(Array.from({ length: 32 }, () => 0.05)); // 初始微小波纹

    // 先发 start 到服务端（不等 mic 权限，视觉优先）
    wsRef.current?.send(JSON.stringify({ type: "start" }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 启动波形分析（与录音共享同一 stream）
      startWaveform(stream);

      // 创建 MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codec=opus")
        ? "audio/webm;codec=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        // 停止波形
        cleanupMic();
        // 发送音频
        const blob = new Blob(chunks, { type: mimeType });
        wsRef.current?.send(blob);
        wsRef.current?.send(JSON.stringify({ type: "stop" }));
      };

      recorder.start(250);
    } catch (err) {
      // getUserMedia 失败（权限被拒等）
      cleanupMic();
      setAudioLevels([]);
      setError(`麦克风权限被拒: ${err instanceof Error ? err.message : ""}`);
      setPhase("error");
    }
  }, [cleanupMic, startWaveform]);

  // ── 停止录音 ──
  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  // ── 清除历史 ──
  const clearHistory = useCallback(() => {
    setMessages([]);
    wsRef.current?.send(JSON.stringify({ type: "reset" }));
  }, []);

  // ── 生命周期 ──
  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      cleanupMic();
      wsRef.current?.close();
      audioCtxRef.current?.close();
    };
  }, [connect, cleanupMic]);

  return {
    phase,
    error,
    messages,
    statusText,
    audioLevels,
    actions: {
      startRecording,
      stopRecording,
      clearHistory,
      reasoningLevel,
      setReasoningLevel,
      webSearch,
      setWebSearch,
    },
  };
}
