"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { BlobCursor } from "./blob-cursor";

/** 展示用深色舞台：水滴在深色底上对比清晰，鼠标移入即可见果冻跟随 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.16 0.02 265)" }}
    >
      {children}
    </div>
  );
}

export const blobCursorShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "包裹任意内容，鼠标移入即出现果冻水滴跟随；children 层叠在水滴之上。",
      code: `<div
  className="relative h-64 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.16 0.02 265)" }}
>
  <BlobCursor>
    <div className="pointer-events-none flex h-full items-center justify-center text-sm font-medium text-white/70">
      移动鼠标 →
    </div>
  </BlobCursor>
</div>`,
      render: () => (
        <Stage>
          <BlobCursor>
            <div className="pointer-events-none flex h-full items-center justify-center text-sm font-medium text-white/70">
              移动鼠标 →
            </div>
          </BlobCursor>
        </Stage>
      ),
    },
    {
      title: "方形液态块",
      description: "square 配合较大 gooeyStrength 可得像水银一样融合的液态方块。",
      code: `<BlobCursor square gooeyStrength={20} />`,
      render: () => (
        <Stage>
          <BlobCursor square gooeyStrength={20} />
        </Stage>
      ),
    },
    {
      title: "长拖尾",
      description: "增大 trailCount、降低 trailStiffness，拖尾更长更黏。",
      code: `<BlobCursor trailCount={5} trailStiffness={70} />`,
      render: () => (
        <Stage>
          <BlobCursor trailCount={5} trailStiffness={70} />
        </Stage>
      ),
    },
    {
      title: "关闭 gooey",
      description: "gooey={false} 时各水珠彼此独立，不再边缘融合。",
      code: `<BlobCursor gooey={false} />`,
      render: () => (
        <Stage>
          <BlobCursor gooey={false} />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "trailCount", type: "number", defaultValue: 3, label: "拖尾数量" },
    { prop: "gooey", type: "boolean", defaultValue: true, label: "gooey 融合" },
    { prop: "gooeyStrength", type: "number", defaultValue: 16, label: "融合强度" },
    { prop: "square", type: "boolean", defaultValue: false, label: "方形水滴" },
  ],

  states: [
    {
      name: "default（移入舞台试试）",
      render: () => (
        <Stage>
          <BlobCursor>
            <div className="pointer-events-none flex h-full items-center justify-center text-sm font-medium text-white/70">
              移动鼠标 →
            </div>
          </BlobCursor>
        </Stage>
      ),
    },
    {
      name: "方形液态块",
      render: () => (
        <Stage>
          <BlobCursor square gooeyStrength={20} />
        </Stage>
      ),
    },
    {
      name: "长拖尾（5 滴 · 低刚度）",
      render: () => (
        <Stage>
          <BlobCursor trailCount={5} trailStiffness={70} />
        </Stage>
      ),
    },
    {
      name: "无 gooey（独立水珠）",
      render: () => (
        <Stage>
          <BlobCursor gooey={false} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <BlobCursor
        trailCount={p.trailCount as number}
        gooey={p.gooey as boolean}
        gooeyStrength={p.gooeyStrength as number}
        square={p.square as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.16 0.02 265)" }}>`,
      `  <BlobCursor`,
      `    trailCount={${p.trailCount}}`,
      `    gooey={${p.gooey}}`,
      `    gooeyStrength={${p.gooeyStrength}}`,
      `    square={${p.square}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
