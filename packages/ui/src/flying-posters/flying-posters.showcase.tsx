"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { FlyingPosters } from "./flying-posters";

// 用本地内联 SVG 海报（data URI），不引外链资源（符合画廊禁远程资源门禁）。
// 每张海报一个渐变 + 序号，模拟真实图片比例与裁切。
function poster(label: string, from: string, to: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="420" viewBox="0 0 320 420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="320" height="420" rx="20" fill="url(#g)"/><text x="160" y="220" font-family="system-ui,sans-serif" font-size="120" font-weight="700" fill="rgba(255,255,255,0.92)" text-anchor="middle">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const POSTERS = [
  poster("01", "#6366f1", "#a855f7"),
  poster("02", "#0ea5e9", "#22d3ee"),
  poster("03", "#f97316", "#f43f5e"),
  poster("04", "#10b981", "#84cc16"),
  poster("05", "#8b5cf6", "#ec4899"),
];

/** 展示用深色舞台，让海报飞行效果有对比、易截图。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-80 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 270)" }}
    >
      {children}
      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/40">
        滚轮 / 拖拽卷动
      </p>
    </div>
  );
}

export const flyingPostersShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "传入海报图片地址数组，首尾相接无限循环；默认自动卷动，滚轮 / 拖拽可手动卷动。",
      code: `<div
  className="relative h-80 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.14 0.02 270)" }}
>
  <FlyingPosters items={posters} className="absolute inset-0" />
</div>`,
      render: () => (
        <Stage>
          <FlyingPosters items={POSTERS} className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      title: "翻折扭曲强度",
      description: "distortion 控制卷动时海报飞起的翻折幅度，越大越夸张（建议 1–6）。",
      code: `<FlyingPosters items={posters} distortion={5} className="absolute inset-0" />`,
      render: () => (
        <Stage>
          <FlyingPosters
            items={POSTERS}
            distortion={5}
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
    {
      title: "广角透视",
      description:
        "cameraFov 增大透视越强、海报飞入飞出弧度更明显；cameraZ 拉远可见更多海报。",
      code: `<FlyingPosters
  items={posters}
  cameraFov={70}
  cameraZ={26}
  className="absolute inset-0"
/>`,
      render: () => (
        <Stage>
          <FlyingPosters
            items={POSTERS}
            cameraFov={70}
            cameraZ={26}
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
    {
      title: "关闭自动卷动",
      description: "autoScroll={false} 仅保留手动卷动（滚轮 / 拖拽）。",
      code: `<FlyingPosters items={posters} autoScroll={false} className="absolute inset-0" />`,
      render: () => (
        <Stage>
          <FlyingPosters
            items={POSTERS}
            autoScroll={false}
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "distortion", type: "number", defaultValue: 3, label: "翻折扭曲强度" },
    { prop: "scrollEase", type: "number", defaultValue: 0.05, label: "卷动缓动系数" },
    { prop: "cameraFov", type: "number", defaultValue: 45, label: "相机视场角" },
    { prop: "autoScroll", type: "boolean", defaultValue: true, label: "自动卷动" },
  ],

  states: [
    {
      name: "default（自动卷动 · 默认参数）",
      render: () => (
        <Stage>
          <FlyingPosters items={POSTERS} className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      name: "强翻折（distortion 5）",
      render: () => (
        <Stage>
          <FlyingPosters
            items={POSTERS}
            distortion={5}
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
    {
      name: "广角透视（fov 70 · 远距）",
      render: () => (
        <Stage>
          <FlyingPosters
            items={POSTERS}
            cameraFov={70}
            cameraZ={26}
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
    {
      name: "仅手动卷动（关闭自动）",
      render: () => (
        <Stage>
          <FlyingPosters
            items={POSTERS}
            autoScroll={false}
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <FlyingPosters
        items={POSTERS}
        distortion={p.distortion as number}
        scrollEase={p.scrollEase as number}
        cameraFov={p.cameraFov as number}
        autoScroll={p.autoScroll as boolean}
        className="absolute inset-0"
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-80 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 270)" }}>`,
      `  <FlyingPosters`,
      `    items={posters}`,
      `    distortion={${p.distortion}}`,
      `    scrollEase={${p.scrollEase}}`,
      `    cameraFov={${p.cameraFov}}`,
      `    autoScroll={${p.autoScroll}}`,
      `    className="absolute inset-0"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
