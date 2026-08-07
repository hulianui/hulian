"use client";
// ElementSelectionOverlay 元素选择叠加层（零依赖自研 · 「指向编辑」的基础设施）。
//
// 机制：
//   · 目标可以是普通容器，也可以是**同源** iframe —— 后者读 contentDocument 拿到 realm 内的
//     document，监听装在那个 document 上。跨源读不到 → 明确报错（onError + 开发期告警），
//     绝不装作接上了然后静默失效。
//   · 高亮框画在**宿主** document.body 的 portal 层里（fixed + pointer-events:none），
//     一个字节都不写进目标文档：不加 class、不加 style、不插节点。目标是别人的树，
//     污染它意味着「预览」不再等于「产物」。
//   · 跟随：目标滚动 / 宿主滚动 / resize / MutationObserver（DOM 变化）/ ResizeObserver /
//     IntersectionObserver（进出视口）全部触发重算，rAF 节流合并到一帧；卸载时逐个断开。
//   · iframe 内元素的 rect 是相对 iframe 视口的，必须叠加 iframe 自身 boundingRect + 边框宽度
//     才是宿主坐标（toHostRect）。
//   · 路径优先读标记属性（data-hulian-path），读不到回退结构化选择器 —— 两者都是纯函数，带单测。
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { useComponentLocale } from "../config/locale-context";
import {
  asElement,
  DEFAULT_COMPONENT_ATTRIBUTE,
  DEFAULT_PATH_ATTRIBUTE,
  elementPath,
  pathLabel,
  resolveElementByPath,
  type ElementPathOptions,
  type ElementPathSource,
} from "./element-path";
import {
  computeLabelPosition,
  isRectVisible,
  toHostRect,
  type LabelPosition,
  type OverlayOffset,
  type OverlayRect,
} from "./overlay-geometry";
import type {
  ElementSelectionDetail,
  ElementSelectionOverlayError,
  ElementSelectionOverlayProps,
} from "./element-selection-overlay.types";

/** 标签高度由自身样式固定（text-[11px] / leading-4 + py-0.5），无需测量即可判断贴顶翻转。 */
const LABEL_HEIGHT = 20;

interface Scope {
  root: Element;
  doc: Document;
  win: Window & typeof globalThis;
  /** 目标是 iframe 时的框架元素（用于坐标偏移与尺寸观察），同文档时为 null。 */
  frame: HTMLIFrameElement | null;
}

/** 失败原因的**文案键**。公开的 code 只有两个值，但 no-document 有两种成因、两句不同的说明。 */
type ScopeFailureKey = "crossOrigin" | "noFrameDocument" | "noDocument";

interface ScopeFailure {
  code: ElementSelectionOverlayError["code"];
  messageKey: ScopeFailureKey;
  target: Element | null;
}

interface ScopeResult {
  scope: Scope | null;
  failure: ScopeFailure | null;
}

/** 内置兜底：没包 ConfigProvider 时仍要给出可读的中文说明。 */
const FALLBACK_MESSAGES: Record<ScopeFailureKey, string> = {
  crossOrigin:
    "读不到 iframe 的 contentDocument：跨源 iframe 无法被接管，请改用同源预览（srcdoc / 同源代理），或在被预览页内自行挂载叠加层并把 path 通过 postMessage 回传宿主。",
  noFrameDocument: "iframe 尚未插入文档，没有可用的 contentDocument。",
  noDocument: "目标元素不在任何文档中。",
};

interface Tracked {
  element: Element;
  path: string;
  source: ElementPathSource;
  component: string | null;
  label: string;
}

interface BoxState {
  path: string;
  label: string;
  rect: OverlayRect;
}

const EMPTY_SCOPE: ScopeResult = { scope: null, failure: null };

function isIframe(node: unknown): node is HTMLIFrameElement {
  const el = asElement(node);
  return !!el && el.tagName === "IFRAME";
}

