"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { DomeGallery } from "./dome-gallery";

/** 球面图库需要一定高度与中性底色展现 3D 曲面，统一包一层 Stage */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-80 w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-background">
      {children}
    </div>
  );
}

export const domeGalleryShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "不传 images 时用内置占位渐变瓦片，可拖拽旋转球面、点开放大查看。",
      code: `<div className="relative h-80 overflow-hidden rounded-xl bg-background">
  <DomeGallery />
</div>`,
      render: () => (
        <Stage>
          <DomeGallery />
        </Stage>
      ),
    },
    {
      title: "自动自转",
      description: "autoRotate 让球面在无拖拽时缓慢自转，适合壁纸 / 展示场景。",
      code: `<DomeGallery autoRotate />`,
      render: () => (
        <Stage>
          <DomeGallery autoRotate />
        </Stage>
      ),
    },
    {
      title: "彩色瓦片",
      description: "grayscale={false} 关闭灰度滤镜，瓦片直接显示原色。",
      code: `<DomeGallery grayscale={false} segments={20} />`,
      render: () => (
        <Stage>
          <DomeGallery grayscale={false} segments={20} />
        </Stage>
      ),
    },
    {
      title: "高密度球面",
      description: "segments 提高经向分段数，瓦片更密、单格更小；fit 调球面曲率。",
      code: `<DomeGallery segments={32} fit={0.55} />`,
      render: () => (
        <Stage>
          <DomeGallery segments={32} fit={0.55} />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "segments", type: "number", defaultValue: 24, label: "经向分段数" },
    { prop: "fit", type: "number", defaultValue: 0.5, label: "半径比例" },
    { prop: "grayscale", type: "boolean", defaultValue: true, label: "灰度瓦片" },
    { prop: "autoRotate", type: "boolean", defaultValue: false, label: "自动自转" },
  ],

  states: [
    {
      name: "default（占位渐变瓦片·可拖拽）",
      render: () => (
        <Stage>
          <DomeGallery />
        </Stage>
      ),
    },
    {
      name: "自动自转（壁纸级）",
      render: () => (
        <Stage>
          <DomeGallery autoRotate />
        </Stage>
      ),
    },
    {
      name: "彩色瓦片（关灰度）",
      render: () => (
        <Stage>
          <DomeGallery grayscale={false} segments={20} />
        </Stage>
      ),
    },
    {
      name: "高密度球面（segments=32）",
      render: () => (
        <Stage>
          <DomeGallery segments={32} fit={0.55} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <DomeGallery
        segments={p.segments as number}
        fit={p.fit as number}
        grayscale={p.grayscale as boolean}
        autoRotate={p.autoRotate as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-80 overflow-hidden rounded-xl bg-background">`,
      `  <DomeGallery`,
      `    segments={${p.segments}}`,
      `    fit={${p.fit}}`,
      `    grayscale={${p.grayscale}}`,
      `    autoRotate={${p.autoRotate}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
