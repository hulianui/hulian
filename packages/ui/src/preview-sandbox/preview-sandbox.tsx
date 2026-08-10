"use client";
import {
  Component,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { Alert } from "../alert";
import { Android } from "../android";
import { Button } from "../button";
import { IPhone } from "../iphone";
import { Tablet } from "../tablet";
import { Watch } from "../watch";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { useComponentLocale } from "../config/locale-context";
import {
  buildSrcDoc,
  DEFAULT_ERROR_FALLBACKS,
  normalizeIframeMessage,
  normalizeReactError,
  PREVIEW_SANDBOX_DEFAULT_SANDBOX,
  type PreviewSandboxErrorFallbacks,
} from "./preview-sandbox-bridge";
import {
  computePreviewScale,
  resolveFrameKind,
  resolveViewport,
} from "./preview-sandbox-geometry";
import type {
  PreviewSandboxError,
  PreviewSandboxFrameKind,
  PreviewSandboxProps,
} from "./preview-sandbox.types";

// 预览沙箱 = 「外壳」，不是代码执行引擎。
//
// 边界（写在最前面，因为这是本组件最容易被误解的地方）：它**不打包、不转译、不装 npm 包**。
// v0 / Bolt.new 那类能力靠的是 esbuild-wasm / WebContainers，与本库「零依赖源码分发」的约束
// 直接冲突，而且真正的编译本就该由消费方的构建链做。所以 `code` 的语义被明确钉死为
// 「一份已经可以直接送进 iframe 的 HTML 文档串」，绝不是「一段待编译的 JSX」。
//
// 组件负责的是把这几件事一次做对：隔离渲染容器 + 设备视口 + 缩放适配 + 错误捕获 + 就绪/重载生命周期。
// 两种模式共用同一副外壳：
//   · iframe 模式（传 code）——真隔离，错误靠注入脚本 postMessage 回传；
//   · 同文档模式（传 children）——不隔离，但能拿到真正的 React 错误边界与原始 Error。
// 两边的错误对象**形状统一**（PreviewSandboxError），消费方不必按模式写两套分支。

/** 明确放弃隔离的 sandbox 取值：只有需要读 iframe 内部 DOM（如接 ElementSelectionOverlay）时才用。 */
export const PREVIEW_SANDBOX_SAME_ORIGIN_SANDBOX = "allow-scripts allow-same-origin";

interface BoundaryProps {
  onCatch: (error: PreviewSandboxError) => void;
  /** 抛出物没有可读 message 时的兜底文案，跟着 locale 走（见 preview-sandbox-bridge）。 */
  fallbacks: PreviewSandboxErrorFallbacks;
  children: ReactNode;
}

/**
 * 同文档模式的错误边界。
 *
 * 必须是 class 组件：React 至今没有 hooks 版的 componentDidCatch，
 * 「用 try/catch 包一下」在渲染阶段的异步提交里根本拦不住。
 * 失败后渲染 null，错误 UI 由外层统一画（两种模式共用同一套错误态）。
 */
class PreviewErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    this.props.onCatch(normalizeReactError(error, info, this.props.fallbacks));
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * 设备档位 → 既有外框组件。四者的 props 形状一致（width + children），直接复用不再造壳。
 * 键集由 PreviewSandboxFrameKind 约束，而它来自设备真源 —— 真源里加一个机型，
 * 这里漏接就是编译错误，不会再出现「清单里有、这里没有」的静默不同步（#139）。
 */
const FRAMES: Record<PreviewSandboxFrameKind, ComponentType<{ width?: number; children: ReactNode }>> =
  {
    iphone: IPhone,
    android: Android,
    tablet: Tablet,
    watch: Watch,
  };

export function PreviewSandbox({
  code,
  children,
  device = "desktop",
  showDeviceFrame = false,
  frameWidth,
  scale = "fit",
  sandbox = PREVIEW_SANDBOX_DEFAULT_SANDBOX,
  instrument = true,
  title: titleProp,
  errorTitle: errorTitleProp,
  retryLabel: retryLabelProp,
  renderError,
  onError,
  onReady,
  onLoadingChange,
  className,
  ...props
}: PreviewSandboxProps) {
  // 优先级：title / errorTitle / retryLabel prop > ConfigProvider 的 locale > 内置中文兜底。
  const labels = useComponentLocale().previewSandbox ?? {
    title: "预览沙箱",
    errorTitle: "预览渲染失败",
    retry: "重试",
    ...DEFAULT_ERROR_FALLBACKS,
  };
  const title = titleProp ?? labels.title;
  const errorTitle = errorTitleProp ?? labels.errorTitle;
  const retryLabel = retryLabelProp ?? labels.retry;
  // 归一化是纯函数，兜底文案由这里喂进去 —— 否则换英文 locale 后标题是英文、正文仍是中文。
  const errorFallbacks = useMemo(
    () => ({
      iframeError: labels.iframeError,
      iframeRejection: labels.iframeRejection,
      reactError: labels.reactError,
      reactEmpty: labels.reactEmpty,
    }),
    [labels.iframeError, labels.iframeRejection, labels.reactError, labels.reactEmpty],
  );

  const isIframe = typeof code === "string";
  const viewport = resolveViewport(device);
  const frameKind = resolveFrameKind(device);
  const framed = showDeviceFrame && frameKind !== null;

  if (isIframe && children != null) {
    warnOnce(
      "preview-sandbox/code-and-children",
      "[PreviewSandbox] 同时传了 code 与 children：iframe 模式优先，children 被忽略。两种模式请二选一。",
    );
  }
  if (showDeviceFrame && frameKind === null) {
    warnOnce(
      "preview-sandbox/frame-unavailable",
      "[PreviewSandbox] showDeviceFrame 只对 iphone / android / tablet 生效；desktop 与自由尺寸没有对应机型外框。",
    );
  }

  const rootRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [contentScale, setContentScale] = useState(1);
  const [frameScale, setFrameScale] = useState(1);
  const [error, setError] = useState<PreviewSandboxError | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [loading, setLoading] = useState(isIframe);

  // 回调走 ref：消费方经常传内联箭头函数，直接进依赖数组会让监听/测量每次渲染都重挂。
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);
  const onLoadingChangeRef = useRef(onLoadingChange);
  useEffect(() => {
    onErrorRef.current = onError;
    onReadyRef.current = onReady;
    onLoadingChangeRef.current = onLoadingChange;
  });

  // 每个组件实例一个 id：回传消息按它认领，页面上挂多个沙箱不会串台。
  const frameId = useId();

  const srcDoc = useMemo(
    () => (isIframe ? buildSrcDoc(code as string, { frameId, instrument, reloadNonce }) : ""),
    [isIframe, code, frameId, instrument, reloadNonce],
  );

  // 尺寸测量。一律读 offsetWidth / offsetHeight 而不是 getBoundingClientRect：
  // 后者返回的是**变换后**的视觉尺寸，而这里量的元素自己就套着 scale，
  // 用它会形成「越量越小」的反馈环，最终缩成一个点。
  useEffect(() => {
    const measure = () => {
      const screen = screenRef.current;
      if (screen) {
        setContentScale(
          computePreviewScale({
            outerW: screen.offsetWidth,
            outerH: screen.offsetHeight,
            viewportW: viewport.width,
            viewportH: viewport.height,
            scale,
          }),
        );
      }
      const root = rootRef.current;
      const frame = frameRef.current;
      // 外框模式再补一层：机身是固定尺寸的，容器装不下时整机等比缩小，而不是被裁掉半台手机。
      setFrameScale(
        root && frame
          ? computePreviewScale({
              outerW: root.offsetWidth,
              outerH: root.offsetHeight,
              viewportW: frame.offsetWidth,
              viewportH: frame.offsetHeight,
              scale: "fit",
            })
          : 1,
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    for (const el of [rootRef.current, screenRef.current, frameRef.current]) {
      if (el) ro.observe(el);
    }
    return () => ro.disconnect();
  }, [viewport.width, viewport.height, scale, framed, frameWidth]);

  // iframe 内容变了（改 code / 点重试）→ 回到加载中。设备切换不在依赖里，所以切设备不会重载。
  useEffect(() => {
    if (isIframe) setLoading(true);
  }, [isIframe, srcDoc]);

  useEffect(() => {
    onLoadingChangeRef.current?.(loading);
  }, [loading]);

  // 同文档模式没有 load 事件，挂载即就绪；重试后重新触发一次，与 iframe 模式对齐。
  useEffect(() => {
    if (!isIframe) onReadyRef.current?.();
  }, [isIframe, reloadNonce]);

  // 错误回传监听。校验两道：消息里的实例 id + 来源窗口就是自家 iframe。
  // 不校验 event.origin —— 不透明源的 iframe 发出的 origin 恒为 "null"，拿它当条件等于永远不通过。
  useEffect(() => {
    if (!isIframe || !instrument || typeof window === "undefined") return;
    const onMessage = (event: MessageEvent) => {
      const frame = iframeRef.current;
      if (frame && event.source && event.source !== frame.contentWindow) return;
      const next = normalizeIframeMessage(event.data, frameId, errorFallbacks);
      if (!next) return;
      setError(next);
      setLoading(false);
      onErrorRef.current?.(next);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [isIframe, instrument, frameId]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    onReadyRef.current?.();
  }, []);

  const handleReactError = useCallback((next: PreviewSandboxError) => {
    setError(next);
    setLoading(false);
    onErrorRef.current?.(next);
  }, []);

  const retry = useCallback(() => {
    setError(null);
    // iframe 模式：nonce 进 srcDoc → 同一个 iframe 节点重新载入文档。
    // 同文档模式：nonce 作为错误边界的 key → 边界与子树一起重建（不重建的话 failed 状态会粘住）。
    setReloadNonce((n) => n + 1);
  }, []);

  const stage = (
    <div
      className="absolute left-1/2 top-1/2 origin-center"
      style={{
        width: viewport.width,
        height: viewport.height,
        transform: `translate(-50%, -50%) scale(${contentScale})`,
      }}
    >
      {isIframe ? (
        <iframe
          ref={iframeRef}
          title={title}
          srcDoc={srcDoc}
          sandbox={sandbox}
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
          data-frame-id={frameId}
          className="block h-full w-full border-0"
        />
      ) : (
        <PreviewErrorBoundary key={reloadNonce} onCatch={handleReactError} fallbacks={errorFallbacks}>
          {children}
        </PreviewErrorBoundary>
      )}
    </div>
  );

  const screen = (
    <div ref={screenRef} className="relative h-full w-full overflow-hidden">
      {stage}
    </div>
  );

  const Frame = frameKind ? FRAMES[frameKind] : null;

  return (
    <div
      {...props}
      ref={rootRef}
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-bg",
        className,
      )}
    >
      {framed && Frame ? (
        <div
          ref={frameRef}
          className="shrink-0 origin-center"
          style={{ transform: `scale(${frameScale})` }}
        >
          <Frame width={frameWidth}>{screen}</Frame>
        </div>
      ) : (
        screen
      )}

      {error ? (
        renderError ? (
          renderError(error, retry)
        ) : (
          // 错误态盖在预览上而不是替换它：半透明底下还能看见上一次渲染结果，
          // 「改了什么导致崩的」比「一片空白」好排查得多。
          // 外层不再挂 role="alert"：Alert 在 danger 语气下自己就是 alert，
          // 两层同角色会让屏幕阅读器读两遍，也让 getByRole("alert") 拿到两个节点。
          <div className="absolute inset-0 z-10 flex items-center justify-center overflow-auto bg-bg/85 p-4">
            <Alert
              tone="danger"
              title={errorTitle}
              className="max-w-md"
              action={
                <Button size="sm" variant="outline" tone="danger" onClick={retry}>
                  {retryLabel}
                </Button>
              }
            >
              <p className="break-words text-sm text-muted-foreground">{error.message}</p>
              {error.filename ? (
                <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                  {error.filename}
                  {error.lineno === null ? "" : `:${error.lineno}`}
                </p>
              ) : null}
            </Alert>
          </div>
        )
      ) : null}
    </div>
  );
}
