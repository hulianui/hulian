"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { specBySlug } from "../lib/registry";
import { useLazyMount } from "./use-lazy-mount";

const BOX_H = 132;

/**
 * 组件画廊卡片上的活预览 —— 直接复用该组件 showcase 的第一个示例（examples[0]），
 * 也就是文档页「基础用法」那一段，保证画廊看到的和点进去看到的是同一个东西。
 *
 * **自适应缩放**是这个组件的全部难点。画廊里 299 个组件的示例尺寸跨度极大：
 * Button 是一行几十像素的控件，AdminLayout / ProTable 是上千像素的整块骨架。
 *   - 一律不缩放 → 大件被裁成一块无意义的碎片（只露出中间几个字）。
 *   - 一律按固定设计宽缩放（PreviewThumbnail 对整页区块的做法）→ 小控件缩成一粒糊点。
 * 所以量完再定：只在装不下时才缩，且永不放大。Button 保持 1:1 清晰，
 * AdminLayout 缩到能看出「左栏 + 顶栏 + 内容区」的结构。
 *
 * pointer-events-none + aria-hidden + inert：纯视觉。卡片自己的链接负责导航与无障碍名字，
 * 预览里的按钮/输入框不该抢焦点，也不该在读屏里念第二遍。
 */
export function ComponentThumbnail({ slug }: { slug: string }) {
  const { ref: hostRef, mounted } = useLazyMount<HTMLDivElement>();
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const spec = specBySlug[slug];
  const example = spec?.examples?.[0];

  useLayoutEffect(() => {
    const host = hostRef.current;
    const content = contentRef.current;
    if (!host || !content) return; // 未挂载 → contentRef 为空，保持 scale=1
    const measure = () => {
      const availW = host.clientWidth;
      const availH = host.clientHeight;
      // 尺寸未就绪(首帧)→ 等 ResizeObserver，别把 scale 算成 0 闪一下空白
      if (!availW || !availH) return;
      // scrollWidth/Height 是内容真实尺寸，含被 overflow 裁掉的部分
      const need = Math.max(content.scrollWidth / availW, content.scrollHeight / availH);
      // 只缩不放；0.92 留一点余量不贴边；0.18 兜底，再小就没有辨识度了，宁可裁
      setScale(need > 1 ? Math.max(0.18, (1 / need) * 0.92) : 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    ro.observe(content);
    return () => ro.disconnect();
  }, [mounted, hostRef]);

  return (
    <div
      ref={hostRef}
      data-component-thumbnail={slug}
      data-mounted={mounted ? "" : undefined}
      className="pointer-events-none flex w-full items-center justify-center overflow-hidden bg-bg px-4"
      style={{ height: BOX_H }}
      aria-hidden
      inert
    >
      {mounted && example ? (
        <div
          ref={contentRef}
          className="flex flex-wrap items-center justify-center gap-2"
          style={{ transform: `scale(${scale})` }}
        >
          {example.render()}
        </div>
      ) : (
        // 占位与已挂载态同底色，滚动时不闪异色。不做骨架动画——它自己也是个动效。
        <div className="size-full bg-surface/30" />
      )}
    </div>
  );
}
