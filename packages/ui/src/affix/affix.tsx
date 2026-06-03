"use client";
// 自研 Affix 固钉（零依赖）。
// 机制：占位元素始终在文档流里撑住原始高度（防内容切 fixed 后塌陷跳动）；
//   滚动/缩放时按占位元素的 getBoundingClientRect 与容器边界比对判定吸附态。
//   · offsetTop：占位顶 < 容器顶+offsetTop → 内容切 position:fixed 钉到容器顶+offsetTop。
//   · offsetBottom：占位底 > 容器底-offsetBottom → 钉到容器底-offsetBottom。
//   固定态用占位元素的实时 left/width 对齐（块级占位宽度随容器自适应，故横向天然响应）。
//   占位高度在吸附时冻结 = 内容高度，未吸附时 auto。
// 阈值用占位元素（始终在流里）判定 → 吸/脱附对称、无抖动反馈环。
// target 为元素时（自定义滚动容器），fixed 仍相对视口定位（按容器视口坐标算）——
//   与原生 Affix 行为一致，容器在视口内即正确。
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { cn } from "../lib/cn";
import type { AffixProps, AffixTarget } from "./affix.types";

function resolveTarget(target: AffixTarget | undefined): HTMLElement | Window | null {
  if (typeof target === "function") return target() ?? null;
  if (target) return target;
  return typeof window !== "undefined" ? window : null;
}

// 容器在视口中的上/下边界（window → 0 / innerHeight；元素 → 其 rect）。
function containerBounds(t: HTMLElement | Window | null) {
  if (typeof HTMLElement !== "undefined" && t instanceof HTMLElement) {
    const r = t.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom };
  }
  const h = typeof window !== "undefined" ? window.innerHeight : 0;
  return { top: 0, bottom: h };
}

interface AffixState {
  affixed: boolean;
  style?: CSSProperties;
  height?: number;
}

export function Affix({
  children,
  offsetTop,
  offsetBottom,
  target,
  onChange,
  affixedClassName,
  className,
  style: styleProp,
  ...rest
}: AffixProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<AffixState>({ affixed: false });

  // 用 ref 镜像，让 measure 闭包读最新值且自身稳定（不随 onChange/state 重建）。
  const stateRef = useRef(state);
  stateRef.current = state;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const measure = useCallback(() => {
    const placeholder = placeholderRef.current;
    const content = contentRef.current;
    if (!placeholder || !content) return;

    const bounds = containerBounds(resolveTarget(target));
    const pRect = placeholder.getBoundingClientRect();
    const height = content.offsetHeight;
    const width = pRect.width;

    const useBottom = offsetTop == null && offsetBottom != null;
    let affixed = false;
    let nextStyle: CSSProperties | undefined;

    if (useBottom) {
      const ob = offsetBottom ?? 0;
      affixed = pRect.bottom > bounds.bottom - ob;
      if (affixed) {
        nextStyle = {
          position: "fixed",
          top: bounds.bottom - ob - height,
          left: pRect.left,
          width,
        };
      }
    } else {
      const ot = offsetTop ?? 0;
      affixed = pRect.top < bounds.top + ot;
      if (affixed) {
        nextStyle = {
          position: "fixed",
          top: bounds.top + ot,
          left: pRect.left,
          width,
        };
      }
    }

    const prev = stateRef.current;
    const nextHeight = affixed ? height : undefined;
    const unchanged =
      prev.affixed === affixed &&
      prev.height === nextHeight &&
      prev.style?.top === nextStyle?.top &&
      prev.style?.left === nextStyle?.left &&
      prev.style?.width === nextStyle?.width;
    if (unchanged) return;

    setState({ affixed, style: nextStyle, height: nextHeight });
    if (prev.affixed !== affixed) onChangeRef.current?.(affixed);
  }, [target, offsetTop, offsetBottom]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    const t = resolveTarget(target);
    const scrollTarget: HTMLElement | Window =
      typeof HTMLElement !== "undefined" && t instanceof HTMLElement ? t : window;

    scrollTarget.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // 容器是元素时，窗口滚动也会改变其在视口中的位置 → 一并监听。
    if (scrollTarget !== window) {
      window.addEventListener("scroll", schedule, { passive: true });
    }

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    if (ro) {
      if (contentRef.current) ro.observe(contentRef.current);
      if (placeholderRef.current) ro.observe(placeholderRef.current);
    }

    measure(); // 初次（处理首屏即已滚过的场景）

    return () => {
      cancelAnimationFrame(raf);
      scrollTarget.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (scrollTarget !== window) window.removeEventListener("scroll", schedule);
      ro?.disconnect();
    };
  }, [measure, target]);

  const { affixed, style: fixedStyle, height } = state;

  return (
    <div ref={placeholderRef} style={affixed ? { height } : undefined}>
      <div
        ref={contentRef}
        className={cn(className, affixed && affixedClassName)}
        style={affixed ? { ...styleProp, ...fixedStyle } : styleProp}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}
