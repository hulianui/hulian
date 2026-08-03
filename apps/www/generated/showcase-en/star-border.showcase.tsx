import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { StarBorder } from "../../../../packages/ui/src/star-border/star-border";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex h-40 w-full max-w-xl items-center justify-center rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const starBorderShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default rendering is a button, with the upper and lower meteor light strips sweeping back and forth along the stroke; the light strip color is primary token.",
            code: `<StarBorder>Start now</StarBorder>`,
            render: () => (<Stage>
          <StarBorder>Start now</StarBorder>
        </Stage>),
        },
        {
            title: "Custom color",
            description: "color Feed radial-gradient, you can pass any CSS color or token.",
            code: `<StarBorder color="var(--color-chart-3)">Limited time event</StarBorder>`,
            render: () => (<Stage>
          <StarBorder color="var(--color-chart-3)">Limited time event</StarBorder>
        </Stage>),
        },
        {
            title: "Speed and thickness",
            description: "speed The smaller it is, the more active it is; thickness spreads the upper and lower padding to determine the stroke thickness.",
            code: `<StarBorder speed={3} thickness={2}>
  Highly active
</StarBorder>`,
            render: () => (<Stage>
          <StarBorder speed={3} thickness={2}>
            Highly active
          </StarBorder>
        </Stage>),
        },
        {
            title: "Polymorphic rendering (as)",
            description: "as=\"a\" is rendered as a link, and the DOM attribute is transparently passed to the element.",
            code: `<StarBorder as="a" href="/docs" color="var(--color-chart-2)">
  View document \u2192
</StarBorder>`,
            render: () => (<Stage>
          <StarBorder as="a" color="var(--color-chart-2)" className="cursor-pointer">
            View document →
          </StarBorder>
        </Stage>),
        },
    ],
    controls: [
        { prop: "color", type: "text", defaultValue: "var(--color-primary)", label: "Light strip color" },
        { prop: "speed", type: "number", defaultValue: 6, label: "Scan seconds" },
        { prop: "thickness", type: "number", defaultValue: 1, label: "Stroke thickness px" },
    ],
    states: [
        {
            name: "default (main color light strip\u00B7button)",
            render: () => (<Stage>
          <StarBorder>Start now</StarBorder>
        </Stage>),
        },
        {
            name: "Custom color (warm orange)",
            render: () => (<Stage>
          <StarBorder color="var(--color-chart-3)">Limited time event</StarBorder>
        </Stage>),
        },
        {
            name: "Quick + Bold Stroke",
            render: () => (<Stage>
          <StarBorder speed={3} thickness={2}>
            Highly active
          </StarBorder>
        </Stage>),
        },
        {
            name: "Polymorphic: link (as=a)",
            render: () => (<Stage>
          <StarBorder as="a" color="var(--color-chart-2)" className="cursor-pointer">
            View document →
          </StarBorder>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <StarBorder color={p.color as string} speed={p.speed as number} thickness={p.thickness as number}>
        Start now
      </StarBorder>
    </Stage>),
    toCode: (p) => [
        `<StarBorder`,
        `  color="${p.color}"`,
        `  speed={${p.speed}}`,
        `  thickness={${p.thickness}}`,
        `>`,
        `  Start now`,
        `</StarBorder>`,
    ].join("\n"),
};
