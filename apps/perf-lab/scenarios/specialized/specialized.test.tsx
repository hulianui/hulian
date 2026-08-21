// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

import { specializedScenarios } from "./index";
import { animationParameters, createAnimationScenario, sampleFrames } from "./animation";
import { selectSearchInput } from "./select";

/**
 * 用假时钟驱动 rAF：每回调一次让 performance.now() 前进 frameMs，
 * 返回真实被喂出去的帧数。
 */
async function countSampledFrames(frameMs: number): Promise<number> {
  let now = 0;
  let frames = 0;
  const clock = vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames += 1;
    now += frameMs;
    queueMicrotask(() => callback(now));
    return frames;
  });
  try {
    await sampleFrames();
    return frames;
  } finally {
    clock.mockRestore();
    vi.unstubAllGlobals();
  }
}

describe("specialized performance scenarios", () => {
  it("pins the heavy-component dataset scales", () => {
    expect(specializedScenarios.table.parameters.rows).toBe(1_000);
    expect(specializedScenarios.proTable.parameters.rows).toBe(1_000);
    expect(specializedScenarios.tree.parameters.nodes).toBe(1_000);
    expect(specializedScenarios.virtualList.parameters.items).toBe(10_000);
    expect(specializedScenarios.select.parameters.options).toBe(1_000);
    expect(specializedScenarios.chart.parameters.points).toBe(500);
    expect(specializedScenarios.markdownEditor.parameters.characters).toBe(20_000);
  });

  // 采样窗口的墙钟兜底。没有它，软件 GPU 上 120 帧要 25~30s，撞穿 window-api 给
  // animation 场景的 30s 单轮超时 —— 2026-08-19 的 weekly sweep 就是这么被
  // faulty-terminal 一个场景拖红的（runs/32294199543）。
  it("bounds the frame sampling window by wall clock, not just frame count", async () => {
    // 正常 60Hz：帧数说了算，墙钟上限碰不到。
    await expect(countSampledFrames(16)).resolves.toBe(animationParameters.frames);

    // 一帧一秒的退化环境：4s 上限咬合，不会跑满 120 帧。
    const degraded = await countSampledFrames(1_000);
    expect(degraded).toBe(animationParameters.maxSampleMs / 1_000);
    expect(degraded).toBeLessThan(animationParameters.frames);
  });

  it("keeps the animation lifecycle explicit", () => {
    expect(specializedScenarios.animation.scenario.steps.map((step) => step.id)).toEqual([
      "start",
      "sample-frames",
      "stop",
      "unmount-observe",
    ]);
  });

  it("targets the visible Select search input instead of Base UI's hidden form input", () => {
    const root = document.createElement("div");
    root.innerHTML = '<input value="hidden-value"><input placeholder="搜索">';
    expect(selectSearchInput(root)?.getAttribute("placeholder")).toBe("搜索");
  });

  it("applies the same 120-frame lifecycle to every classified public animation", async () => {
    const scenario = await createAnimationScenario(
      {
        id: "animated-beam",
        scenarioId: "animated-beam/frame-budget",
        component: "AnimatedBeam",
        entry: "@hulianui/ui/animated-beam",
        category: "animation",
        categories: ["decoration"],
        animated: true,
        webgl: false,
        source: "packages/ui/src/animated-beam/index.ts",
      },
      {
        controls: [],
        states: [{ name: "default", render: () => <div /> }],
        renderWithProps: () => <div />,
        toCode: () => "<AnimatedBeam />",
      },
    );

    expect(scenario.steps.map((step) => step.id)).toEqual([
      "start",
      "sample-frames",
      "stop",
      "unmount-observe",
    ]);
    expect(scenario.webgl).toBe(false);
  });

  it("carries the WebGL classification into the executable scenario", async () => {
    const scenario = await createAnimationScenario(
      {
        id: "shader",
        scenarioId: "shader/frame-budget",
        component: "Shader",
        entry: "@hulianui/ui/shader",
        category: "animation",
        categories: ["decoration"],
        animated: true,
        webgl: true,
        source: "packages/ui/src/shader/index.ts",
      },
      {
        controls: [],
        states: [{ name: "default", render: () => <div /> }],
        renderWithProps: () => <div />,
        toCode: () => "<Shader />",
      },
    );

    expect(scenario.webgl).toBe(true);
  });
});
