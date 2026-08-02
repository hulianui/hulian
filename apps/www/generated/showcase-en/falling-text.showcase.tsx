"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { FallingText } from "../../../../packages/ui/src/falling-text/falling-text";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const fallingTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "It will be automatically dropped when mounted (trigger=\"auto\"), and words matching the highlightWords prefix will be highlighted.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <FallingText
    text="Hulian Component Library Enterprise Grade High Quality Native Adaptation token Theme"
    highlightWords={["Hulian", "token"]}
    fontSize="1.5rem"
  />
</div>`,
            render: () => (<Stage>
          <FallingText text="Hulian component library enterprise-level high-quality native adaptation token theme" highlightWords={["Hulian", "token"]} className="text-white/90" fontSize="1.5rem"/>
        </Stage>),
        },
        {
            title: "Click to trigger",
            description: "trigger=\"click\" is clicked on the container to start falling (there are also scroll / hover).",
            code: `<FallingText text="Click me and let the words scatter" trigger="click" highlightWords={["Click me"]} />`,
            render: () => (<Stage>
          <FallingText text="Click me to let the words scatter down" trigger="click" highlightWords={["Click me"]} className="text-white/90" fontSize="1.4rem"/>
        </Stage>),
        },
        {
            title: "High gravity and low rebound",
            description: "gravity is large, bounce is small, the word blocks fall to the ground quickly and stack without bouncing.",
            code: `<FallingText text="Gravity Strong Fast Landing Stacking" gravity={2.4} bounce={0.2} />`,
            render: () => (<Stage>
          <FallingText text="gravity 2.4 Gravity Strong Fast Landing Stacking" gravity={2.4} bounce={0.2} className="text-white/90" fontSize="1.3rem"/>
        </Stage>),
        },
        {
            title: "Full of flexibility",
            description: "bounce is close to 1, and the word block bounces repeatedly after landing.",
            code: `<FallingText text="Bounce Bounce" gravity={0.8} bounce={0.9} />`,
            render: () => (<Stage>
          <FallingText text="bouncy bounce bounce bounce bounce" gravity={0.8} bounce={0.9} highlightWords={["bouncy"]} className="text-white/90" fontSize="1.5rem"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "text", type: "text", defaultValue: "Hulian Component Library Enterprise Level High Quality Native Adaptation", label: "Text" },
        { prop: "gravity", type: "number", defaultValue: 1, label: "Gravity" },
        { prop: "bounce", type: "number", defaultValue: 0.6, label: "Rebound coefficient" },
        {
            prop: "trigger",
            type: "select",
            options: ["auto", "scroll", "click", "hover"],
            defaultValue: "auto",
            label: "Trigger timing",
        },
    ],
    states: [
        {
            name: "default (automatically dropped\u00B7highlighted word)",
            render: () => (<Stage>
          <FallingText text="Hulian component library enterprise-level high-quality native adaptation token theme" highlightWords={["Hulian", "token"]} className="text-white/90" fontSize="1.5rem"/>
        </Stage>),
        },
        {
            name: "Click to trigger",
            render: () => (<Stage>
          <FallingText text="Click me to let the words scatter down" trigger="click" highlightWords={["Click me"]} className="text-white/90" fontSize="1.4rem"/>
        </Stage>),
        },
        {
            name: "High gravity\u00B7low rebound (quick stacking)",
            render: () => (<Stage>
          <FallingText text="gravity 2.4 Gravity Strong Fast Landing Stacking" gravity={2.4} bounce={0.2} className="text-white/90" fontSize="1.3rem"/>
        </Stage>),
        },
        {
            name: "Full of elasticity (high rebound)",
            render: () => (<Stage>
          <FallingText text="bouncy bounce bounce bounce bounce" gravity={0.8} bounce={0.9} highlightWords={["bouncy"]} className="text-white/90" fontSize="1.5rem"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <FallingText text={p.text as string} gravity={p.gravity as number} bounce={p.bounce as number} trigger={p.trigger as "auto" | "scroll" | "click" | "hover"} highlightWords={["Hulian", "token"]} className="text-white/90" fontSize="1.5rem"/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <FallingText`,
        `    text="${p.text}"`,
        `    gravity={${p.gravity}}`,
        `    bounce={${p.bounce}}`,
        `    trigger="${p.trigger}"`,
        `    highlightWords={["Hulian", "token"]}`,
        `    className="text-white/90"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
