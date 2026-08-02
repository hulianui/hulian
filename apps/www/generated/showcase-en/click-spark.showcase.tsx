"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ClickSpark } from "../../../../packages/ui/src/click-spark/click-spark";
function Stage({ children, dark = false, }: {
    children?: React.ReactNode;
    dark?: boolean;
}) {
    return (<div className="relative h-56 w-full max-w-xl cursor-pointer select-none overflow-hidden rounded-xl border border-border" style={dark
            ? { background: "oklch(0.16 0.02 255)" }
            : { background: "var(--color-surface)" }}>
      {children}
    </div>);
}
const Hint = ({ light = false }: {
    light?: boolean;
}) => (<div className="pointer-events-none flex h-full items-center justify-center">
    <span className={light
        ? "text-sm font-medium text-white/70" : "text-sm font-medium text-muted"}>
      Click here to emit sparks
    </span>
  </div>);
export const clickSparkShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Wrap any content and click anywhere within it to emit a circle of foreground color sparks at the click point.",
            code: `<div className="relative h-56 cursor-pointer overflow-hidden rounded-xl border border-border">
  <ClickSpark className="absolute inset-0">
    {/* Your content */}
  </ClickSpark>
</div>`,
            render: () => (<Stage>
          <ClickSpark className="absolute inset-0">
            <Hint />
          </ClickSpark>
        </Stage>),
        },
        {
            title: "Custom color and quantity",
            description: "sparkColor goes to token, sparkCount / sparkRadius to control spark density and burst range.",
            code: `<ClickSpark
  sparkColor="var(--color-chart-3)"
  sparkCount={12}
  sparkRadius={22}
  className="absolute inset-0"
>
  {/* Your content */}
</ClickSpark>`,
            render: () => (<Stage dark>
          <ClickSpark sparkColor="var(--color-chart-3)" sparkCount={12} sparkRadius={22} className="absolute inset-0">
            <Hint light/>
          </ClickSpark>
        </Stage>),
        },
        {
            title: "Big outbreak",
            description: "Lengthen the line segment, enlarge the radius, and slow down the easing for a more dramatic celebratory burst.",
            code: `<ClickSpark
  sparkColor="var(--color-chart-1)"
  sparkCount={16}
  sparkSize={18}
  sparkRadius={36}
  duration={700}
  easing="ease-in-out"
  extraScale={1.2}
  className="absolute inset-0"
>
  {/* Your content */}
</ClickSpark>`,
            render: () => (<Stage dark>
          <ClickSpark sparkColor="var(--color-chart-1)" sparkCount={16} sparkSize={18} sparkRadius={36} duration={700} easing="ease-in-out" extraScale={1.2} className="absolute inset-0">
            <Hint light/>
          </ClickSpark>
        </Stage>),
        },
    ],
    controls: [
        { prop: "sparkCount", type: "number", defaultValue: 8, label: "Spark quantity" },
        { prop: "sparkSize", type: "number", defaultValue: 10, label: "Line length px" },
        { prop: "sparkRadius", type: "number", defaultValue: 15, label: "Flying radius px" },
        { prop: "duration", type: "number", defaultValue: 400, label: "Duration ms" },
        {
            prop: "easing",
            type: "select",
            options: ["ease-out", "ease-in", "ease-in-out", "linear"],
            defaultValue: "ease-out",
            label: "Easing",
        },
    ],
    states: [
        {
            name: "default (foreground color sparkles\u00B7default parameters)",
            render: () => (<Stage>
          <ClickSpark className="absolute inset-0">
            <Hint />
          </ClickSpark>
        </Stage>),
        },
        {
            name: "Dark base + warm orange sparkle",
            render: () => (<Stage dark>
          <ClickSpark sparkColor="var(--color-chart-3)" sparkCount={12} sparkRadius={22} className="absolute inset-0">
            <Hint light/>
          </ClickSpark>
        </Stage>),
        },
        {
            name: "Big explosion (long line segment\u00B7slow motion)",
            render: () => (<Stage dark>
          <ClickSpark sparkColor="var(--color-chart-1)" sparkCount={16} sparkSize={18} sparkRadius={36} duration={700} easing="ease-in-out" extraScale={1.2} className="absolute inset-0">
            <Hint light/>
          </ClickSpark>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ClickSpark sparkCount={p.sparkCount as number} sparkSize={p.sparkSize as number} sparkRadius={p.sparkRadius as number} duration={p.duration as number} easing={p.easing as "ease-out" | "ease-in" | "ease-in-out" | "linear"} className="absolute inset-0">
        <Hint />
      </ClickSpark>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 cursor-pointer overflow-hidden rounded-xl border border-border">`,
        `  <ClickSpark`,
        `    sparkCount={${p.sparkCount}}`,
        `    sparkSize={${p.sparkSize}}`,
        `    sparkRadius={${p.sparkRadius}}`,
        `    duration={${p.duration}}`,
        `    easing="${p.easing}"`,
        `    className="absolute inset-0"`,
        `  >`,
        `    {/* Your content */}`,
        `  </ClickSpark>`,
        `</div>`,
    ].join("\n"),
};
