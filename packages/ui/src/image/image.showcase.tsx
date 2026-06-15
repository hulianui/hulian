"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Image } from "./image";

type Radius = "none" | "sm" | "md" | "lg" | "full";
const DEMO = "/demo/photo-image.jpg";

export const imageShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入 src/alt 与 width/height 固定外壳尺寸，加载完成后淡入。",
      code: `<Image src="/photo.jpg" alt="风景" width={200} height={130} />`,
      render: () => <Image src={DEMO} alt="风景" width={200} height={130} />,
    },
    {
      title: "圆角",
      description: "radius 提供 none / sm / md / lg / full 五档刻度。",
      code: `<>
  <Image src="/photo.jpg" alt="风景" width={120} height={90} radius="sm" />
  <Image src="/photo.jpg" alt="风景" width={120} height={90} radius="lg" />
  <Image src="/avatar.jpg" alt="头像" width={90} height={90} radius="full" />
</>`,
      render: () => (
        <div className="flex items-end gap-3">
          <Image src={DEMO} alt="风景" width={120} height={90} radius="sm" />
          <Image src={DEMO} alt="风景" width={120} height={90} radius="lg" />
          <Image src={DEMO} alt="头像" width={90} height={90} radius="full" />
        </div>
      ),
    },
    {
      title: "hover 放大（isZoomed）",
      description: "isZoomed 时外壳裁切溢出，鼠标移上图片放大。",
      code: `<Image src="/photo.jpg" alt="风景" width={200} height={130} isZoomed />`,
      render: () => <Image src={DEMO} alt="风景" width={200} height={130} isZoomed />,
    },
    {
      title: "加载失败回退",
      description: "原图加载失败时切到 fallbackSrc；回退也失败则显示占位底。",
      code: `<Image
  src="https://invalid.example/none.png"
  fallbackSrc="/photo.jpg"
  alt="回退"
  width={200}
  height={130}
/>`,
      render: () => (
        <Image src="https://invalid.example/none.png" fallbackSrc={DEMO} alt="回退" width={200} height={130} />
      ),
    },
  ],
  controls: [
    { prop: "radius", type: "select", options: ["none", "sm", "md", "lg", "full"], defaultValue: "md" },
    { prop: "isZoomed", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "default", render: () => <Image src={DEMO} alt="风景" width={200} height={130} /> },
    { name: "zoomed", render: () => <Image src={DEMO} alt="风景" width={200} height={130} isZoomed /> },
    { name: "rounded-full", render: () => <Image src={DEMO} alt="头像" width={96} height={96} radius="full" /> },
    {
      name: "fallback",
      render: () => (
        <Image src="https://invalid.example/none.png" fallbackSrc={DEMO} alt="回退" width={200} height={130} />
      ),
    },
  ],
  renderWithProps: (p) => (
    <Image
      src={DEMO}
      alt="风景"
      width={220}
      height={140}
      radius={(p.radius as Radius) ?? "md"}
      isZoomed={Boolean(p.isZoomed)}
    />
  ),
  toCode: (p) =>
    `<Image\n  src="/photo.jpg"\n  alt="风景"\n  width={220}\n  height={140}${
      p.radius && p.radius !== "md" ? `\n  radius="${p.radius}"` : ""
    }${p.isZoomed ? "\n  isZoomed" : ""}\n/>`,
};
