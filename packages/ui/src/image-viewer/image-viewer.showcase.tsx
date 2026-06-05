"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { ImageViewer } from "./image-viewer";

const IMAGES = [1, 2, 3, 4, 5, 6].map((i) => ({
  src: `https://picsum.photos/seed/hulian-${i}/1200/800`,
  alt: `示例图片 ${i}`,
  caption: `瑚琏 ImageViewer · 示例图 ${i}（滚轮缩放 / 双击 / ← → 翻页）`,
}));

function Demo() {
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
        打开查看器
      </button>
      <ImageViewer
        open={open}
        onOpenChange={setOpen}
        images={IMAGES}
        index={index}
        onIndexChange={setIndex}
      />
    </>
  );
}

export const imageViewerShowcase: ShowcaseSpec = {
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
