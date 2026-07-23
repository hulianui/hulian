"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { VoiceRecord } from "./voice-record";
import type { VoiceRecordProps, VoiceRecordStatus } from "./voice-record.types";

/** 模拟录音链路：录音中随机波形驱动动画，结束后短暂 processing 再回 idle。 */
function VoiceRecordDemo(props: Omit<VoiceRecordProps, "status" | "levels" | "onPress" | "onRelease" | "onToggle">) {
  const [status, setStatus] = useState<VoiceRecordStatus>("idle");
  const [levels, setLevels] = useState<number[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setStatus("recording");
    timer.current = setInterval(() => {
      setLevels(Array.from({ length: 24 }, () => Math.random() * 0.8 + 0.2));
    }, 150);
  }, []);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setStatus("processing");
    setTimeout(() => {
      setStatus("idle");
      setLevels([]);
    }, 1500);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  return (
    <VoiceRecord
      status={status}
      levels={levels}
      onPress={start}
      onRelease={stop}
      onToggle={(s) => {
        if (props.pressAndHold === false) {
          if (s === "idle") start();
          else if (s === "recording") stop();
        }
      }}
      {...props}
    />
  );
}

const staticLevels = [0.3, 0.6, 0.9, 0.5, 0.8, 0.4, 0.7, 1, 0.6, 0.3, 0.8, 0.5, 0.9, 0.4, 0.7, 0.6];

export const voiceRecordShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法（按住说话）",
      description: "默认 pressAndHold：按下开始录音、松开结束进入处理，iOS 手势打断（pointercancel）也能正确松手。",
      code: `const [status, setStatus] = useState<VoiceRecordStatus>("idle");
const [levels, setLevels] = useState<number[]>([]); // 麦克风分析器喂 0-1 波形

<VoiceRecord
  status={status}
  levels={levels}
  onPress={() => setStatus("recording")}
  onRelease={() => setStatus("processing")}
/>`,
      render: () => <VoiceRecordDemo />,
    },
    {
      title: "点击切换模式",
      description: "pressAndHold={false} 改为点击开始 / 再点击结束，onToggle 收到当前状态自行流转。",
      code: `<VoiceRecord
  status={status}
  levels={levels}
  pressAndHold={false}
  onToggle={(s) => (s === "idle" ? start() : stop())}
/>`,
      render: () => <VoiceRecordDemo pressAndHold={false} labelIdle="点击说话" labelRecording="点击结束" />,
    },
    {
      title: "尺寸",
      description: "sm / md / lg 三档，图标与标签随档位缩放。",
      code: `<>
  <VoiceRecord size="sm" />
  <VoiceRecord size="md" />
  <VoiceRecord size="lg" />
</>`,
      render: () => (
        <div className="flex flex-wrap items-end gap-8">
          <VoiceRecord size="sm" />
          <VoiceRecord size="md" />
          <VoiceRecord size="lg" />
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "status",
      type: "select",
      options: ["idle", "recording", "processing", "disabled"],
      defaultValue: "idle",
      label: "状态",
    },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md", label: "尺寸" },
    { prop: "labelIdle", type: "text", defaultValue: "按住说话", label: "空闲标签" },
  ],
  states: [
    { name: "idle", render: () => <VoiceRecord status="idle" /> },
    { name: "recording", render: () => <VoiceRecord status="recording" levels={staticLevels} /> },
    { name: "processing", render: () => <VoiceRecord status="processing" /> },
    { name: "disabled", render: () => <VoiceRecord status="disabled" /> },
  ],
  renderWithProps: (p) => (
    <VoiceRecord
      status={p.status as VoiceRecordStatus}
      size={p.size as "sm" | "md" | "lg"}
      labelIdle={String(p.labelIdle)}
      levels={p.status === "recording" ? staticLevels : []}
    />
  ),
  toCode: (p) =>
    `<VoiceRecord status="${p.status}" size="${p.size}"${p.labelIdle !== "按住说话" ? ` labelIdle="${p.labelIdle}"` : ""} />`,
};
