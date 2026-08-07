import type { HTMLAttributes, ReactNode } from "react";
import type { DeviceKind } from "../lib/device-metrics";

/**
 * 内置设备档位。自由尺寸直接传 `{ width, height }`。
 * `desktop` 是无外框档；其余与 mockups 分类的外框件一一对应（真源 lib/device-metrics）。
 */
export type PreviewSandboxDevice = "desktop" | DeviceKind;

/** 预览视口的 CSS 像素尺寸——这就是预览内容里 `window.innerWidth` / 媒体查询看到的值。 */
export interface PreviewSandboxViewport {
  width: number;
  height: number;
}

export type PreviewSandboxDeviceProp = PreviewSandboxDevice | PreviewSandboxViewport;

/** 有设备外框可用的档位（desktop 与自由尺寸没有对应机型外框）。 */
/** 有设备外框可用的档位 = 真源里登记的全部机型。 */
export type PreviewSandboxFrameKind = DeviceKind;

export type PreviewSandboxErrorSource = "iframe" | "react";

export type PreviewSandboxErrorKind = "error" | "unhandledrejection";

/**
 * 两种模式统一的错误形状。
 *
 * iframe 模式的错误来自另一个 realm（甚至是不透明源），拿不到真正的 Error 实例，
 * 只能拿到被 postMessage 结构化克隆过的字段；同文档模式则能拿到原始 Error。
 * 与其让消费方按模式写两套分支，不如统一成一个形状，用 `source` 区分来源、
 * `error` 只在拿得到时才非 null。
 */
export interface PreviewSandboxError {
  /** 错误来自 iframe 内的脚本，还是同文档模式下 React 子树的渲染。 */
  source: PreviewSandboxErrorSource;
  /** 同步抛出，还是未处理的 Promise 拒绝。 */
  kind: PreviewSandboxErrorKind;
  /** 可直接展示的错误信息（永不为空串）。 */
  message: string;
  /** 调用栈；拿不到为 null。 */
  stack: string | null;
  /** 出错脚本地址（仅 iframe 模式的同步错误可能有）。 */
  filename: string | null;
  /** 出错行号；拿不到为 null。 */
  lineno: number | null;
  /** 出错列号；拿不到为 null。 */
  colno: number | null;
  /** React 组件栈（仅同文档模式）。 */
  componentStack: string | null;
  /** 原始 Error 实例；iframe 模式跨 realm 拿不到，恒为 null。 */
  error: Error | null;
}

export interface PreviewSandboxProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children" | "onError"> {
  /**
   * iframe 模式的内容：**一份可以直接送进 iframe 的完整 HTML 文档串**（写进 `srcDoc`）。
   * 本组件不打包、不转译、不装 npm 包——传一段 JSX / TSX 进来不会被编译，只会当纯文本渲染。
   */
  code?: string;
  /** 同文档模式的内容：直接渲染的 React 子树（不进 iframe，走真正的错误边界）。`code` 存在时忽略。 */
  children?: ReactNode;
  /** 预览视口。内置档位或自由 `{ width, height }`。@default "desktop" */
  device?: PreviewSandboxDeviceProp;
  /** 是否套设备外框（仅 iphone / android / tablet 有外框）。@default false */
  showDeviceFrame?: boolean;
  /** 设备外框机身宽度 px；不传用对应外框组件的默认宽度。 */
  frameWidth?: number;
  /** 内容缩放：`"fit"` 等比缩到装得下（**不放大**），或直接给定倍数。@default "fit" */
  scale?: "fit" | number;
  /** iframe 的 `sandbox` 属性。@default "allow-scripts" */
  sandbox?: string;
  /** 是否往 `code` 里注入错误转发引导脚本。关掉则 iframe 内的运行时错误收不到。@default true */
  instrument?: boolean;
  /** iframe 的无障碍名称。@default "预览沙箱" */
  title?: string;
  /** 错误态标题。@default "预览渲染失败" */
  errorTitle?: string;
  /** 重试按钮文案。@default "重试" */
  retryLabel?: string;
  /** 自定义错误态渲染；给了就完全接管（含重试入口）。 */
  renderError?: (error: PreviewSandboxError, retry: () => void) => ReactNode;
  /** 预览内出错（iframe 运行时错误 / React 错误边界捕获）。 */
  onError?: (error: PreviewSandboxError) => void;
  /** 预览就绪：iframe 模式为 `load` 之后，同文档模式为挂载之后。每次重载都会再触发一次。 */
  onReady?: () => void;
  /** 加载态变化。同文档模式恒为 false。 */
  onLoadingChange?: (loading: boolean) => void;
}
