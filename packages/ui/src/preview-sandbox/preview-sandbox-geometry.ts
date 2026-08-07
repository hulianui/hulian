import { DEVICE_KINDS, DEVICE_METRICS, type DeviceKind } from "../lib/device-metrics";
import type {
  PreviewSandboxDevice,
  PreviewSandboxDeviceProp,
  PreviewSandboxFrameKind,
  PreviewSandboxViewport,
} from "./preview-sandbox.types";

// 尺寸表与缩放系数是本组件唯一「算错了会静默变形」的部分，全部抽成纯函数：
// jsdom 里 iframe 不执行脚本、也没有真实布局，组件测试盖不住这些数，只能靠这里的单测锁住。

/**
 * 内置设备档位 → 视口 CSS 像素尺寸。
 *
 * 取的是各机型的**逻辑分辨率**（CSS px）而不是物理像素——预览内的媒体查询按逻辑像素匹配，
 * 用物理像素会让 `max-width: 430px` 之类断点全部失效。
 */
export const PREVIEW_SANDBOX_DEVICES: Record<PreviewSandboxDevice, PreviewSandboxViewport> = {
  // desktop 是「无外框」档，是这份清单里唯一合理的例外，所以显式写在这里。
  desktop: { width: 1280, height: 800 },
  // 其余档位一律从设备真源派生，不再手写第二份 —— 手写两份的结果就是 watch 被漏掉、
  // 且没有任何东西保证「内屏比例 == 视口比例」（#139）。加机型只需改 DEVICE_METRICS。
  ...(Object.fromEntries(
    DEVICE_KINDS.map((kind) => [kind, DEVICE_METRICS[kind].screen]),
  ) as Record<DeviceKind, PreviewSandboxViewport>),
};

/** 有设备外框可用的档位 —— 与 mockups 分类的外框件一一对应，同样从真源派生。 */
const FRAME_KINDS = Object.fromEntries(DEVICE_KINDS.map((kind) => [kind, true])) as Record<
  PreviewSandboxFrameKind,
  true
>;

function positiveInt(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.round(value));
}

/** device prop → 视口尺寸。自由尺寸会取整并夹到 ≥1（0 或负数会让 scale 计算退化成 Infinity）。 */
export function resolveViewport(device: PreviewSandboxDeviceProp | undefined): PreviewSandboxViewport {
  if (device && typeof device === "object") {
    return {
      width: positiveInt(device.width, PREVIEW_SANDBOX_DEVICES.desktop.width),
      height: positiveInt(device.height, PREVIEW_SANDBOX_DEVICES.desktop.height),
    };
  }
  return PREVIEW_SANDBOX_DEVICES[device ?? "desktop"] ?? PREVIEW_SANDBOX_DEVICES.desktop;
}

/** device prop → 设备外框类型；desktop 与自由尺寸没有对应机型外框，返回 null。 */
export function resolveFrameKind(
  device: PreviewSandboxDeviceProp | undefined,
): PreviewSandboxFrameKind | null {
  if (!device || typeof device === "object") return null;
  return device in FRAME_KINDS ? (device as PreviewSandboxFrameKind) : null;
}

export interface PreviewScaleInput {
  /** 可用容器宽（px）。未测量时传 0。 */
  outerW: number;
  /** 可用容器高（px）。未测量时传 0。 */
  outerH: number;
  viewportW: number;
  viewportH: number;
  /** "fit" = 等比缩到装得下；数字 = 直接用该倍数。 */
  scale: "fit" | number;
}

/**
 * 算内容缩放系数。
 *
 * 与 [FitScreen](../fit-screen/fit-screen.md) 的 `computeFit` 的关键差别：**fit 永不放大**
 * （上限 1）。大屏可视化把 1920 设计稿铺满是正确的，但把 390px 的手机预览拉伸到 800px 宽
 * 只会得到一个「巨人手机」——字号、点击区、断点全部失真，看到的东西不再是真机效果。
 *
 * 容器还没测量到（尺寸为 0）时返回 1 而不是 0：首帧按原尺寸画，随后 ResizeObserver 会纠正，
 * 返回 0 会让预览在首帧彻底消失并闪一下。
 */
export function computePreviewScale({
  outerW,
  outerH,
  viewportW,
  viewportH,
  scale,
}: PreviewScaleInput): number {
  if (typeof scale === "number") {
    return Number.isFinite(scale) && scale > 0 ? scale : 1;
  }
  if (outerW <= 0 || outerH <= 0 || viewportW <= 0 || viewportH <= 0) return 1;
  return Math.min(1, outerW / viewportW, outerH / viewportH);
}
