"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { OrbitImages } from "../../../../packages/ui/src/orbit-images/orbit-images";
import type { OrbitShape } from "../../../../packages/ui/src/orbit-images/orbit-images.types";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface p-4">
      {children}
    </div>);
}
function chips(n: number) {
    const tones = [
        "var(--color-chart-1)",
        "var(--color-chart-2)",
        "var(--color-chart-3)",
        "var(--color-chart-4)",
        "var(--color-chart-5)",
    ];
    return Array.from({ length: n }, (_, i) => (<div key={i} className="grid h-full w-full place-items-center rounded-full text-xs font-semibold text-bg shadow-sm" style={{ background: tones[i % tones.length] }}>
      {i + 1}
    </div>));
}
export const orbitImagesShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The elliptical orbit is filled with sub-items at equal intervals and surrounds at a constant speed; centerContent stacks the static center.",
            code: `<OrbitImages
  items={images.map((src) => (
    <img key={src} src={src} alt="" className="h-full w-full rounded-full object-cover" />
  ))}
  shape="ellipse"
  duration={24}
  itemSize={48}
  showPath
  centerContent={<span className="text-sm font-semibold">Hulian</span>}
/>`,
            render: () => (<Stage>
          <OrbitImages items={chips(6)} shape="ellipse" duration={24} itemSize={48} showPath centerContent={<span className="text-sm font-semibold text-foreground">Hulian</span>}/>
        </Stage>),
        },
        {
            title: "Circular Orbit",
            description: "shape=circle is equipped with radius to control the circle diameter, and more sub-items are evenly distributed.",
            code: `<OrbitImages
  items={avatars}
  shape="circle"
  radius={260}
  duration={30}
  itemSize={44}
/>`,
            render: () => (<Stage>
          <OrbitImages items={chips(8)} shape="circle" radius={260} duration={30} itemSize={44}/>
        </Stage>),
        },
        {
            title: "Star Orbit\u00B7Reverse",
            description: "shape=star takes the star path, direction=reverse lets the children flow in the reverse direction.",
            code: `<OrbitImages
  items={avatars}
  shape="star"
  radius={300}
  duration={28}
  itemSize={40}
  direction="reverse"
  showPath
/>`,
            render: () => (<Stage>
          <OrbitImages items={chips(5)} shape="star" radius={300} duration={28} itemSize={40} direction="reverse" showPath/>
        </Stage>),
        },
        {
            title: "Infinity symbol\u00B7Filing away",
            description: "shape=infinity takes the \u221E path; fill=false lets the children start from the same starting point.",
            code: `<OrbitImages
  items={avatars}
  shape="infinity"
  radiusX={620}
  radiusY={220}
  duration={20}
  itemSize={44}
  fill={false}
  showPath
/>`,
            render: () => (<Stage>
          <OrbitImages items={chips(4)} shape="infinity" radiusX={620} radiusY={220} duration={20} itemSize={44} fill={false} showPath/>
        </Stage>),
        },
    ],
    controls: [
        {
            prop: "shape",
            type: "select",
            options: [
                "ellipse",
                "circle",
                "square",
                "triangle",
                "star",
                "heart",
                "infinity",
                "wave",
            ],
            defaultValue: "ellipse",
            label: "Orbit shape",
        },
        { prop: "duration", type: "number", defaultValue: 24, label: "Seconds per lap" },
        { prop: "itemSize", type: "number", defaultValue: 48, label: "Sub-item size px" },
        { prop: "rotation", type: "number", defaultValue: -8, label: "Tilt angle deg" },
        { prop: "showPath", type: "boolean", defaultValue: false, label: "Trace the track" },
        { prop: "fill", type: "boolean", defaultValue: true, label: "Isometric spread" },
    ],
    states: [
        {
            name: "default (elliptical orbit\u00B7equidistant paved)",
            render: () => (<Stage>
          <OrbitImages items={chips(6)} shape="ellipse" duration={24} itemSize={48} showPath centerContent={<span className="text-sm font-semibold text-foreground">Hulian</span>}/>
        </Stage>),
        },
        {
            name: "Circular Orbit",
            render: () => (<Stage>
          <OrbitImages items={chips(8)} shape="circle" radius={260} duration={30} itemSize={44}/>
        </Stage>),
        },
        {
            name: "Star Orbit\u00B7Reverse",
            render: () => (<Stage>
          <OrbitImages items={chips(5)} shape="star" radius={300} duration={28} itemSize={40} direction="reverse" showPath/>
        </Stage>),
        },
        {
            name: "Infinity symbol\u00B7Filing away",
            render: () => (<Stage>
          <OrbitImages items={chips(4)} shape="infinity" radiusX={620} radiusY={220} duration={20} itemSize={44} fill={false} showPath/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <OrbitImages items={chips(6)} shape={p.shape as OrbitShape} duration={p.duration as number} itemSize={p.itemSize as number} rotation={p.rotation as number} showPath={p.showPath as boolean} fill={p.fill as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<OrbitImages`,
        `  items={images.map((src) => (`,
        `    <img key={src} src={src} alt="" className="h-full w-full rounded-full object-cover" />`,
        `  ))}`,
        `  shape="${p.shape}"`,
        `  duration={${p.duration}}`,
        `  itemSize={${p.itemSize}}`,
        `  rotation={${p.rotation}}`,
        `  showPath={${p.showPath}}`,
        `  fill={${p.fill}}`,
        `/>`,
    ].join("\n"),
};
