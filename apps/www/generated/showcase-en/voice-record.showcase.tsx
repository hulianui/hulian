"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { VoiceRecord } from "../../../../packages/ui/src/voice-record/voice-record";
import type { VoiceRecordProps, VoiceRecordStatus } from "../../../../packages/ui/src/voice-record/voice-record.types";
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
        if (timer.current)
            clearInterval(timer.current);
        timer.current = null;
        setStatus("processing");
        setTimeout(() => {
            setStatus("idle");
            setLevels([]);
        }, 1500);
    }, []);
    useEffect(() => () => {
        if (timer.current)
            clearInterval(timer.current);
    }, []);
    return (<VoiceRecord status={status} levels={levels} onPress={start} onRelease={stop} onToggle={(s) => {
            if (props.pressAndHold === false) {
                if (s === "idle")
                    start();
                else if (s === "recording")
                    stop();
            }
        }} {...props}/>);
}
const staticLevels = [0.3, 0.6, 0.9, 0.5, 0.8, 0.4, 0.7, 1, 0.6, 0.3, 0.8, 0.5, 0.9, 0.4, 0.7, 0.6];
export const voiceRecordShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage (press and hold to speak)",
            description: "Default pressAndHold: press to start recording, release to end and enter processing, iOS gesture interruption (pointercancel) can also release correctly.",
            code: `const [status, setStatus] = useState<VoiceRecordStatus>("idle");
const [levels, setLevels] = useState<number[]>([]); // Microphone analyzer feeds 0-1 waveform

<VoiceRecord
  status={status}
  levels={levels}
  onPress={() => setStatus("recording")}
  onRelease={() => setStatus("processing")}
/>`,
            render: () => <VoiceRecordDemo />,
        },
        {
            title: "Click to switch modes",
            description: "pressAndHold={false} Click Start/Click End again, and onToggle will transfer automatically after receiving the current status.",
            code: `<VoiceRecord
  status={status}
  levels={levels}
  pressAndHold={false}
  onToggle={(s) => (s === "idle" ? start() : stop())}
/>`,
            render: () => <VoiceRecordDemo pressAndHold={false} labelIdle="Click to speak" labelRecording="Click to end"/>,
        },
        {
            title: "Size",
            description: "sm / md / lg three levels, icons and labels scale with the level.",
            code: `<>
  <VoiceRecord size="sm" />
  <VoiceRecord size="md" />
  <VoiceRecord size="lg" />
</>`,
            render: () => (<div className="flex flex-wrap items-end gap-8">
          <VoiceRecord size="sm"/>
          <VoiceRecord size="md"/>
          <VoiceRecord size="lg"/>
        </div>),
        },
    ],
    controls: [
        {
            prop: "status",
            type: "select",
            options: ["idle", "recording", "processing", "disabled"],
            defaultValue: "idle",
            label: "Status",
        },
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md", label: "Size" },
        { prop: "labelIdle", type: "text", defaultValue: "Press and hold to speak", label: "Free tag" },
    ],
    states: [
        { name: "idle", render: () => <VoiceRecord status="idle"/> },
        { name: "recording", render: () => <VoiceRecord status="recording" levels={staticLevels}/> },
        { name: "processing", render: () => <VoiceRecord status="processing"/> },
        { name: "disabled", render: () => <VoiceRecord status="disabled"/> },
    ],
    renderWithProps: (p) => (<VoiceRecord status={p.status as VoiceRecordStatus} size={p.size as "sm" | "md" | "lg"} labelIdle={String(p.labelIdle)} levels={p.status === "recording" ? staticLevels : []}/>),
    toCode: (p) => `<VoiceRecord status="${p.status}" size="${p.size}"${p.labelIdle !== "Press and hold to speak" ? ` labelIdle="${p.labelIdle}"` : ""} />`,
};
