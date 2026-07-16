"use client";
import { useCallback, useRef, useState, useEffect } from "react";
import {
  VoiceRecord,
  StatusDot,
  Conversation,
  ChatMessage,
  Segmented,
  Switch,
  Button,
} from "@hulianui/ui";
import { useLiveSession } from "./hooks/useLiveSession";

export default function App() {
  const {
    phase,
    error,
    messages,
    statusText,
    reasoningLevel,
    setReasoningLevel,
    webSearch,
    setWebSearch,
    startRecording,
    stopRecording,
    clearHistory,
  } = useLiveSession();

  const [audioLevels, setAudioLevels] = useState<number[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);

  // ── 录音中的音频级别采集（驱动 VoiceRecord 波形） ──
  const buildLevels = useCallback(async () => {
    if (phase !== "recording") return;
    try {
      if (!streamRef.current) {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = s;
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(s);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        src.connect(analyser);
        analyserRef.current = analyser;
      }

      const sample = () => {
        const data = new Uint8Array(32);
        analyserRef.current?.getByteFrequencyData(data);
        const levelArray = Array.from(data, (v) => v / 255);
        setAudioLevels(levelArray);
        rafRef.current = requestAnimationFrame(sample);
      };
      sample();
    } catch {
      // 录音的 error 已由 startRecording 处理
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "recording") {
      buildLevels();
      return;
    }
    // 停止时清理
    cancelAnimationFrame(rafRef.current!);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    if (phase !== "processing") {
      setAudioLevels([]);
    }
  }, [phase, buildLevels]);

  const onVoiceToggle = useCallback(
    (s: string) => {
      if (s === "idle") startRecording();
      else stopRecording();
    },
    [startRecording, stopRecording],
  );

  const currentRecordStatus = phase === "recording"
    ? "recording" as const
    : phase === "processing" || phase === "asr" || phase === "llm" || phase === "tts"
      ? "processing" as const
      : phase === "disconnected"
        ? "disabled" as const
        : "idle" as const;

  const reasoningItems = [
    { value: "instant", label: "即时" },
    { value: "medium", label: "均衡" },
    { value: "high", label: "深度" },
  ];

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col px-4 py-6">
      {/* ── 顶栏：Logo + 连接状态 ── */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-foreground">
            Live
          </span>
        </div>
        <StatusDot
          status={
            phase === "disconnected" || phase === "connecting"
              ? "offline"
              : phase === "error"
                ? "degraded"
                : "online"
          }
          pulse={phase === "ready" || phase === "recording"}
          label={
            phase === "disconnected"
              ? "未连接"
              : phase === "connecting"
                ? "连接中"
                : phase === "ready" || phase === "recording"
                  ? "已连接"
                  : phase === "error"
                    ? error || "异常"
                    : "处理中"
          }
          size="sm"
        />
      </header>

      {/* ── 语音按钮主区 ── */}
      <section className="flex flex-col items-center justify-center py-8">
        <VoiceRecord
          status={currentRecordStatus}
          levels={phase === "recording" ? audioLevels : []}
          size="lg"
          onToggle={onVoiceToggle}
          labelIdle="按住说话"
          labelRecording="松开结束"
          labelProcessing={statusText}
        />
      </section>

      {/* ── 控制栏：推理深度 + 联网搜索 ── */}
      <section className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">🧠 推理深度</span>
          <Segmented
            items={reasoningItems}
            value={reasoningLevel}
            onValueChange={(v) => setReasoningLevel(v as "instant" | "medium" | "high")}
            size="sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">🔍 联网搜索</span>
          <Switch checked={webSearch} onCheckedChange={(c) => setWebSearch(c)} />
        </div>
      </section>

      {/* ── 对话消息区 ── */}
      <section className="flex-1 overflow-hidden rounded-2xl border border-border bg-surface/60">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center">
            <p className="text-sm text-muted">
              按住 🎤 按钮开始对话
            </p>
          </div>
        ) : (
          <Conversation className="h-full p-4" autoScroll>
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                role={msg.role as "user" | "assistant"}
                name={msg.role === "user" ? "你" : "Live"}
                timestamp={new Date(msg.timestamp).toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              >
                {msg.text}
              </ChatMessage>
            ))}
            {/* 处理中的加载提示 */}
            {(phase === "asr" || phase === "llm") && (
              <ChatMessage role="assistant" loading name="Live">
                思考中…
              </ChatMessage>
            )}
          </Conversation>
        )}
      </section>

      {/* ── 底部工具栏 ── */}
      <footer className="mt-4 flex items-center justify-center gap-3">
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          🗑 清除对话
        </Button>
        {error && (
          <span className="text-xs text-danger">{error}</span>
        )}
      </footer>
    </div>
  );
}
