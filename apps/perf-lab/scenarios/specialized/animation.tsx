import { useEffect, useRef, useState } from "react";

import type { ShowcaseSpec } from "@hulianui/ui";
import { definePerformanceScenario } from "@hulianui/hulian-scan/browser";

import type { GeneratedScenarioMetadata } from "../contract";
import { invoke, nextPaint, rootFor, wait, type ScenarioController } from "./shared";

export const animationParameters = { frames: 120, unmountObserveMs: 500 } as const;
const id = "animation/frame-budget";
const controller: ScenarioController = {};

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
  controller["sample"] = async () => {
    for (let index = 0; index < animationParameters.frames; index += 1) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
  };
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
    localController["sample"] = async () => {
      for (let index = 0; index < animationParameters.frames; index += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
    };
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
