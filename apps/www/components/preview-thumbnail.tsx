"use client";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const DESIGN_W = 1280;

// 画廊缩略图 —— 把真实区块/页面在 1280px 设计宽度上渲染,按【宽度】等比缩放成「截图」。
// 高度跟随内容自然高度(不裁两侧、不留空白);过高的(整页)由 maxHeight 封顶只露顶部。
// 配合 CSS columns 瀑布流:高矮不一的卡片无缝堆叠。
// pointer-events-none + aria-hidden:纯视觉,不可交互、不入无障碍树(卡片链接负责导航)。
//
// **按需挂载(lazy)**：/pages 画廊此前把 20 个整页预览全部当活组件同时挂上，实测顶层
// document 6353 个节点。inert 只挡交互，挡不住 React effects、计时器、图片请求和
// Marquee/计数动效这类持续运行的东西 —— 控制台的头像 preload 警告就是这么来的。
// 所以这里用 IntersectionObserver 把「进入近视口」之前的 children 完全不渲染：
// 不进 DOM、不跑 effect、不发请求。一旦挂载就断开观察，不再来回卸载（滚回去还要重跑一遍
// 入场动画反而更糟）。rootMargin 给足提前量，正常滚动速度下用户看不到占位。
export function PreviewThumbnail({
  children,
  maxHeight = 460,
  /** 关掉即恢复「立刻挂载」，用于详情页这类必须立即可见的单个预览。 */
  lazy = true,
  /**
   * 提前量：距视口多远开始挂载。
   * 刻意不给大值 —— 未挂载的占位比挂载后矮，提前量一大就会连锁把更下面的也拉进观察窗，
   * 首屏外挂载数不降反升。200px 够遮住正常滚动的空窗，又守住「首屏之外不挂载」。
   */
  rootMargin = "0px",
}: {
  children: ReactNode;
  maxHeight?: number;
  lazy?: boolean;
  rootMargin?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ scale: number; h: number } | null>(null);
  const [mounted, setMounted] = useState(!lazy);

  useEffect(() => {
    if (mounted) return;
    const host = hostRef.current;
    if (!host) return;
    // 无 IntersectionObserver(老浏览器 / jsdom)→ 直接挂载，宁可多渲染也不能让画廊空着。
    if (typeof IntersectionObserver !== "function") {
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [mounted, rootMargin]);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const content = contentRef.current;
    if (!host || !content) return; // 未挂载时 contentRef 为空 → 保持占位高度
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
  }, [mounted]);

  return (
    <div
      ref={hostRef}
      data-preview-thumbnail=""
      data-mounted={mounted ? "" : undefined}
      className="pointer-events-none w-full overflow-hidden bg-bg"
      style={{ height: dims ? Math.min(dims.h, maxHeight) : 220, maxHeight }}
      aria-hidden
      inert
    >
      {mounted ? (
        <div
          ref={contentRef}
          className="origin-top-left"
          style={{ width: DESIGN_W, transform: `scale(${dims?.scale ?? 0.3})` }}
        >
          {children}
        </div>
      ) : (
        // 占位：与已挂载态同底色，避免滚动时闪一块异色。不做骨架动画——它自己也是个动效。
        <div className="size-full bg-surface/30" />
      )}
    </div>
  );
}
