"use client";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { CurvedLoopProps } from "./curved-loop.types";

// 吸取自 React Bits CurvedLoop：SVG <textPath> 把跑马灯文字贴着一条二次贝塞尔曲线无缝循环滚动，
// 文字首尾拼接铺满弧线，可拖拽拨动、松手后沿拖拽方向续滚。
// 瑚琏化：
// 1. 去掉写死的 fill:#fff / text-transform:uppercase / min-h-screen 全屏壳——fill 走 currentColor，
//    颜色由父级 text-* token（默认 text-foreground）控制，明暗自适配；尺寸交给容器。
// 2. rAF 直接驱动 startOffset（不触发 React 逐帧重渲），useReducedMotion() gate：
//    减弱动效时停止自动滚动但保留拖拽，且 DOM 始终一致（文字不消失，避 reveal 不可见坑）。
// 3. getComputedTextLength 是浏览器 API，jsdom 下返回 0 → ready 永假但组件仍安全渲染（测试友好）。
// 4. 纯 React + 原生 SVG，无新增依赖。

/**
 * 松手时根据拖拽末速度决定续滚方向（纯函数，便于测试）。
 * - vel > 0（向右拖）→ "right"
 * - vel < 0（向左拖）→ "left"
 * - vel === 0（纯点击，无位移）→ 保持当前方向，不翻转
 */
export function resolveReleaseDirection(
  vel: number,
  current: "left" | "right",
): "left" | "right" {
  if (vel > 0) return "right";
  if (vel < 0) return "left";
  return current;
}

export function CurvedLoop({
  text = "瑚琏 · HULIAN · ",
  speed = 2,
  curveAmount = 320,
  direction = "left",
  interactive = true,
  className,
  ...props
}: CurvedLoopProps) {
  // 规整文案：去尾部空白再补一个不间断空格作词间隔
  const marquee = useMemo(() => {
    const trimmed = text.replace(/[\s ]+$/, "");
    return trimmed + " ";
  }, [text]);

  const reduce = useReducedMotion();
  const measureRef = useRef<SVGTextElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);

  const uid = useId().replace(/[:]/g, "");
  const pathId = `hl-curve-${uid}`;
  const pathD = `M-100,40 Q720,${40 + curveAmount} 1540,40`;

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const velRef = useRef(0);
  const dirRef = useRef(direction);

  // 自动滚动方向受控同步
  useEffect(() => {
    dirRef.current = direction;
  }, [direction]);

  const ready = spacing > 0;
  // 拼接足够份数铺满弧线（按单词宽度推算，留 2 份余量）
  const totalText = ready
    ? Array(Math.ceil(1800 / spacing) + 2)
        .fill(marquee)
        .join("")
    : marquee;

  // 测量单词宽度（浏览器 API；jsdom 无此方法 → 安全跳过，spacing 保持 0）
  useEffect(() => {
    const node = measureRef.current;
    if (node && typeof node.getComputedTextLength === "function") {
      const len = node.getComputedTextLength();
      if (len > 0) setSpacing(len);
    }
  }, [marquee, className]);

  // 初始把文字推到左侧一个词宽，留出无缝循环的回卷空间
  useEffect(() => {
    if (!spacing) return;
    const initial = -spacing;
    setOffset(initial);
    textPathRef.current?.setAttribute("startOffset", `${initial}px`);
  }, [spacing]);

  // rAF 自动滚动（reduced-motion 下不启动）
  useEffect(() => {
    if (!ready || reduce) return;
    let frame = 0;
    const step = () => {
      const tp = textPathRef.current;
      if (tp && !dragRef.current) {
        const delta = dirRef.current === "right" ? speed : -speed;
        let next =
          parseFloat(tp.getAttribute("startOffset") || "0") + delta;
        if (next <= -spacing) next += spacing;
        if (next > 0) next -= spacing;
        tp.setAttribute("startOffset", `${next}px`);
        setOffset(next);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [ready, reduce, speed, spacing]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!interactive) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const tp = textPathRef.current;
    if (!interactive || !dragRef.current || !tp) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;
    let next = parseFloat(tp.getAttribute("startOffset") || "0") + dx;
    if (next <= -spacing) next += spacing;
    if (next > 0) next -= spacing;
    tp.setAttribute("startOffset", `${next}px`);
    setOffset(next);
  };

  const endDrag = () => {
    if (!interactive) return;
    dragRef.current = false;
    // 仅在确有拖拽位移时按拖拽方向续滚；纯点击（vel=0）保持原方向不翻转。
    dirRef.current = resolveReleaseDirection(velRef.current, dirRef.current);
    velRef.current = 0;
  };

  return (
    <div
      className={cn(
        "w-full select-none",
        interactive ? "cursor-grab active:cursor-grabbing" : "cursor-auto",
      )}
      style={{ visibility: ready ? "visible" : "hidden" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <svg
        viewBox="0 0 1440 120"
        className={cn(
          "block w-full overflow-visible fill-current text-foreground",
          "text-[6rem] font-bold leading-none [aspect-ratio:100/12]",
          className,
        )}
        {...props}
      >
        {/* 隐藏测量节点：取单词宽度用于无缝拼接 */}
        <text
          ref={measureRef}
          xmlSpace="preserve"
          className="pointer-events-none opacity-0"
          style={{ visibility: "hidden" }}
        >
          {marquee}
        </text>
        <defs>
          <path id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>
        {ready && (
          <text fontWeight="bold" xmlSpace="preserve">
            <textPath
              ref={textPathRef}
              href={`#${pathId}`}
              startOffset={`${offset}px`}
              xmlSpace="preserve"
            >
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
}
