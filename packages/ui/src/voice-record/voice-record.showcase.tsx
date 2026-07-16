"use client";
import { useState, useCallback } from "react";
import { VoiceRecord } from "./voice-record";

export function VoiceRecordShowcase() {
  const [status, setStatus] = useState<"idle" | "recording" | "processing">("idle");
  const [levels, setLevels] = useState<number[]>([]);

  const handleToggle = useCallback((s: string) => {
    if (s === "idle") {
      setStatus("recording");
      // 模拟波形
      const t = setInterval(() => {
        setLevels(Array.from({ length: 24 }, () => Math.random() * 0.8 + 0.2));
      }, 150);
      (window as any).__waveTimer = t;
    } else {
      setStatus("processing");
      clearInterval((window as any).__waveTimer);
      setTimeout(() => {
        setStatus("idle");
        setLevels([]);
      }, 2000);
    }
  }, []);

  return (
    <div className="flex flex-wrap gap-8 p-8">
      <VoiceRecord
        status={status}
        levels={levels}
        onToggle={handleToggle}
        size="md"
      />
      <VoiceRecord status="idle" size="sm" />
      <VoiceRecord status="processing" size="lg" />
      <VoiceRecord status="disabled" />
    </div>
  );
}
