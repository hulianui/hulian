import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DEVICE_KINDS,
  DEVICE_METRICS,
  bodyHeightPx,
  innerScreenPx,
  type DeviceKind,
} from "./device-metrics";
import { PREVIEW_SANDBOX_DEVICES } from "../preview-sandbox/preview-sandbox-geometry";

// #117 的白边根因是「机身比例、内屏比例、视口比例」三个数没人负责保持一致。
// 这组测试把那层关系钉成恒等式：改坏了这里会红，而不是等到某天有人截图才发现。

const SRC = join(import.meta.dirname, "..");
const COMPONENT_FILE: Record<DeviceKind, string> = {
  iphone: "iphone/iphone.tsx",
  android: "android/android.tsx",
  tablet: "tablet/tablet.tsx",
  watch: "watch/watch.tsx",
};

describe("设备真源 · 内屏比例恒等于视口比例", () => {
  it.each(DEVICE_KINDS)("%s：任意机身宽度下内屏比例都等于 screen 比例", (kind) => {
    const metrics = DEVICE_METRICS[kind];
    const target = metrics.screen.width / metrics.screen.height;
    // 三个差距很大的宽度：比例若随宽度漂移（写死 aspectRatio 的老写法就会），这里必然分叉。
    for (const bodyWidth of [180, 280, 420]) {
      const inner = innerScreenPx(metrics, bodyWidth);
      expect(inner.width / inner.height).toBeCloseTo(target, 10);
    }
  });

  it.each(DEVICE_KINDS)("%s：机身高度 = 内屏高度 + 上下边框", (kind) => {
    const metrics = DEVICE_METRICS[kind];
    for (const bodyWidth of [180, 280, 420]) {
      const inner = innerScreenPx(metrics, bodyWidth);
      expect(bodyHeightPx(metrics, bodyWidth)).toBeCloseTo(inner.height + metrics.border * 2, 10);
    }
  });

  it("机身宽度不足两条边框时内屏夹到 0，不出负数", () => {
    const metrics = DEVICE_METRICS.tablet; // 边框最厚的一件
    expect(innerScreenPx(metrics, 4)).toEqual({ width: 0, height: 0 });
    expect(bodyHeightPx(metrics, 4)).toBe(metrics.border * 2);
  });
});

describe("设备真源 · 两份清单不再各写各的", () => {
  it("PreviewSandbox 的每个机型档位就是真源里的内屏尺寸", () => {
    for (const kind of DEVICE_KINDS) {
      expect(PREVIEW_SANDBOX_DEVICES[kind]).toEqual(DEVICE_METRICS[kind].screen);
    }
  });

  it("desktop 是唯一的显式例外（无外框档）", () => {
    const listed = Object.keys(PREVIEW_SANDBOX_DEVICES);
    expect(listed.filter((k) => !DEVICE_KINDS.includes(k as DeviceKind))).toEqual(["desktop"]);
  });

  it("watch 已被 PreviewSandbox 支持（此前只因清单没同步而缺席）", () => {
    expect(PREVIEW_SANDBOX_DEVICES.watch).toEqual({ width: 396, height: 484 });
  });
});

describe("设备真源 · 边框宽度与组件里的 border 类一致", () => {
  // border 是几何计算的输入，但真正画出来的是组件 className 里的 border-[Npx]。
  // 两处对不上时不会报错，只会让内屏比例悄悄偏掉 —— 正是 #117 那类问题的形状，故直接读源码比对。
  it.each(DEVICE_KINDS)("%s", (kind) => {
    const source = readFileSync(join(SRC, COMPONENT_FILE[kind]), "utf8");
    const match = source.match(/border-\[(\d+)px\]/);
    expect(match, `${COMPONENT_FILE[kind]} 里找不到 border-[Npx]`).not.toBeNull();
    expect(Number(match![1])).toBe(DEVICE_METRICS[kind].border);
  });
});
