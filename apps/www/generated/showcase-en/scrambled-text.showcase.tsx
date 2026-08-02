"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ScrambledText } from "../../../../packages/ui/src/scrambled-text/scrambled-text";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="w-full max-w-xl rounded-xl border border-border bg-surface p-8">
      {children}
    </div>);
}
const SAMPLE = "Move the pointer over this text \u2014 Hover scrambles the glyphs.";
export const scrambledTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Move the pointer over the text, and the characters within the radius will roll over into garbled characters one by one and then converge back to the original characters.",
            code: `<ScrambledText>
  Move the pointer over this text \u2014 Hover scrambles the glyphs.
</ScrambledText>`,
            render: () => (<Stage>
          <ScrambledText>{SAMPLE}</ScrambledText>
        </Stage>),
        },
        {
            title: "Effective radius",
            description: "radius controls how close the pointer is to the characters in px before triggering the roll. The larger the pointer, the wider the range.",
            code: `<ScrambledText radius={160}>
  HULIAN UI \u00B7 Scramble On Hover
</ScrambledText>`,
            render: () => (<Stage>
          <ScrambledText radius={160}>HULIAN UI · Scramble On Hover</ScrambledText>
        </Stage>),
        },
        {
            title: "Custom character set",
            description: "scrambleChars Determine the characters used for random replacement during the garbled process, and replace them with full-width block characters for a more deconstructed feel.",
            code: `<ScrambledText scrambleChars="\u2588\u2593\u2592\u2591">
  HULIAN UI \u00B7 Scramble On Hover
</ScrambledText>`,
            render: () => (<Stage>
          <ScrambledText scrambleChars="█▓▒░">HULIAN UI · Scramble On Hover</ScrambledText>
        </Stage>),
        },
        {
            title: "Fast convergence",
            description: "When speed is turned up and duration is turned down, the garbled characters flash faster and the words return more quickly, like binary decay.",
            code: `<ScrambledText duration={0.6} speed={0.9} scrambleChars="01">
  0101 binary decay 1010
</ScrambledText>`,
            render: () => (<Stage>
          <ScrambledText duration={0.6} speed={0.9} scrambleChars="01">
            0101 binary decay 1010
          </ScrambledText>
        </Stage>),
        },
    ],
    controls: [
        { prop: "radius", type: "number", defaultValue: 100, label: "Effective radius px" },
        { prop: "duration", type: "number", defaultValue: 1.2, label: "Rolling duration s" },
        { prop: "speed", type: "number", defaultValue: 0.5, label: "Rolling speed 0~1" },
        { prop: "scrambleChars", type: "text", defaultValue: ".:", label: "Garbled character set" },
    ],
    states: [
        {
            name: "default (default .: character set)",
            render: () => (<Stage>
          <ScrambledText>{SAMPLE}</ScrambledText>
        </Stage>),
        },
        {
            name: "Large radius \u00B7 Full-width symbol set",
            render: () => (<Stage>
          <ScrambledText radius={160} scrambleChars="█▓▒░">
            HULIAN UI · Scramble On Hover
          </ScrambledText>
        </Stage>),
        },
        {
            name: "Fast convergence (speed high \u00B7 short duration)",
            render: () => (<Stage>
          <ScrambledText duration={0.6} speed={0.9} scrambleChars="01">
            0101 binary decay 1010
          </ScrambledText>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ScrambledText radius={p.radius as number} duration={p.duration as number} speed={p.speed as number} scrambleChars={p.scrambleChars as string}>
        {SAMPLE}
      </ScrambledText>
    </Stage>),
    toCode: (p) => [
        `<ScrambledText`,
        `  radius={${p.radius}}`,
        `  duration={${p.duration}}`,
        `  speed={${p.speed}}`,
        `  scrambleChars=${JSON.stringify(p.scrambleChars)}`,
        `>`,
        `  Move the pointer over this text \u2014 Hover scrambles the glyphs.`,
        `</ScrambledText>`,
    ].join("\n"),
};
