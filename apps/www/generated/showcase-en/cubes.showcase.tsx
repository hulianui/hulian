"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Cubes } from "../../../../packages/ui/src/cubes/cubes";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative flex h-72 w-full max-w-md items-center justify-center overflow-hidden rounded-xl border border-border p-6" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const cubesShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Default 8\u00D78 cube array: The cube that the pointer is close to is attenuated and tilted according to the distance, and automatically wanders when idle. Click to spread the ripples outward. Containers need to be of given size.",
            code: `<div className="h-56 w-56">
  <Cubes />
</div>`,
            render: () => (<Stage>
          <div className="h-56 w-56">
            <Cubes />
          </div>
        </Stage>),
        },
        {
            title: "Grid density",
            description: "gridSize controls the array side length (the number of DOM is square, recommended \u2264 12); cooperates with maxAngle / radius to adjust the tilt amplitude and influence radius.",
            code: `<div className="h-56 w-56">
  <Cubes gridSize={12} maxAngle={60} radius={4} />
</div>`,
            render: () => (<Stage>
          <div className="h-56 w-56">
            <Cubes gridSize={12} maxAngle={60} radius={4}/>
          </div>
        </Stage>),
        },
        {
            title: "Brand color ripples",
            description: "faceColor / edgeColor / rippleColor Eat all token; click to spread the highlight outwards from the hit point in a circular shape, rippleSpeed to control the diffusion speed.",
            code: `<div className="h-56 w-56">
  <Cubes
    faceColor="var(--color-surface)"
    edgeColor="var(--color-primary)"
    rippleColor="var(--color-chart-2)"
    rippleSpeed={3}
  />
</div>`,
            render: () => (<Stage>
          <div className="h-56 w-56">
            <Cubes faceColor="var(--color-surface)" edgeColor="var(--color-primary)" rippleColor="var(--color-chart-2)" rippleSpeed={3}/>
          </div>
        </Stage>),
        },
        {
            title: "Still (turn off automatic wandering)",
            description: "autoAnimate={false} Turn off idle roaming, the cube only tilts when the pointer interacts, and stays flat normally.",
            code: `<div className="h-56 w-56">
  <Cubes gridSize={6} autoAnimate={false} />
</div>`,
            render: () => (<Stage>
          <div className="h-56 w-56">
            <Cubes gridSize={6} autoAnimate={false}/>
          </div>
        </Stage>),
        },
    ],
    controls: [
        { prop: "gridSize", type: "number", defaultValue: 8, label: "Grid side length" },
        { prop: "maxAngle", type: "number", defaultValue: 45, label: "Maximum inclination angle\u00B0" },
        { prop: "radius", type: "number", defaultValue: 3, label: "Radius of influence (grid)" },
        { prop: "rippleSpeed", type: "number", defaultValue: 2, label: "Ripple speed" },
        { prop: "autoAnimate", type: "boolean", defaultValue: true, label: "Automatic roaming when idle" },
        { prop: "rippleOnClick", type: "boolean", defaultValue: true, label: "Click on Ripple" },
    ],
    states: [
        {
            name: "default (8\u00D78 \u00B7 Default parameters)",
            render: () => (<Stage>
          <div className="h-56 w-56">
            <Cubes />
          </div>
        </Stage>),
        },
        {
            name: "Dense small grid (12\u00D712)",
            render: () => (<Stage>
          <div className="h-56 w-56">
            <Cubes gridSize={12} maxAngle={60} radius={4}/>
          </div>
        </Stage>),
        },
        {
            name: "Brand color ripple (click to try)",
            render: () => (<Stage>
          <div className="h-56 w-56">
            <Cubes gridSize={8} faceColor="var(--color-surface)" edgeColor="var(--color-primary)" rippleColor="var(--color-chart-2)" rippleSpeed={3}/>
          </div>
        </Stage>),
        },
        {
            name: "Still (turn off automatic wandering)",
            render: () => (<Stage>
          <div className="h-56 w-56">
            <Cubes gridSize={6} autoAnimate={false}/>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <div className="h-56 w-56">
        <Cubes gridSize={p.gridSize as number} maxAngle={p.maxAngle as number} radius={p.radius as number} rippleSpeed={p.rippleSpeed as number} autoAnimate={p.autoAnimate as boolean} rippleOnClick={p.rippleOnClick as boolean}/>
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="h-56 w-56">`,
        `  <Cubes`,
        `    gridSize={${p.gridSize}}`,
        `    maxAngle={${p.maxAngle}}`,
        `    radius={${p.radius}}`,
        `    rippleSpeed={${p.rippleSpeed}}`,
        `    autoAnimate={${p.autoAnimate}}`,
        `    rippleOnClick={${p.rippleOnClick}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
