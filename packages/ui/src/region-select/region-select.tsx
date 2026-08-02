"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useComponentLocale, zhCN } from "../config/locale";
import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import {
  applyAspect,
  boxMinSide,
  normalizeBox,
  roundBox,
  strokeWidthFor,
  toImagePoint,
  type RegionBox,
} from "./region-box";
import type { RegionSelectProps } from "./region-select.types";

// RegionSelect = 在图上拖框选一块区域、拿回**原图像素坐标**。
//
// 和 ImageCropper 的分工：ImageCropper 的产物是**图**（onCropped 出 Blob）；本组件的产物是
// **坐标**（[x1,y1,x2,y2]）。两者不能互相顶替——存「原页 + 框」的引用时，框错了只需重拖，
// 裁死了就得推倒重来；裁图由服务端按框现渲，永远与框一致。
// 典型场景：题库配图纠错、文档标注、OCR 纠错框、截图打码、商品热区、缺陷标注。
//
// 坐标系只有一个：原图像素。SVG 用 viewBox="0 0 naturalW naturalH" 打底，画框零换算，
// 只有「指针 → 图像素」一个方向要折算（region-box 纯函数，可单测）。

interface Natural {
  w: number;
  h: number;
}

export function RegionSelect({
  src,
  alt = "",
  value,
  onChange,
  onDrafting,
  minSide = 8,
  boxes,
  aspect,
  maxHeight = "60vh",
  color = "primary",
  readOnly = false,
  naturalSize,
  placeholder,
  errorPlaceholder,
  onError,
  round = "expand",
  className,
  ...rest
}: RegionSelectProps) {
  const copy = useComponentLocale().regionSelect ?? zhCN.components!.regionSelect!;
  const [natural, setNatural] = useState<Natural | null>(
    naturalSize ? { w: naturalSize.width, h: naturalSize.height } : null,
  );
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState<RegionBox | null>(null);
  const anchorRef = useRef<[number, number] | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const accent = resolveTone(color) ?? "var(--color-primary)";

  // onError 常是内联函数，进依赖数组会让预读每次渲染重挂。用 latest ref 读最新值
  //（失败回调恒为异步触发，effect 早已跑过，读到的一定是最新的那个）。
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });
  const fail = (event: unknown) => {
    setFailed(true);
    onErrorRef.current?.(event);
  };

  // 自然尺寸必须自己量，量到之前不画任何框：拿上一张图的比例摆框，位置一定是错的。
  // 调用方已知尺寸（库里存着）时直接传 naturalSize，省一次预读。
  useEffect(() => {
    setFailed(false);
    if (naturalSize) {
      setNatural({ w: naturalSize.width, h: naturalSize.height });
      return;
    }
    let alive = true;
    setNatural(null);
    const probe = new window.Image();
    const take = () => {
      if (alive && probe.naturalWidth > 0) setNatural({ w: probe.naturalWidth, h: probe.naturalHeight });
    };
    probe.onload = take;
    // onerror 必须与 onload 对称：只挂 onload 时，src 404/403/网络失败会让 natural 恒为 null，
    // 组件永久停在「载入图片…」——「正在等」和「根本取不到」长得一模一样，人会一直等下去。
    probe.onerror = (event) => {
      if (!alive) return;
      setFailed(true);
      onErrorRef.current?.(event);
    };
    probe.src = src;
    // 缓存命中时 load/error 事件可能早于处理器挂上就烧完了，补查一次 complete。
    // complete 且 naturalWidth 为 0 = 加载已结束且失败（失败结果同样进浏览器缓存）。
    if (probe.complete) {
      if (probe.naturalWidth > 0) take();
      else setFailed(true);
    }
    return () => {
      alive = false;
      probe.onload = null;
      probe.onerror = null;
    };
  }, [src, naturalSize]);

  const pointAt = (e: PointerEvent<SVGSVGElement>, nat: Natural): [number, number] => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return [0, 0];
    return toImagePoint(e.clientX, e.clientY, rect, nat.w, nat.h);
  };

  const boxFrom = (anchor: [number, number], point: [number, number], nat: Natural): RegionBox =>
    aspect ? applyAspect(anchor, point, aspect, nat.w, nat.h) : normalizeBox(anchor, point);

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (readOnly || !natural || e.button !== 0) return;
    const p = pointAt(e, natural);
    anchorRef.current = p;
    const next = boxFrom(p, p, natural);
    setDraft(next);
    onDrafting?.(next);
    // 顺序要点：**先落拖拽状态再捕获指针**，且 try/catch。
    // 合成 PointerEvent（Playwright / 单测 dispatch）下 setPointerCapture 会抛，
    // 先捕获就把整个 handler 中断，拖拽根本起不来。
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* 合成事件无真实指针，捕获失败不影响拖拽 */
    }
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const anchor = anchorRef.current;
    if (!anchor || !natural) return;
    const next = boxFrom(anchor, pointAt(e, natural), natural);
    setDraft(next);
    onDrafting?.(next);
  };

  const finish = (e: PointerEvent<SVGSVGElement>, commit: boolean) => {
    const anchor = anchorRef.current;
    if (!anchor || !natural) return;
    anchorRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* 同上 */
    }
    setDraft(null);
    onDrafting?.(null);
    // 出口取整一次；minSide 判定放在取整**之后**，与最终交出去的框一致
    //（否则 expand 撑大后的框可能刚好跨过阈值，或 nearest 内收后跌破阈值，症状是「拖了没反应」）。
    const next = roundBox(boxFrom(anchor, pointAt(e, natural), natural), round);
    // 误点（短边太小）不算一次框选：手一抖点一下不该把已有的框清掉。
    if (commit && boxMinSide(next) >= minSide) onChange?.(next);
  };

  // 底图取不到时给出口：与 placeholder 分开，人才知道该重试还是该等。
  // 预读（naturalSize 已传时不跑）与画布 <image> 共用这一个状态——中途鉴权过期导致
  // SVG 那次请求单独失败时，同样有出口。
  if (failed) {
    return (
      <div
        className={cn(
          "grid place-items-center rounded-[var(--radius)] border border-border bg-surface-hover p-8 text-sm text-muted",
          className,
        )}
        {...rest}
      >
        {errorPlaceholder ?? copy.error}
      </div>
    );
  }

  if (!natural) {
    return (
      <div
        className={cn(
          "grid place-items-center rounded-[var(--radius)] border border-border bg-surface-hover p-8 text-sm text-muted",
          className,
        )}
        {...rest}
      >
        {placeholder ?? copy.loading}
      </div>
    );
  }

  const stroke = strokeWidthFor(natural.w);
  const active = draft ?? value ?? null;

  return (
    <div
      className={cn("overflow-auto rounded-[var(--radius)] border border-border bg-surface-hover", className)}
      style={{ maxHeight }}
      {...rest}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${natural.w} ${natural.h}`}
        // touch-none 必须有，否则触屏上「拖框」变成「滚页面」。
        className={cn("block w-full touch-none select-none", !readOnly && "cursor-crosshair")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => finish(e, true)}
        onPointerCancel={(e) => finish(e, false)}
        role="img"
        aria-label={alt || copy.canvas}
      >
        <image href={src} x={0} y={0} width={natural.w} height={natural.h} onError={fail} />

        {boxes?.map((b, i) => {
          const c = resolveTone(b.color) ?? "var(--color-muted)";
          return (
            <g key={b.id ?? i}>
              <rect
                x={b.box[0]}
                y={b.box[1]}
                width={b.box[2] - b.box[0]}
                height={b.box[3] - b.box[1]}
                fill={`color-mix(in oklab, ${c} 10%, transparent)`}
                stroke={c}
                strokeWidth={stroke}
                strokeDasharray={`${stroke * 3} ${stroke * 2}`}
              />
              {b.label != null && (
                <text
                  x={b.box[0] + stroke}
                  y={b.box[1] - stroke}
                  fill={c}
                  fontSize={Math.max(12, natural.w / 60)}
                >
                  {b.label}
                </text>
              )}
            </g>
          );
        })}

        {active && (
          <rect
            data-region-active
            x={active[0]}
            y={active[1]}
            width={active[2] - active[0]}
            height={active[3] - active[1]}
            fill={`color-mix(in oklab, ${accent} 14%, transparent)`}
            stroke={accent}
            strokeWidth={stroke}
          />
        )}
      </svg>
    </div>
  );
}
