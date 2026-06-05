"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ImageTrail } from "./image-trail";

// 自包含的占位图：用内联 SVG data URI 生成不同色块，避免远程资源（门禁禁外链）。
const swatch = (hue: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='218'><rect width='240' height='218' fill='hsl(${hue} 65% 55%)'/><circle cx='120' cy='109' r='60' fill='hsl(${(hue + 40) % 360} 70% 70%)' opacity='0.7'/></svg>`,
  )}`;

const IMAGES = [10, 40, 80, 140, 190, 230, 280, 320].map(swatch);

/** 深色舞台，让拖尾色块更清晰；提示用户移动光标 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-72 w-full max-w-2xl overflow-hidden rounded-xl"
      style={{ background: "oklch(0.16 0.02 255)" }}
    >
      {children}
    </div>
  );
}

const Hint = () => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    <span className="text-sm font-medium text-white/55">移动光标 →</span>
  </div>
);

export const imageTrailShowcase: ShowcaseSpec = {
  controls: [
    { prop: "threshold", type: "number", defaultValue: 80, label: "触发阈值 px" },
    { prop: "imageWidth", type: "number", defaultValue: 190, label: "图片宽度 px" },
    { prop: "followStrength", type: "number", defaultValue: 0.5, label: "跟手强度 0-1" },
    { prop: "fadeDuration", type: "number", defaultValue: 0.8, label: "淡出时长 s" },
  ],

  states: [
    {
      name: "default（深色舞台·默认参数）",
      render: () => (
        <Stage>
          <ImageTrail images={IMAGES} className="border-0 bg-transparent">
            <Hint />
          </ImageTrail>
        </Stage>
      ),
    },
    {
      name: "密集拖尾（小阈值 + 小图）",
      render: () => (
        <Stage>
          <ImageTrail
            images={IMAGES}
            threshold={40}
            imageWidth={120}
            className="border-0 bg-transparent"
          >
            <Hint />
          </ImageTrail>
        </Stage>
      ),
    },
    {
      name: "稀疏大图（大阈值 + 慢淡出）",
      render: () => (
        <Stage>
          <ImageTrail
            images={IMAGES}
            threshold={140}
            imageWidth={240}
            fadeDuration={1.2}
            className="border-0 bg-transparent"
          >
            <Hint />
          </ImageTrail>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ImageTrail
        images={IMAGES}
        threshold={p.threshold as number}
        imageWidth={p.imageWidth as number}
        followStrength={p.followStrength as number}
        fadeDuration={p.fadeDuration as number}
        className="border-0 bg-transparent"
      >
        <Hint />
      </ImageTrail>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-72 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
      `  <ImageTrail`,
      `    images={images}`,
      `    threshold={${p.threshold}}`,
      `    imageWidth={${p.imageWidth}}`,
      `    followStrength={${p.followStrength}}`,
      `    fadeDuration={${p.fadeDuration}}`,
      `    className="border-0 bg-transparent"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
