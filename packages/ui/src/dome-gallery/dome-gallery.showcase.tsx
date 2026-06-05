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
