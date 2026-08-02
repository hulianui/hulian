"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TiltedCard } from "../../../../packages/ui/src/tilted-card/tilted-card";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex h-72 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.16 0.02 255)" }}>
      {children}
    </div>);
}
export const tiltedCardShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The pointer moves on the card surface to tilt 3D, and captionText renders a floating prompt bubble following the pointer.",
            code: `<TiltedCard
  cardWidth="240px"
  cardHeight="240px"
  containerWidth="240px"
  containerHeight="240px"
  captionText="Hover me"
>
  <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
    <p className="text-lg font-semibold text-foreground">Hulian Component Library</p>
    <p className="text-xs text-muted">Move the mouse to feel 3D tilt</p>
  </div>
</TiltedCard>`,
            render: () => (<Stage>
          <TiltedCard cardWidth="240px" cardHeight="240px" containerWidth="240px" containerHeight="240px" captionText="Hover me">
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <p className="text-lg font-semibold text-foreground">Hulian component library</p>
              <p className="text-xs text-muted">Moving mouse experience 3D Tilt</p>
            </div>
          </TiltedCard>
        </Stage>),
        },
        {
            title: "Overlay content",
            description: "displayOverlayContent + overlayContent Raise the subtitle/title along with the tilt 3D.",
            code: `<TiltedCard
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
</TiltedCard>`,
            render: () => (<Stage>
          <TiltedCard cardWidth="240px" cardHeight="240px" containerWidth="240px" containerHeight="240px" showTooltip={false} displayOverlayContent overlayContent={<span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                NEW
              </span>}>
            <div className="h-full w-full rounded-2xl" style={{
                    background: "linear-gradient(135deg, var(--color-chart-1), var(--color-chart-3))",
                }}/>
          </TiltedCard>
        </Stage>),
        },
        {
            title: "Adjust the tilt amplitude",
            description: "rotateAmplitude controls the maximum tilt angle, scaleOnHover controls hovering and zooming in, the larger it is, the more three-dimensional it is.",
            code: `<TiltedCard
  cardWidth="240px"
  cardHeight="240px"
  containerWidth="240px"
  containerHeight="240px"
  rotateAmplitude={22}
  scaleOnHover={1.15}
  captionText="More three-dimensional"
>
  <div className="flex h-full items-center justify-center text-sm text-foreground">
    rotateAmplitude = 22
  </div>
</TiltedCard>`,
            render: () => (<Stage>
          <TiltedCard cardWidth="240px" cardHeight="240px" containerWidth="240px" containerHeight="240px" rotateAmplitude={22} scaleOnHover={1.15} captionText="More three-dimensional">
            <div className="flex h-full items-center justify-center text-sm text-foreground">
              rotateAmplitude = 22
            </div>
          </TiltedCard>
        </Stage>),
        },
    ],
    controls: [
        { prop: "rotateAmplitude", type: "number", defaultValue: 14, label: "Tilt angle" },
        { prop: "scaleOnHover", type: "number", defaultValue: 1.1, label: "Hover to enlarge" },
        { prop: "showTooltip", type: "boolean", defaultValue: true, label: "Floating prompt" },
    ],
    states: [
        {
            name: "default (Content Card \u00B7 Hover Tilt)",
            render: () => (<Stage>
          <TiltedCard cardWidth="240px" cardHeight="240px" captionText="Hover me" containerWidth="240px" containerHeight="240px">
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <p className="text-lg font-semibold text-foreground">Hulian component library</p>
              <p className="text-xs text-muted">Moving mouse experience 3D Tilt</p>
            </div>
          </TiltedCard>
        </Stage>),
        },
        {
            name: "Overlay content (overlay raised)",
            render: () => (<Stage>
          <TiltedCard cardWidth="240px" cardHeight="240px" containerWidth="240px" containerHeight="240px" showTooltip={false} displayOverlayContent overlayContent={<span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                NEW
              </span>}>
            <div className="h-full w-full rounded-2xl" style={{ background: "linear-gradient(135deg, var(--color-chart-1), var(--color-chart-3))" }}/>
          </TiltedCard>
        </Stage>),
        },
        {
            name: "Strong tilt (rotateAmplitude=22)",
            render: () => (<Stage>
          <TiltedCard cardWidth="240px" cardHeight="240px" containerWidth="240px" containerHeight="240px" rotateAmplitude={22} scaleOnHover={1.15} captionText="More three-dimensional">
            <div className="flex h-full items-center justify-center text-sm text-foreground">
              rotateAmplitude = 22
            </div>
          </TiltedCard>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <TiltedCard cardWidth="240px" cardHeight="240px" containerWidth="240px" containerHeight="240px" rotateAmplitude={p.rotateAmplitude as number} scaleOnHover={p.scaleOnHover as number} showTooltip={p.showTooltip as boolean} captionText="Hover me">
        <div className="flex h-full items-center justify-center text-sm text-foreground">
          TiltedCard
        </div>
      </TiltedCard>
    </Stage>),
    toCode: (p) => [
        `<TiltedCard`,
        `  cardWidth="240px"`,
        `  cardHeight="240px"`,
        `  rotateAmplitude={${p.rotateAmplitude}}`,
        `  scaleOnHover={${p.scaleOnHover}}`,
        `  showTooltip={${p.showTooltip}}`,
        `  captionText="Hover me"`,
        `>`,
        `  <div className="flex h-full items-center justify-center">TiltedCard</div>`,
        `</TiltedCard>`,
    ].join("\n"),
};