/** 目标 → 作用域。跨源 iframe 在这里被识别出来并给出明确 error，而不是返回一个「看起来能用」的空壳。 */
function resolveScope(target: Element | null): ScopeResult {
  if (!target) return EMPTY_SCOPE;
  if (isIframe(target)) {
    let doc: Document | null = null;
    try {
      doc = target.contentDocument;
    } catch {
      // 跨源访问在部分浏览器里是抛 SecurityError 而不是返回 null。
      doc = null;
    }
    const win = doc?.defaultView ?? null;
    if (!doc || !win) {
      return {
        scope: null,
        failure: {
          code: target.isConnected ? "cross-origin" : "no-document",
          messageKey: target.isConnected ? "crossOrigin" : "noFrameDocument",
          target,
        },
      };
    }
    const root = doc.body ?? doc.documentElement;
    return { scope: { root, doc, win, frame: target }, failure: null };
  }
  const doc = target.ownerDocument;
  const win = doc?.defaultView ?? null;
  if (!doc || !win) {
    return {
      scope: null,
      failure: { code: "no-document", messageKey: "noDocument", target },
    };
  }
  return { scope: { root: target, doc, win, frame: null }, failure: null };
}

/** iframe 内容坐标系相对宿主视口的偏移 = iframe rect + 自身边框宽度。 */
function frameOffsetOf(frame: HTMLIFrameElement | null): OverlayOffset | null {
  if (!frame) return null;
  const rect = frame.getBoundingClientRect();
  const cs = frame.ownerDocument?.defaultView?.getComputedStyle(frame);
  const borderLeft = Number.parseFloat(cs?.borderLeftWidth ?? "0") || 0;
  const borderTop = Number.parseFloat(cs?.borderTopWidth ?? "0") || 0;
  return { left: rect.left + borderLeft, top: rect.top + borderTop };
}

