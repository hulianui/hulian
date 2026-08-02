"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Orb } from "../../../../packages/ui/src/orb/orb";
function OrbFrame({ children, size = 280, }: {
    children: React.ReactNode;
    size?: number;
}) {
    return (<div className="relative overflow-hidden rounded-2xl bg-bg" style={{ width: size, height: size }}>
      {children}
    </div>);
}
export const orbShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Orb fills the parent container (block h-full w-full), the size is determined by the outer square container; the default is blue and purple.",
            code: `<div className="relative h-[280px] w-[280px] overflow-hidden rounded-2xl bg-bg">
  <Orb />
</div>`,
            render: () => (<OrbFrame>
          <Orb />
        </OrbFrame>),
        },
        {
            title: "Hue rotation",
            description: "hue Rotate in degrees YIQ Hue: Approximately 120 greenish, 60 amber, 300 mauve.",
            code: `<Orb hue={120} />`,
            render: () => (<OrbFrame>
          <Orb hue={120}/>
        </OrbFrame>),
        },
        {
            title: "Forced hover state",
            description: "forceHoverState permanent glow + distortion, suitable for demonstrations/screenshots; hoverIntensity adjusts distortion intensity.",
            code: `<Orb forceHoverState hoverIntensity={0.4} />`,
            render: () => (<OrbFrame>
          <Orb forceHoverState hoverIntensity={0.4}/>
        </OrbFrame>),
        },
        {
            title: "Size and Disable Rotation",
            description: "The size is controlled by the outer container; rotateOnHover={false} turns off hover rotation.",
            code: `<div className="relative h-40 w-40 overflow-hidden rounded-2xl bg-bg">
  <Orb rotateOnHover={false} />
</div>`,
            render: () => (<OrbFrame size={160}>
          <Orb rotateOnHover={false}/>
        </OrbFrame>),
        },
    ],
    controls: [
        { prop: "hue", type: "number", defaultValue: 0, label: "Hue rotation (degrees)" },
        { prop: "hoverIntensity", type: "number", defaultValue: 0.2, label: "Hover Strength" },
        { prop: "rotateOnHover", type: "boolean", defaultValue: true, label: "Hover rotation" },
        { prop: "forceHoverState", type: "boolean", defaultValue: false, label: "Forced hover state" },
    ],
    states: [
        {
            name: "Default (blue-purple\u00B7hue=0)",
            render: () => (<OrbFrame>
          <Orb />
        </OrbFrame>),
        },
        {
            name: "chart-1 blue (hue=0)",
            render: () => (<OrbFrame>
          <Orb hue={0}/>
        </OrbFrame>),
        },
        {
            name: "chart-2 Green (hue=120)",
            render: () => (<OrbFrame>
          <Orb hue={120}/>
        </OrbFrame>),
        },
        {
            name: "chart-3 Amber (hue=60)",
            render: () => (<OrbFrame>
          <Orb hue={60}/>
        </OrbFrame>),
        },
        {
            name: "chart-4 purple (hue=300)",
            render: () => (<OrbFrame>
          <Orb hue={300}/>
        </OrbFrame>),
        },
        {
            name: "Forced hover state (glow + distortion)",
            render: () => (<OrbFrame>
          <Orb forceHoverState hoverIntensity={0.4}/>
        </OrbFrame>),
        },
        {
            name: "High intensity hover (hoverIntensity=0.6)",
            render: () => (<OrbFrame>
          <Orb forceHoverState hoverIntensity={0.6} hue={180}/>
        </OrbFrame>),
        },
        {
            name: "Large size 400\u00D7400",
            render: () => (<OrbFrame size={400}>
          <Orb hue={240}/>
        </OrbFrame>),
        },
        {
            name: "Small size 160\u00D7160 (not rotated)",
            render: () => (<OrbFrame size={160}>
          <Orb rotateOnHover={false}/>
        </OrbFrame>),
        },
    ],
    renderWithProps: (p) => (<OrbFrame>
      <Orb hue={p.hue as number} hoverIntensity={p.hoverIntensity as number} rotateOnHover={p.rotateOnHover as boolean} forceHoverState={p.forceHoverState as boolean}/>
    </OrbFrame>),
    toCode: (p) => `<div className="relative h-[280px] w-[280px] overflow-hidden rounded-2xl bg-bg">
  <Orb
    hue={${p.hue}}
    hoverIntensity={${p.hoverIntensity}}
    rotateOnHover={${p.rotateOnHover}}
    forceHoverState={${p.forceHoverState}}
  />
</div>`,
};
