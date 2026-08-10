"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { StickerPeel } from "./sticker-peel";

// 本地内联 SVG 贴纸（无远程资源）：圆角方块 + emoji 风格星标
const STAR =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
      <rect x="6" y="6" width="168" height="168" rx="30" fill="#fff" stroke="#e2e2e2" stroke-width="4"/>
      <path d="M90 34l16 34 37 5-27 26 7 37-33-18-33 18 7-37-27-26 37-5z" fill="#f6b73c" stroke="#e09a1f" stroke-width="3"/>
    </svg>`,
  );

const BOLT =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
      <rect x="6" y="6" width="168" height="168" rx="30" fill="#10131a" stroke="#2b2f3a" stroke-width="4"/>
      <path d="M100 28L58 100h28l-10 52 48-78H94z" fill="#7dd3fc"/>
    </svg>`,
  );

/** 深色舞台，让贴纸卷边阴影与高光清晰可见；relative 供拖拽边界 */
function Stage({
  children,
  dark = true,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className="relative grid h-64 w-full max-w-xl place-items-center overflow-hidden rounded-xl border border-border"
      style={{ background: dark ? "oklch(0.16 0.02 255)" : "oklch(0.97 0.005 255)" }}
    >
      {children}
      <p className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-muted-foreground">
        hover 揭起 · 按住更大 · 拖动试试
      </p>
    </div>
  );
}

export const stickerPeelShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "放在 relative 容器里，hover/按住卷边翻起；imageSrc 必填，rotate 制造歪斜感。",
      code: `<div className="relative grid h-64 place-items-center overflow-hidden rounded-xl">
  <StickerPeel imageSrc="/sticker.png" width={150} rotate={14} />
</div>`,
      render: () => (
        <Stage>
          <StickerPeel imageSrc={STAR} width={150} rotate={14} />
        </Stage>
      ),
    },
    {
      title: "卷边方向",
      description: "peelDirection 让整张贴纸连同卷边一起旋转，改变揭起方向。",
      code: `<StickerPeel
  imageSrc="/bolt.png"
  width={150}
  rotate={-10}
  peelDirection={20}
/>`,
      render: () => (
        <Stage dark={false}>
          <StickerPeel imageSrc={BOLT} width={150} rotate={-10} peelDirection={20} />
        </Stage>
      ),
    },
    {
      title: "大幅卷边 + 强高光",
      description: "调大 hover/active 揭开比例，lightingIntensity 增强鼠标跟随高光。",
      code: `<StickerPeel
  imageSrc="/sticker.png"
  width={170}
  rotate={8}
  peelBackHoverPct={42}
  peelBackActivePct={55}
  lightingIntensity={0.7}
/>`,
      render: () => (
        <Stage>
          <StickerPeel
            imageSrc={STAR}
            width={170}
            rotate={8}
            peelBackHoverPct={42}
            peelBackActivePct={55}
            lightingIntensity={0.7}
          />
        </Stage>
      ),
    },
    {
      title: "锁定不可拖",
      description: "draggable={false} 仅保留卷边交互，禁止拖动。",
      code: `<StickerPeel imageSrc="/bolt.png" width={150} rotate={20} draggable={false} />`,
      render: () => (
        <Stage>
          <StickerPeel imageSrc={BOLT} width={150} rotate={20} draggable={false} />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "width", type: "number", defaultValue: 160, label: "宽度 px" },
    { prop: "rotate", type: "number", defaultValue: 16, label: "图案旋转 deg" },
    { prop: "peelBackHoverPct", type: "number", defaultValue: 30, label: "hover 揭开 %" },
    { prop: "peelBackActivePct", type: "number", defaultValue: 42, label: "按住揭开 %" },
    { prop: "lightingIntensity", type: "number", defaultValue: 0.4, label: "高光强度 0~1" },
    { prop: "draggable", type: "boolean", defaultValue: true, label: "可拖拽" },
  ],

  states: [
    {
      name: "default（深色底·星标贴纸）",
      render: () => (
        <Stage>
          <StickerPeel imageSrc={STAR} width={150} rotate={14} />
        </Stage>
      ),
    },
    {
      name: "浅色底 · 闪电贴纸",
      render: () => (
        <Stage dark={false}>
          <StickerPeel imageSrc={BOLT} width={150} rotate={-10} peelDirection={20} />
        </Stage>
      ),
    },
    {
      name: "大幅卷边 + 强高光",
      render: () => (
        <Stage>
          <StickerPeel
            imageSrc={STAR}
            width={170}
            rotate={8}
            peelBackHoverPct={42}
            peelBackActivePct={55}
            lightingIntensity={0.7}
          />
        </Stage>
      ),
    },
    {
      name: "锁定不可拖（仅卷边交互）",
      render: () => (
        <Stage>
          <StickerPeel imageSrc={BOLT} width={150} rotate={20} draggable={false} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <StickerPeel
        imageSrc={STAR}
        width={p.width as number}
        rotate={p.rotate as number}
        peelBackHoverPct={p.peelBackHoverPct as number}
        peelBackActivePct={p.peelBackActivePct as number}
        lightingIntensity={p.lightingIntensity as number}
        draggable={p.draggable as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative grid h-64 place-items-center overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
      `  <StickerPeel`,
      `    imageSrc="/sticker.png"`,
      `    width={${p.width}}`,
      `    rotate={${p.rotate}}`,
      `    peelBackHoverPct={${p.peelBackHoverPct}}`,
      `    peelBackActivePct={${p.peelBackActivePct}}`,
      `    lightingIntensity={${p.lightingIntensity}}`,
      `    draggable={${p.draggable}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
