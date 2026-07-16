"use client";
import { useCallback } from "react";
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
  } = useLiveSession();

  const onVoiceToggle = useCallback(
    (s: string) => {
      if (s === "idle") startRecording();
      else stopRecording();
    },
    [startRecording, stopRecording],
  );

  const isProcessing =
    phase === "processing" || phase === "asr" || phase === "llm" || phase === "tts";

  const currentRecordStatus = phase === "recording"
    ? ("recording" as const)
    : isProcessing
      ? ("processing" as const)
      : phase === "disconnected"
        ? ("disabled" as const)
        : ("idle" as const);

  const reasoningItems = [
    { value: "instant", label: "即时" },
    { value: "medium", label: "均衡" },
    { value: "high", label: "深度" },
  ];

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col px-4 py-6">
      {/* ── 顶栏 ── */}
      <header className="mb-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight text-foreground">
          Live
        </span>
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

      {/* ── 语音按钮 ── */}
      <section className="flex flex-col items-center justify-center py-6">
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

      {/* ── 控制栏 ── */}
      <section className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">🧠 推理</span>
          <Segmented
            items={reasoningItems}
            value={reasoningLevel}
            onValueChange={(v) => setReasoningLevel(v as "instant" | "medium" | "high")}
            size="sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">🔍 联网</span>
          <Switch checked={webSearch} onCheckedChange={(c) => setWebSearch(c)} />
        </div>
      </section>

      {/* ── 对话区 ── */}
      <section className="flex-1 overflow-hidden rounded-2xl border border-border bg-surface/60">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[180px] items-center justify-center">
            <p className="text-sm text-muted">
              按住 🎤 按钮开始对话
            </p>
          </div>
        ) : (
          <Conversation className="h-full p-3" autoScroll>
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
            {(phase === "asr" || phase === "llm") && (
              <ChatMessage role="assistant" loading name="Live">
                思考中…
              </ChatMessage>
            )}
          </Conversation>
        )}
      </section>

      {/* ── 底部 ── */}
      <footer className="mt-3 flex items-center justify-center gap-3">
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          🗑 清除对话
        </Button>
        {error && <span className="text-xs text-danger">{error}</span>}
      </footer>
    </div>
  );
}