function sameRect(a: OverlayRect, b: OverlayRect): boolean {
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

function sameBox(a: BoxState | null, b: BoxState | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.path === b.path && a.label === b.label && sameRect(a.rect, b.rect);
}

function sameLabelPos(a: LabelPosition | null, b: LabelPosition | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.top === b.top && a.left === b.left && a.placement === b.placement;
}

function matchesClosest(el: Element, selector: string): Element | null {
  try {
    return el.closest(selector);
  } catch {
    // 非法选择器不该炸掉整个预览，按「没匹配上」处理。
    return null;
  }
}

export function ElementSelectionOverlay({
  target,
  enabled = true,
  highlightSelector,
  ignoreSelector,
  showLabel = true,
  pathAttribute = DEFAULT_PATH_ATTRIBUTE,
  componentAttribute = DEFAULT_COMPONENT_ATTRIBUTE,
  anchorOnId = true,
  selectedPath,
  interceptClicks = true,
  onSelect,
  onHover,
  onClear,
  onError,
  zIndex = 100,
  className,
}: ElementSelectionOverlayProps) {
  const controlled = selectedPath !== undefined;
  // 错误说明取自 locale（ConfigProvider 决定语言），没包 Provider 时回落内置中文。
  const messages = useComponentLocale().elementSelectionOverlay ?? FALLBACK_MESSAGES;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [scopeResult, setScopeResult] = useState<ScopeResult>(EMPTY_SCOPE);
  const { scope } = scopeResult;

  const [hoverBox, setHoverBox] = useState<BoxState | null>(null);
  const [selectedBox, setSelectedBox] = useState<BoxState | null>(null);
  const [labelPos, setLabelPos] = useState<LabelPosition | null>(null);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const labelWidthRef = useRef(0);
  const hoverRef = useRef<Tracked | null>(null);
  const selectedRef = useRef<Tracked | null>(null);
  const lastHoverTargetRef = useRef<unknown>(null);
  const rafRef = useRef<number | null>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);

  // window / document 级监听必须用稳定 handler（否则每次 render 都在拆装监听），
  // 但 handler 里要读到最新 props —— 统一走 latest ref，避免过期闭包。
  const latest = useRef({
    onSelect,
    onHover,
    onClear,
    onError,
    highlightSelector,
    ignoreSelector,
    showLabel,
    controlled,
    pathOptions: { pathAttribute, componentAttribute, anchorOnId } as ElementPathOptions,
    scope,
    messages,
  });
  useEffect(() => {
    latest.current = {
      onSelect,
      onHover,
      onClear,
      onError,
      highlightSelector,
      ignoreSelector,
      showLabel,
      controlled,
      pathOptions: { pathAttribute, componentAttribute, anchorOnId },
      scope,
      messages,
    };
  });

  // 目标解析：iframe 内页导航后 contentDocument 会换一份，靠 load 事件重新接管。
  useEffect(() => {
    const el = asElement(target);
    const resolve = () => setScopeResult(resolveScope(el));
    resolve();
    if (!isIframe(el)) return;
    el.addEventListener("load", resolve);
    return () => el.removeEventListener("load", resolve);
  }, [target]);

  // 目标不可接管 → 报一次错（同一 target 只报一次，onError 与开发期告警都不刷屏）。
  useEffect(() => {
    const failure = scopeResult.failure;
    if (!failure) return;
    const error: ElementSelectionOverlayError = {
      code: failure.code,
      message: latest.current.messages[failure.messageKey],
      target: failure.target,
    };
    latest.current.onError?.(error);
    warnOnce(
      `element-selection-overlay:${error.code}`,
      `[瑚琏] ElementSelectionOverlay：${error.message}`,
    );
  }, [scopeResult]);

  /** 量一个被跟踪元素 → 宿主视口坐标的框；元素已脱离目标树或不可见时给 null。 */
  const measure = useCallback((tracked: Tracked | null, offset: OverlayOffset | null): BoxState | null => {
    const s = latest.current.scope;
    if (!s || !tracked || !s.root.contains(tracked.element)) return null;
    const r = tracked.element.getBoundingClientRect();
    const rect = toHostRect({ top: r.top, left: r.left, width: r.width, height: r.height }, offset);
    if (typeof window === "undefined") return null;
    if (!isRectVisible(rect, { width: window.innerWidth, height: window.innerHeight })) return null;
    return { path: tracked.path, label: tracked.label, rect };
  }, []);

  const syncNow = useCallback(() => {
    if (typeof window === "undefined") return;
    const s = latest.current.scope;
    const offset = s ? frameOffsetOf(s.frame) : null;
    const nextHover = measure(hoverRef.current, offset);
    const nextSelected = measure(selectedRef.current, offset);
    // hover 与 selected 落在同一元素时只画选中框（两层边框叠一起既丑又看不出区别）。
    const dedupedHover = nextHover && nextSelected && nextHover.path === nextSelected.path ? null : nextHover;
    setHoverBox((prev) => (sameBox(prev, dedupedHover) ? prev : dedupedHover));
    setSelectedBox((prev) => (sameBox(prev, nextSelected) ? prev : nextSelected));

    const active = dedupedHover ?? nextSelected;
    const nextLabel =
      active && latest.current.showLabel
        ? computeLabelPosition(
            active.rect,
            { width: labelWidthRef.current, height: LABEL_HEIGHT },
            { width: window.innerWidth, height: window.innerHeight },
          )
        : null;
    setLabelPos((prev) => (sameLabelPos(prev, nextLabel) ? prev : nextLabel));
  }, [measure]);

  /** 连续事件（滚动 / resize / DOM 变化）走 rAF 合帧；离散事件直接 syncNow。 */
  const requestSync = useCallback(() => {
    if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
      syncNow();
      return;
    }
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      syncNow();
    });
  }, [syncNow]);

  useEffect(
    () => () => {
      if (rafRef.current != null && typeof window !== "undefined") {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    },
    [],
  );

  /** 被跟踪元素变化 → 重新挂 IntersectionObserver（只观察当前这一两个元素，不铺全树）。 */
  const retrack = useCallback(() => {
    const io = ioRef.current;
    if (!io) return;
    io.disconnect();
    for (const tracked of [hoverRef.current, selectedRef.current]) {
      if (tracked) io.observe(tracked.element);
    }
  }, []);

  const commit = useCallback(
    (next: { hover?: Tracked | null; selected?: Tracked | null }) => {
      if ("hover" in next) hoverRef.current = next.hover ?? null;
      if ("selected" in next) selectedRef.current = next.selected ?? null;
      retrack();
      syncNow();
    },
    [retrack, syncNow],
  );

  /** 元素 → 跟踪项 + 对外 detail（不含选择器过滤，供受控回填复用）。 */
  const describeElement = useCallback(
    (el: Element): { tracked: Tracked; detail: ElementSelectionDetail } | null => {
      const s = latest.current.scope;
      if (!s) return null;
      const result = elementPath(el, s.root, latest.current.pathOptions);
      if (!result) return null;
      const label = pathLabel(result.path, result.component);
      const r = result.element.getBoundingClientRect();
      const rect = toHostRect(
        { top: r.top, left: r.left, width: r.width, height: r.height },
        frameOffsetOf(s.frame),
      );
      return {
        tracked: {
          element: result.element,
          path: result.path,
          source: result.source,
          component: result.component,
          label,
        },
        detail: {
          path: result.path,
          source: result.source,
          component: result.component,
          tagName: result.element.tagName.toLowerCase(),
          element: result.element,
          rect,
        },
      };
    },
    [],
  );

  /** 指针落点 → 候选元素（应用 ignoreSelector / highlightSelector 过滤）。 */
  const describeEventTarget = useCallback(
    (node: unknown): { tracked: Tracked; detail: ElementSelectionDetail } | null => {
      const s = latest.current.scope;
      const hit = asElement(node);
      if (!s || !hit || hit === s.root || !s.root.contains(hit)) return null;
      const { ignoreSelector: ignore, highlightSelector: only } = latest.current;
      if (ignore && matchesClosest(hit, ignore)) return null;
      const candidate = only ? matchesClosest(hit, only) : hit;
      if (!candidate || candidate === s.root || !s.root.contains(candidate)) return null;
      return describeElement(candidate);
    },
    [describeElement],
  );

  // 目标文档上的指针 / 键盘监听。enabled=false 时整体不挂，且清空 hover（选中框保留）。
  useEffect(() => {
    if (!scope) return;
    if (!enabled) {
      lastHoverTargetRef.current = null;
      if (hoverRef.current) commit({ hover: null });
      return;
    }
    const { doc, root } = scope;

    const applyHover = (found: ReturnType<typeof describeEventTarget>) => {
      const prevPath = hoverRef.current?.path ?? null;
      const nextPath = found?.detail.path ?? null;
      commit({ hover: found?.tracked ?? null });
      if (nextPath !== prevPath) latest.current.onHover?.(nextPath, found?.detail ?? null);
    };

    const onPointerMove = (e: Event) => {
      // 同一元素上的连续移动直接跳过：pointermove 每秒几十上百次，路径解析不必重复做。
      if (e.target === lastHoverTargetRef.current) return;
      lastHoverTargetRef.current = e.target;
      applyHover(describeEventTarget(e.target));
    };
    const onLeave = () => {
      lastHoverTargetRef.current = null;
      applyHover(null);
    };
    // 目标是普通容器时 doc 就是宿主 document，监听必须自己判边界，否则整页被接管。
    // iframe 分支下 root 是 iframe 的 body，这条判断天然恒真，两种场景共用一套代码。
    const inTarget = (node: unknown) => {
      const el = asElement(node);
      return !!el && (el === root || root.contains(el));
    };
    const onMouseDown = (e: Event) => {
      // 只挡默认行为（聚焦 / 选中文本 / 拖拽），不动 hover 与选中态。
      if (!inTarget(e.target)) return;
      e.preventDefault();
    };
    const select = (found: NonNullable<ReturnType<typeof describeEventTarget>>) => {
      if (!latest.current.controlled) commit({ selected: found.tracked });
      latest.current.onSelect?.(found.detail.path, found.detail);
    };
    const clear = () => {
      if (!latest.current.controlled) commit({ selected: null });
      latest.current.onClear?.();
    };
    const onClick = (e: Event) => {
      // 目标外的点击一概不管：既不拦截，也不清空选中（否则消费方的属性面板一点就空）。
      if (!inTarget(e.target)) return;
      if (interceptClicks) {
        e.preventDefault();
        e.stopPropagation();
      }
      const found = describeEventTarget(e.target);
      if (found) select(found);
      else clear();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clear();
        return;
      }
      // 键盘可达：目标里 Tab 到某个元素后按 Enter / 空格即选中它（否则本组件是纯指针操作）。
      if (e.key === "Enter" || e.key === " ") {
        const active = asElement(doc.activeElement);
        if (!active) return;
        const found = describeEventTarget(active);
        if (!found) return;
        e.preventDefault();
        select(found);
      }
    };

    doc.addEventListener("pointermove", onPointerMove, true);
    doc.addEventListener("click", onClick, true);
    doc.addEventListener("keydown", onKeyDown, true);
    root.addEventListener("pointerleave", onLeave);
    if (interceptClicks) doc.addEventListener("mousedown", onMouseDown, true);
    return () => {
      doc.removeEventListener("pointermove", onPointerMove, true);
      doc.removeEventListener("click", onClick, true);
      doc.removeEventListener("keydown", onKeyDown, true);
      root.removeEventListener("pointerleave", onLeave);
      doc.removeEventListener("mousedown", onMouseDown, true);
    };
  }, [scope, enabled, interceptClicks, commit, describeEventTarget]);

  // 跟随：宿主与目标两侧的 scroll / resize + 三个 Observer。全部在 cleanup 里断开。
  useEffect(() => {
    if (!scope) return;
    const handler = () => requestSync();
    const windows: (Window & typeof globalThis)[] = [scope.win];
    if (typeof window !== "undefined" && window !== scope.win) windows.push(window);
    for (const w of windows) {
      w.addEventListener("scroll", handler, true);
      w.addEventListener("resize", handler);
    }

    const MO = scope.win.MutationObserver;
    const mo = MO
      ? new MO((records) => {
          // 目标根恰好是 body 时，我们的 portal 层也在它内部 —— 不过滤会自触发死循环。
          const overlay = overlayRef.current;
          if (overlay && records.every((r) => overlay.contains(r.target))) return;
          requestSync();
        })
      : null;
    mo?.observe(scope.root, { childList: true, subtree: true, attributes: true });

    const RO = scope.win.ResizeObserver;
    const ro = RO ? new RO(handler) : null;
    ro?.observe(scope.root);
    if (scope.frame) ro?.observe(scope.frame);

    const IO = scope.win.IntersectionObserver;
    // root: null = 目标自己的视口（iframe 内即 iframe 视口），元素进出视口时补一次重算。
    const io = IO ? new IO(handler, { threshold: [0, 1] }) : null;
    ioRef.current = io ?? null;
    retrack();

    requestSync();
    return () => {
      for (const w of windows) {
        w.removeEventListener("scroll", handler, true);
        w.removeEventListener("resize", handler);
      }
      mo?.disconnect();
      ro?.disconnect();
      io?.disconnect();
      ioRef.current = null;
    };
  }, [scope, requestSync, retrack]);

  // 受控选中：path → 元素回查。目标换了 / path 变了都要重查（元素引用会失效）。
  useEffect(() => {
    if (!controlled) return;
    if (!scope) {
      commit({ selected: null });
      return;
    }
    const el = selectedPath
      ? resolveElementByPath(scope.root, selectedPath, { pathAttribute, componentAttribute, anchorOnId })
      : null;
    commit({ selected: el ? (describeElement(el)?.tracked ?? null) : null });
  }, [
    controlled,
    selectedPath,
    scope,
    pathAttribute,
    componentAttribute,
    anchorOnId,
    commit,
    describeElement,
  ]);

  // 标签宽度是右侧夹取的输入。用 layout effect 量完立刻补一次 sync，
  // 这样宽度在同一次提交里生效，不会先画到视口外再跳回来。
  useLayoutEffect(() => {
    const el = labelRef.current;
    const width = el?.offsetWidth ?? 0;
    if (width === labelWidthRef.current) return;
    labelWidthRef.current = width;
    syncNow();
  });

  if (!mounted || !scope || typeof document === "undefined") return null;

  const labelBox = hoverBox ?? selectedBox;

  return createPortal(
    <div
      ref={overlayRef}
      aria-hidden
      data-part="overlay"
      className={cn("pointer-events-none fixed inset-0", className)}
      style={{ zIndex }}
    >
      {hoverBox && (
        <div
          data-part="hover"
          data-path={hoverBox.path}
          className="absolute rounded-[min(var(--radius),0.375rem)] border border-dashed border-primary/60 bg-primary/5"
          style={{
            top: hoverBox.rect.top,
            left: hoverBox.rect.left,
            width: hoverBox.rect.width,
            height: hoverBox.rect.height,
          }}
        />
      )}
      {selectedBox && (
        <div
          data-part="selected"
          data-path={selectedBox.path}
          className="absolute rounded-[min(var(--radius),0.375rem)] border-2 border-solid border-primary bg-primary/10"
          style={{
            top: selectedBox.rect.top,
            left: selectedBox.rect.left,
            width: selectedBox.rect.width,
            height: selectedBox.rect.height,
          }}
        />
      )}
      {showLabel && labelBox && labelPos && (
        <div
          ref={labelRef}
          data-part="label"
          data-placement={labelPos.placement}
          className="absolute max-w-[16rem] truncate rounded-[min(var(--radius),0.25rem)] bg-primary px-1.5 text-[11px] font-medium leading-5 text-primary-foreground shadow-sm"
          style={{ top: labelPos.top, left: labelPos.left }}
        >
          {labelBox.label}
        </div>
      )}
    </div>,
    document.body,
  );
}
