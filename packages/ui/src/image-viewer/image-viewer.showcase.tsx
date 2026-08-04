"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { demoImage } from "../lib/demo-image";
import { ImageViewer } from "./image-viewer";

const IMAGES = [1, 2, 3, 4, 5, 6].map((i) => ({
  src: demoImage(`hulian-${i}`, 1200, 800),
  alt: `示例图片 ${i}`,
  caption: `瑚琏 ImageViewer · 示例图 ${i}（滚轮缩放 / 双击 / ← → 翻页）`,
}));

function Demo({ images = IMAGES, label = "打开查看器" }: { images?: typeof IMAGES; label?: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        className="rounded-[var(--radius)] border border-border bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-foreground/5"
      >
        {label}
      </button>
      <ImageViewer
        open={open}
        onOpenChange={setOpen}
        images={images}
        index={index}
        onIndexChange={setIndex}
      />
    </>
  );
}

export const imageViewerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "受控用法",
      description: "open / index 全部受控；点触发钮置 open=true 打开全屏 Lightbox，支持滚轮缩放、双击 1x/2x、← → 翻页、Esc 关闭。",
      code: `const [open, setOpen] = useState(false);
const [index, setIndex] = useState(0);

<>
  <button onClick={() => { setIndex(0); setOpen(true); }}>
    打开查看器
  </button>
  <ImageViewer
    open={open}
    onOpenChange={setOpen}
    images={[
      { src: "/a.jpg", alt: "A", caption: "说明 A" },
      { src: "/b.jpg", alt: "B", caption: "说明 B" },
    ]}
    index={index}
    onIndexChange={setIndex}
  />
</>`,
      // 用真正带状态的 Demo：此前这里是个 <span> 假按钮 + open={false} 的查看器，
      // 示例点不开、图一张也看不到，而 code 展示的却是可交互写法（违反 code/render 一一对应）。
      render: () => <Demo />,
    },
    {
      title: "单图（无翻页）",
      description: "images 仅一张时不渲染左右翻页钮与底部缩略图条，只保留缩放 / 关闭。",
      code: `<ImageViewer
  open={open}
  onOpenChange={setOpen}
  images={[{ src: "/poster.jpg", alt: "海报", caption: "活动主视觉" }]}
  index={0}
  onIndexChange={() => {}}
/>`,
      render: () => <Demo images={[IMAGES[0]]} label="查看大图" />,
    },
  ],
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    [
      "const [open, setOpen] = useState(false);",
      "const [index, setIndex] = useState(0);",
      "",
      "<ImageViewer",
      "  open={open}",
      "  onOpenChange={setOpen}",
      "  images={[{ src: '/a.jpg', alt: 'A', caption: '说明' }, /* … */]}",
      "  index={index}",
      "  onIndexChange={setIndex}",
      "/>",
    ].join("\n"),
};
