"use client";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

const DESIGN_W = 1280;

// 画廊缩略图 —— 把真实区块/页面在 1280px 设计宽度上渲染,按【宽度】等比缩放成「截图」。
// 高度跟随内容自然高度(不裁两侧、不留空白);过高的(整页)由 maxHeight 封顶只露顶部。
// 配合 CSS columns 瀑布流:高矮不一的卡片无缝堆叠。
// pointer-events-none + aria-hidden:纯视觉,不可交互、不入无障碍树(卡片链接负责导航)。
export function PreviewThumbnail({
  children,
  maxHeight = 460,
}: {
  children: ReactNode;
  maxHeight?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ scale: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const content = contentRef.current;
    if (!host || !content) return;
    const measure = () => {
      const w = host.clientWidth;
      if (!w) return; // 列宽未就绪(CSS columns 首帧)→ 等 ResizeObserver,避免 scale=0 出现空白
      const scale = w / DESIGN_W;
      setDims({ scale, h: content.offsetHeight * scale });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className="pointer-events-none w-full overflow-hidden bg-bg"
      style={{ height: dims ? Math.min(dims.h, maxHeight) : 220, maxHeight }}
      aria-hidden
      inert
    >
      <div
        ref={contentRef}
        className="origin-top-left"
        style={{ width: DESIGN_W, transform: `scale(${dims?.scale ?? 0.3})` }}
      >
        {children}
      </div>
    </div>
  );
}
