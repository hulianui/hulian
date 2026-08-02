"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Shuffle } from "../../../../packages/ui/src/shuffle/shuffle";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex h-40 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const shuffleShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Shuffle and decrypt word by word. Each word bit is first rolled into a random garbled code and then locked to the real word in directional order; hovering can be reshuffled.",
            code: `<Shuffle
  text="HULIAN"
  triggerOnHover
  className="text-3xl font-semibold tracking-wide"
/>`,
            render: () => (<Stage>
          <Shuffle text="HULIAN" triggerOnView={false} triggerOnHover className="text-3xl font-semibold tracking-wide text-white"/>
        </Stage>),
        },
        {
            title: "Parse left",
            description: "When shuffleDirection=left, the characters are locked from right to left, and duration controls the entire duration.",
            code: `<Shuffle
  text="DECRYPTING\u2026"
  shuffleDirection="left"
  duration={0.9}
  triggerOnHover
  className="text-2xl font-medium tracking-widest"
/>`,
            render: () => (<Stage>
          <Shuffle text="DECRYPTING…" shuffleDirection="left" duration={0.9} triggerOnView={false} triggerOnHover className="text-2xl font-medium tracking-widest text-white"/>
        </Stage>),
        },
        {
            title: "Loop + custom character set",
            description: "loop cycle rewashing, scrambleCharset limited garbled sampling characters (only hexadecimal characters here).",
            code: `<Shuffle
  text="0xC0FFEE"
  loop
  loopDelay={1.2}
  scrambleCharset="0123456789ABCDEF"
  duration={0.7}
  className="text-3xl font-bold"
/>`,
            render: () => (<Stage>
          <Shuffle text="0xC0FFEE" loop loopDelay={1.2} scrambleCharset="0123456789ABCDEF" duration={0.7} triggerOnView={false} className="text-3xl font-bold text-white"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "text", type: "text", defaultValue: "HULIAN", label: "Text" },
        { prop: "duration", type: "number", defaultValue: 0.6, label: "Duration (seconds)" },
        {
            prop: "shuffleDirection",
            type: "select",
            options: ["right", "left"],
            defaultValue: "right",
            label: "Direction",
        },
        { prop: "loop", type: "boolean", defaultValue: false, label: "Loop" },
        {
            prop: "triggerOnHover",
            type: "boolean",
            defaultValue: true,
            label: "Hover to rewash",
        },
    ],
    states: [
        {
            name: "default (parse to the right)",
            render: () => (<Stage>
          <Shuffle text="HULIAN" triggerOnView={false} triggerOnHover className="text-3xl font-semibold tracking-wide text-white"/>
        </Stage>),
        },
        {
            name: "Parse left \u00B7 Long text",
            render: () => (<Stage>
          <Shuffle text="DECRYPTING…" shuffleDirection="left" duration={0.9} triggerOnView={false} triggerOnHover className="text-2xl font-medium tracking-widest text-white"/>
        </Stage>),
        },
        {
            name: "Loop \u00B7 Custom character set",
            render: () => (<Stage>
          <Shuffle text="0xC0FFEE" loop loopDelay={1.2} scrambleCharset="0123456789ABCDEF" duration={0.7} triggerOnView={false} className="text-3xl font-bold text-white"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Shuffle text={(p.text as string) || "HULIAN"} duration={p.duration as number} shuffleDirection={p.shuffleDirection as "left" | "right"} loop={p.loop as boolean} triggerOnHover={p.triggerOnHover as boolean} triggerOnView={false} className="text-3xl font-semibold tracking-wide text-white"/>
    </Stage>),
    toCode: (p) => [
        `<Shuffle`,
        `  text="${p.text}"`,
        `  duration={${p.duration}}`,
        `  shuffleDirection="${p.shuffleDirection}"`,
        `  loop={${p.loop}}`,
        `  triggerOnHover={${p.triggerOnHover}}`,
        `  className="text-3xl font-semibold"`,
        `/>`,
    ].join("\n"),
};
