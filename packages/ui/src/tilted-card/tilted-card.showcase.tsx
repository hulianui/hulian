"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { TiltedCard } from "./tilted-card";

/** 居中深色舞台，便于看清 3D 倾斜的投影与高光（倾斜需鼠标悬停触发）。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-72 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.16 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const tiltedCardShowcase: ShowcaseSpec = {
  controls: [
    { prop: "rotateAmplitude", type: "number", defaultValue: 14, label: "倾斜角度" },
    { prop: "scaleOnHover", type: "number", defaultValue: 1.1, label: "悬停放大" },
    { prop: "showTooltip", type: "boolean", defaultValue: true, label: "浮动提示" },
  ],

  states: [
    {
      name: "default（内容卡 · 悬停倾斜）",
      render: () => (
        <Stage>
          <TiltedCard
            cardWidth="240px"
            cardHeight="240px"
            captionText="悬停我"
            containerWidth="240px"
            containerHeight="240px"
          >
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <p className="text-lg font-semibold text-foreground">瑚琏组件库</p>
              <p className="text-xs text-muted">移动鼠标感受 3D 倾斜</p>
            </div>
          </TiltedCard>
        </Stage>
      ),
    },
    {
      name: "叠加内容（overlay 抬升）",
      render: () => (
        <Stage>
          <TiltedCard
            cardWidth="240px"
            cardHeight="240px"
            containerWidth="240px"
            containerHeight="240px"
            showTooltip={false}
            displayOverlayContent
            overlayContent={
              <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                NEW
              </span>
            }
          >
            <div
              className="h-full w-full rounded-2xl"
              style={{ background: "linear-gradient(135deg, var(--color-chart-1), var(--color-chart-3))" }}
            />
          </TiltedCard>
        </Stage>
      ),
    },
    {
      name: "强倾斜（rotateAmplitude=22）",
      render: () => (
        <Stage>
          <TiltedCard
            cardWidth="240px"
            cardHeight="240px"
            containerWidth="240px"
            containerHeight="240px"
            rotateAmplitude={22}
            scaleOnHover={1.15}
            captionText="更立体"
          >
            <div className="flex h-full items-center justify-center text-sm text-foreground">
              rotateAmplitude = 22
            </div>
          </TiltedCard>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <TiltedCard
        cardWidth="240px"
        cardHeight="240px"
        containerWidth="240px"
        containerHeight="240px"
        rotateAmplitude={p.rotateAmplitude as number}
        scaleOnHover={p.scaleOnHover as number}
        showTooltip={p.showTooltip as boolean}
        captionText="悬停我"
      >
        <div className="flex h-full items-center justify-center text-sm text-foreground">
          TiltedCard
        </div>
      </TiltedCard>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<TiltedCard`,
      `  cardWidth="240px"`,
      `  cardHeight="240px"`,
      `  rotateAmplitude={${p.rotateAmplitude}}`,
      `  scaleOnHover={${p.scaleOnHover}}`,
      `  showTooltip={${p.showTooltip}}`,
      `  captionText="悬停我"`,
      `>`,
      `  <div className="flex h-full items-center justify-center">TiltedCard</div>`,
      `</TiltedCard>`,
    ].join("\n"),
};
