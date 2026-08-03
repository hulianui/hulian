"use client";
import { Box, Cloud, Cpu, Database, Flame, Hexagon, Layers, Rocket, Sparkles, Zap, } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LogoLoop } from "../../../../packages/ui/src/logo-loop/logo-loop";
import type { LogoItem } from "../../../../packages/ui/src/logo-loop/logo-loop.types";
const NODE_LOGOS: LogoItem[] = [
    { node: <Hexagon className="size-7"/>, ariaLabel: "Hexagon" },
    { node: <Cloud className="size-7"/>, ariaLabel: "Cloud" },
    { node: <Database className="size-7"/>, ariaLabel: "Database" },
    { node: <Cpu className="size-7"/>, ariaLabel: "Cpu" },
    { node: <Layers className="size-7"/>, ariaLabel: "Layers" },
    { node: <Rocket className="size-7"/>, ariaLabel: "Rocket" },
    { node: <Flame className="size-7"/>, ariaLabel: "Flame" },
    { node: <Box className="size-7"/>, ariaLabel: "Box" },
    { node: <Zap className="size-7"/>, ariaLabel: "Zap" },
    { node: <Sparkles className="size-7"/>, ariaLabel: "Sparkles" },
];
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface py-8">
      {children}
    </div>);
}
export const logoLoopShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass in the logos list (mixed arrangement of icons or pictures), and the sequence is automatically copied to achieve seamless infinite scrolling; fadeOut adds fade masks to both ends (eat surface token).",
            code: `const logos = [
  { node: <Hexagon />, ariaLabel: "Hexagon" },
  { node: <Cloud />, ariaLabel: "Cloud" },
  { node: <Database />, ariaLabel: "Database" },
];

<LogoLoop logos={logos} fadeOut />`,
            render: () => (<Stage>
          <LogoLoop logos={NODE_LOGOS} fadeOut/>
        </Stage>),
        },
        {
            title: "Hover to pause + zoom",
            description: "direction controls direction; pauseOnHover hovers to stop scrolling, and scaleOnHover hovers to zoom in on the single logo being pointed at.",
            code: `<LogoLoop
  logos={logos}
  direction="right"
  fadeOut
  pauseOnHover
  scaleOnHover
/>`,
            render: () => (<Stage>
          <LogoLoop logos={NODE_LOGOS} direction="right" fadeOut pauseOnHover scaleOnHover/>
        </Stage>),
        },
        {
            title: "Speed and spacing",
            description: "speed adjusts the scroll speed (px/s, negative value reverses), gap adjusts the item spacing, logoHeight adjusts logo height.",
            code: `<LogoLoop logos={logos} speed={220} gap={56} logoHeight={32} />`,
            render: () => (<Stage>
          <LogoLoop logos={NODE_LOGOS} speed={220} gap={56} logoHeight={32}/>
        </Stage>),
        },
        {
            title: "Vertical scroll",
            description: "direction=\"up\" / \"down\" changes to vertical scrolling and needs to be placed in a container with height.",
            code: `<div className="h-56 overflow-hidden px-8">
  <LogoLoop logos={logos} direction="up" fadeOut />
</div>`,
            render: () => (<div className="h-56 overflow-hidden rounded-xl border border-border bg-surface px-8">
          <LogoLoop logos={NODE_LOGOS} direction="up" fadeOut/>
        </div>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 120, label: "Speed px/s" },
        {
            prop: "direction",
            type: "select",
            options: ["left", "right", "up", "down"],
            defaultValue: "left",
            label: "Direction",
        },
        { prop: "gap", type: "number", defaultValue: 32, label: "Pitch px" },
        { prop: "logoHeight", type: "number", defaultValue: 28, label: "logo Height px" },
        { prop: "fadeOut", type: "boolean", defaultValue: true, label: "Fade out at both ends" },
        { prop: "scaleOnHover", type: "boolean", defaultValue: true, label: "Hover to enlarge" },
        { prop: "pauseOnHover", type: "boolean", defaultValue: true, label: "Hover Pause" },
    ],
    states: [
        {
            name: "default (to the left\u00B7fading at both ends)",
            render: () => (<Stage>
          <LogoLoop logos={NODE_LOGOS} fadeOut/>
        </Stage>),
        },
        {
            name: "Right \u00B7 Hover to pause + zoom",
            render: () => (<Stage>
          <LogoLoop logos={NODE_LOGOS} direction="right" fadeOut pauseOnHover scaleOnHover/>
        </Stage>),
        },
        {
            name: "High speed without fade \u00B7 Large spacing",
            render: () => (<Stage>
          <LogoLoop logos={NODE_LOGOS} speed={220} gap={56} logoHeight={32}/>
        </Stage>),
        },
        {
            name: "Vertical scrolling (within height container)",
            render: () => (<div className="h-56 overflow-hidden rounded-xl border border-border bg-surface px-8">
          <LogoLoop logos={NODE_LOGOS} direction="up" fadeOut/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <LogoLoop logos={NODE_LOGOS} speed={p.speed as number} direction={p.direction as "left" | "right" | "up" | "down"} gap={p.gap as number} logoHeight={p.logoHeight as number} fadeOut={p.fadeOut as boolean} scaleOnHover={p.scaleOnHover as boolean} pauseOnHover={p.pauseOnHover as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<LogoLoop`,
        `  logos={logos}`,
        `  speed={${p.speed}}`,
        `  direction="${p.direction}"`,
        `  gap={${p.gap}}`,
        `  logoHeight={${p.logoHeight}}`,
        `  fadeOut={${p.fadeOut}}`,
        `  scaleOnHover={${p.scaleOnHover}}`,
        `  pauseOnHover={${p.pauseOnHover}}`,
        `/>`,
    ].join("\n"),
};
