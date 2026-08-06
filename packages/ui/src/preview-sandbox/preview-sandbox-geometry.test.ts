import { describe, expect, it } from "vitest";
import {
  computePreviewScale,
  PREVIEW_SANDBOX_DEVICES,
  resolveFrameKind,
  resolveViewport,
} from "./preview-sandbox-geometry";

describe("resolveViewport", () => {
  it("内置四档各有尺寸", () => {
    expect(Object.keys(PREVIEW_SANDBOX_DEVICES).sort()).toEqual([
      "android",
      "desktop",
      "iphone",
      "tablet",
    ]);
  });
  it("档位名 → 预设尺寸", () => {
    expect(resolveViewport("iphone")).toEqual({ width: 390, height: 844 });
    expect(resolveViewport("desktop")).toEqual({ width: 1280, height: 800 });
  });
  it("不传 → desktop", () => {
    expect(resolveViewport(undefined)).toEqual(PREVIEW_SANDBOX_DEVICES.desktop);
  });
  it("自由尺寸取整", () => {
    expect(resolveViewport({ width: 500.4, height: 300.6 })).toEqual({ width: 500, height: 301 });
  });
  it("非法自由尺寸夹到 ≥1（0 会让缩放算成 Infinity）", () => {
    expect(resolveViewport({ width: 0, height: -20 })).toEqual({ width: 1, height: 1 });
    expect(resolveViewport({ width: Number.NaN, height: 600 })).toEqual({ width: 1280, height: 600 });
  });
});

describe("resolveFrameKind", () => {
  it("三个机型档位有外框", () => {
    expect(resolveFrameKind("iphone")).toBe("iphone");
    expect(resolveFrameKind("android")).toBe("android");
    expect(resolveFrameKind("tablet")).toBe("tablet");
  });
  it("desktop 与自由尺寸没有外框", () => {
    expect(resolveFrameKind("desktop")).toBeNull();
    expect(resolveFrameKind({ width: 390, height: 844 })).toBeNull();
    expect(resolveFrameKind(undefined)).toBeNull();
  });
});

describe("computePreviewScale", () => {
  const vp = { viewportW: 1280, viewportH: 800 };

  it("容器小于视口 → 等比缩小，取较紧的一边", () => {
    expect(computePreviewScale({ outerW: 640, outerH: 800, ...vp, scale: "fit" })).toBe(0.5);
    expect(computePreviewScale({ outerW: 1280, outerH: 400, ...vp, scale: "fit" })).toBe(0.5);
  });
  it("容器大于视口 → 停在 1，不放大（与 FitScreen 的关键差别）", () => {
    expect(computePreviewScale({ outerW: 2560, outerH: 1600, ...vp, scale: "fit" })).toBe(1);
  });
  it("容器还没测量到 → 1，而不是 0（首帧不闪空）", () => {
    expect(computePreviewScale({ outerW: 0, outerH: 0, ...vp, scale: "fit" })).toBe(1);
  });
  it("数字 scale 原样生效，且不受容器尺寸影响", () => {
    expect(computePreviewScale({ outerW: 100, outerH: 100, ...vp, scale: 2 })).toBe(2);
    expect(computePreviewScale({ outerW: 0, outerH: 0, ...vp, scale: 0.75 })).toBe(0.75);
  });
  it("非法数字 scale 回退 1", () => {
    expect(computePreviewScale({ outerW: 100, outerH: 100, ...vp, scale: 0 })).toBe(1);
    expect(computePreviewScale({ outerW: 100, outerH: 100, ...vp, scale: -1 })).toBe(1);
    expect(computePreviewScale({ outerW: 100, outerH: 100, ...vp, scale: Number.NaN })).toBe(1);
  });
});
