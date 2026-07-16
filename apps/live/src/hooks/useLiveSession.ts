/**
 * useLiveSession — 管理与 Live 服务端的 WebSocket 连接
 *
 * 职责：
 *   - 连接 WebSocket（自动重连）
 *   - 管理录音状态（MediaRecorder + getUserMedia）
 *   - 发送音频流、接收文本/音频回复
 *   - 暴露状态和操作给 React 组件
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
  /** assistant 消息附带的可视组件（天气/股票等） */
  widget?: LiveWidget;
  timestamp: number;
}

export interface LiveWidget {
  type: "weather" | "stocks" | "sports" | "time" | "search";
  data: Record<string, unknown>;
}

export interface LiveSessionState {
  phase: LivePhase;
  error: string | null;
  messages: LiveMessage[];
  statusText: string;
}

export interface LiveSessionActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearHistory: () => void;
  /** 推理强度：instant / medium / high */
  reasoningLevel: "instant" | "medium" | "high";
  setReasoningLevel: (level: "instant" | "medium" | "high") => void;
  /** 联网搜索 */
  webSearch: boolean;
  setWebSearch: (on: boolean) => void;
}

/** WebSocket 服务端口（后端） */
const WS_PORT = 6818
const WSS_PORT = 6819
/** 根据当前访问地址动态拼出 WebSocket URL（支持 localhost + LAN + HTTPS） */
function getWsUrl(): string {
  if (typeof window === 'undefined') return `ws://localhost:${WS_PORT}`
  const host = window.location.hostname
  const protocol = window.location.protocol
  // 如果页面是 HTTPS，WebSocket 也必须用 WSS（iOS Safari 要求）
  if (protocol === 'https:') return `wss://${host}:${WSS_PORT}`
  return `ws://${host}:${WS_PORT}`
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

export function useLiveSession(): LiveSessionState & LiveSessionActions {
  const [phase, setPhase] = useState<LivePhase>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [reasoningLevel, setReasoningLevel] = useState<"instant" | "medium" | "high">("medium");
  const [webSearch, setWebSearch] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const statusText = PHASE_LABELS[phase];

  // ── 连接 WebSocket ──
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
      // 自动重连
      reconnectTimer.current = setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      setError("连接失败");
      setPhase("error");
    };

    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        // 二进制 = 音频数据，播放
        playAudioBlob(event.data);
        return;
      }

      try {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg);
      } catch {
        // 忽略解析失败
      }
    };
  }, []);

  // ── 处理服务端消息 ──
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
          // 最后一个如果是同一轮 assistant 回复则追加
          if (last?.role === "assistant") {
            last.text += (msg.text as string) || "";
            return [...prev.slice(0, -1), { ...last }];
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
    } catch (err) {
      console.error("播放失败:", err);
    }
  }

  // ── 录音 ──
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: mimeType });
        wsRef.current?.send(blob);
        wsRef.current?.send(JSON.stringify({ type: "stop" }));
      };

      wsRef.current?.send(JSON.stringify({ type: "start" }));
      recorder.start(250);
    } catch (err) {
      setError(`麦克风权限被拒: ${err instanceof Error ? err.message : ""}`);
      setPhase("error");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  // ── 清除对话 ──
  const clearHistory = useCallback(() => {
    setMessages([]);
    wsRef.current?.send(JSON.stringify({ type: "reset" }));
  }, []);

  // ── 生命周期 ──
  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      audioCtxRef.current?.close();
    };
  }, [connect]);

  return {
    phase,
    error,
    messages,
    statusText,
    startRecording,
    stopRecording,
    clearHistory,
    reasoningLevel,
    setReasoningLevel,
    webSearch,
    setWebSearch,
  };
}
