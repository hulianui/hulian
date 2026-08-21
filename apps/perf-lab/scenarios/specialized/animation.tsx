import { useEffect, useRef, useState } from "react";

import type { ShowcaseSpec } from "@hulianui/ui";
import { definePerformanceScenario } from "@hulianui/hulian-scan/browser";

import type { GeneratedScenarioMetadata } from "../contract";
import { invoke, nextPaint, rootFor, wait, type ScenarioController } from "./shared";

// frames 是采样窗口的**主**判据，maxSampleMs 是它的兜底：
// 60Hz 下 120 帧 ≈ 2s，所以 4s 的墙钟上限在任何正常渲染路径下都不会触发。
// 它只在渲染退化到「一帧一秒」的环境里咬合 —— CI runner 没有硬件 GPU，
// Chromium 回落到 ANGLE SwiftShader，实测 faulty-terminal 的最长帧中位数
// 1083ms（2026-08-19 weekly sweep 证据），120 帧要 25~30s，正好撞上 window-api
// 给 animation 类场景的 30s 单轮超时，于是这个场景随机超时。
//
// 为什么截断不会放跑真回归：一旦触发上限，说明帧耗时已经烂到 droppedFrameRatio
// 逼近 1、longestFrameMs 爆表，animation 类的 maxDroppedFrameRatio(0.1) 照样判失败；
// 而在 CI 上这些帧指标本来就因为软件 GPU 被 budgets.ts 标记为不可信、整体丢弃 ——
// 也就是说撞墙那 25 秒采的数据没有任何人会读。
export const animationParameters = {
  frames: 120,
  maxSampleMs: 4_000,
  unmountObserveMs: 500,
} as const;
const id = "animation/frame-budget";
const controller: ScenarioController = {};

export async function sampleFrames(): Promise<void> {
  const deadline = performance.now() + animationParameters.maxSampleMs;
  for (let index = 0; index < animationParameters.frames; index += 1) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    if (performance.now() >= deadline) return;
  }
}

function Fixture() {
  const [running, setRunning] = useState(false);
  const [visible, setVisible] = useState(true);
  const [frame, setFrame] = useState(0);
  const request = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!running) return;
    const animate = () => {
      setFrame((value) => value + 1);
      request.current = requestAnimationFrame(animate);
    };
    request.current = requestAnimationFrame(animate);
    return () => {
      if (request.current !== undefined) cancelAnimationFrame(request.current);
      request.current = undefined;
    };
  }, [running]);

  controller["start"] = () => setRunning(true);
  controller["sample"] = sampleFrames;
  controller["stop"] = () => setRunning(false);
  controller["unmount"] = async () => {
    setVisible(false);
    await wait(animationParameters.unmountObserveMs);
    if (request.current !== undefined) throw new Error("animation RAF survived unmount");
  };

  return (
    <div data-hulian-scan-scenario={id} data-frame={frame}>
      {visible ? (
        <div
          aria-label="帧预算动画"
          style={{
            width: 48,
            height: 48,
            transform: `translateX(${frame % 300}px)`,
            background: "var(--color-primary)",
          }}
        />
      ) : null}
    </div>
  );
}

async function action(name: string): Promise<void> {
  await invoke(controller, name);
  await nextPaint();
}

export const animationScenario = definePerformanceScenario({
  id,
  component: "AnimationFrameBudgetFixture",
  entry: "@hulianui/perf-lab/scenarios/animation",
  category: "animation",
  webgl: false,
  render: () => <Fixture />,
  steps: [
    {
      id: "start",
      kind: "interaction",
      label: "Start continuous RAF animation",
      run: () => action("start"),
    },
    { id: "sample-frames", kind: "stress", run: () => action("sample") },
    {
      id: "stop",
      kind: "interaction",
      label: "Stop continuous RAF animation",
      run: () => action("stop"),
    },
    { id: "unmount-observe", kind: "unmount", run: () => action("unmount") },
  ],
  budgets: {},
});

export async function createAnimationScenario(
  metadata: GeneratedScenarioMetadata,
  showcase: ShowcaseSpec,
) {
  const initialRender = showcase.examples?.[0]?.render ?? showcase.states[0]?.render;
  if (!initialRender) throw new Error(`${metadata.id} showcase has no animation render`);
  const localController: ScenarioController = {};

  function PublicAnimationFixture() {
    const [visible, setVisible] = useState(true);
    localController["start"] = () => {
      const root = rootFor(metadata.scenarioId);
      if (!root.hasChildNodes()) throw new Error(`${metadata.id} rendered no animation DOM`);
    };
    localController["sample"] = sampleFrames;
    localController["stop"] = () => setVisible(false);
    localController["unmount"] = async () => {
      await wait(animationParameters.unmountObserveMs);
      if (rootFor(metadata.scenarioId).hasChildNodes()) {
        throw new Error(`${metadata.id} retained DOM after animation stop`);
      }
    };
    return (
      <div data-hulian-scan-scenario={metadata.scenarioId}>{visible ? initialRender() : null}</div>
    );
  }

  const run = async (name: string): Promise<void> => {
    await invoke(localController, name);
    await nextPaint();
  };

  return definePerformanceScenario({
    id: metadata.scenarioId,
    component: metadata.component,
    entry: metadata.entry,
    category: "animation",
    webgl: metadata.webgl,
    render: () => <PublicAnimationFixture />,
    steps: [
      {
        id: "start",
        kind: "interaction",
        label: "Start or assert the public animation",
        run: () => run("start"),
      },
      { id: "sample-frames", kind: "stress", run: () => run("sample") },
      {
        id: "stop",
        kind: "interaction",
        label: "Stop the public animation",
        run: () => run("stop"),
      },
      { id: "unmount-observe", kind: "unmount", run: () => run("unmount") },
    ],
    budgets: {},
  });
}
