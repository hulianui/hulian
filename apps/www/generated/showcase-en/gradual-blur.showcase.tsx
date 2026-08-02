"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GradualBlur } from "../../../../packages/ui/src/gradual-blur/gradual-blur";
import type { GradualBlurPosition } from "../../../../packages/ui/src/gradual-blur/gradual-blur.types";
function Stage({ children, position = "bottom", }: {
    children: React.ReactNode;
    position?: GradualBlurPosition;
}) {
    const isHorizontal = position === "left" || position === "right";
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface">

      <div aria-hidden className="absolute inset-0" style={{
            backgroundImage: "repeating-linear-gradient(45deg, var(--color-chart-1) 0 18px, var(--color-chart-2) 18px 36px, var(--color-chart-4) 36px 54px)",
            opacity: 0.85,
        }}/>

      <div className={isHorizontal
            ? "relative flex h-full items-center px-8" : "relative flex h-full flex-col justify-end p-6"}>
        <p className="text-2xl font-semibold text-foreground drop-shadow">
          Hulian component library
        </p>
        <p className="text-sm text-muted">Enterprise level · High quality · Progressive blur welt</p>
      </div>
      {children}
    </div>);
}
export const gradualBlurShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the container of relative + overflow-hidden, and apply a layer of progressive softening from clear to blur along the edge specified by position.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl">
  {/* ...lower content... */}
  <GradualBlur position="bottom" height="7rem" />
</div>`,
            render: () => (<Stage position="bottom">
          <GradualBlur position="bottom" height="7rem"/>
        </Stage>),
        },
        {
            title: "Strong blur \u00B7 Exponentially increasing",
            description: "strength improves the overall viscosity, divCount adds more layers to make the transition more delicate, and exponential makes the near edges sharply opaque.",
            code: `<GradualBlur
  position="top"
  height="8rem"
  strength={4}
  divCount={8}
  exponential
/>`,
            render: () => (<Stage position="top">
          <GradualBlur position="top" height="8rem" strength={4} divCount={8} exponential/>
        </Stage>),
        },
        {
            title: "Vertical welt \u00B7 Curve",
            description: "position Set left/right to run the vertical bar, width to control the thickness, and curve to switch the climbing curve.",
            code: `<GradualBlur
  position="right"
  width="9rem"
  strength={2.5}
  divCount={6}
  curve="bezier"
/>`,
            render: () => (<Stage position="right">
          <GradualBlur position="right" width="9rem" strength={2.5} divCount={6} curve="bezier"/>
        </Stage>),
        },
        {
            title: "Hover enhancement",
            description: "After hoverIntensity is passed, the container takes over the pointer event, and the blur amount is enlarged by multiples when the mouse is moved up.",
            code: `<GradualBlur
  position="bottom"
  height="7rem"
  strength={1.5}
  hoverIntensity={2}
/>`,
            render: () => (<Stage position="bottom">
          <GradualBlur position="bottom" height="7rem" strength={1.5} hoverIntensity={2}/>
        </Stage>),
        },
    ],
    controls: [
        {
            prop: "position",
            type: "select",
            options: ["top", "bottom", "left", "right"],
            defaultValue: "bottom",
            label: "Welt direction",
        },
        { prop: "strength", type: "number", defaultValue: 2, label: "Blur intensity" },
        { prop: "divCount", type: "number", defaultValue: 5, label: "Number of layers" },
        {
            prop: "exponential",
            type: "boolean",
            defaultValue: false,
            label: "Index increasing",
        },
    ],
    states: [
        {
            name: "default (progressive blurring at the bottom)",
            render: () => (<Stage position="bottom">
          <GradualBlur position="bottom" height="7rem"/>
        </Stage>),
        },
        {
            name: "Top \u00B7 Increasing strong blur index",
            render: () => (<Stage position="top">
          <GradualBlur position="top" height="8rem" strength={4} divCount={8} exponential/>
        </Stage>),
        },
        {
            name: "Right vertical bar \u00B7 bezier curve",
            render: () => (<Stage position="right">
          <GradualBlur position="right" width="9rem" strength={2.5} divCount={6} curve="bezier"/>
        </Stage>),
        },
        {
            name: "Hover enhancement (hover further blurred)",
            render: () => (<Stage position="bottom">
          <GradualBlur position="bottom" height="7rem" strength={1.5} hoverIntensity={2}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage position={p.position as GradualBlurPosition}>
      <GradualBlur position={p.position as GradualBlurPosition} strength={p.strength as number} divCount={p.divCount as number} exponential={p.exponential as boolean} height="7rem" width="9rem"/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl bg-surface">`,
        `  {/* ...lower content... */}`,
        `  <GradualBlur`,
        `    position="${p.position}"`,
        `    strength={${p.strength}}`,
        `    divCount={${p.divCount}}`,
        `    exponential={${p.exponential}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
