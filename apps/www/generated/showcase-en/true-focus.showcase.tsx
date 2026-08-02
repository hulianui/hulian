"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TrueFocus } from "../../../../packages/ui/src/true-focus/true-focus";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex h-40 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border bg-surface px-6">
      {children}
    </div>);
}
export const trueFocusShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Input the whole sentence, press the space to segment the words and automatically cycle through the focus, leaving the remaining words blurred.",
            code: `<TrueFocus
  sentence="True Focus Effect"
  className="text-3xl font-bold text-foreground"
/>`,
            render: () => (<Stage>
          <TrueFocus sentence="True Focus Effect" className="text-3xl font-bold text-foreground"/>
        </Stage>),
        },
        {
            title: "Manual hover focus",
            description: "manualMode Turn off the automatic carousel and focus on a word by hovering the mouse.",
            code: `<TrueFocus
  sentence="Hover each word"
  manualMode
  className="text-3xl font-bold text-foreground"
/>`,
            render: () => (<Stage>
          <TrueFocus sentence="Hover each word" manualMode className="text-3xl font-bold text-foreground"/>
        </Stage>),
        },
        {
            title: "Customize corner frame color",
            description: "borderColor accepts the legal CSS color, and it is recommended to eat token with the --color- prefix.",
            code: `<TrueFocus
  sentence="Hulian Real Focus"
  borderColor="var(--color-primary)"
  blurAmount={6}
  className="text-3xl font-bold text-foreground"
/>`,
            render: () => (<Stage>
          <TrueFocus sentence="Hulian Real Focus" borderColor="var(--color-primary)" blurAmount={6} className="text-3xl font-bold text-foreground"/>
        </Stage>),
        },
        {
            title: "Adjust blur and dwell",
            description: "blurAmount controls the out-of-focus blur radius, and animationDuration controls the word dwell seconds.",
            code: `<TrueFocus
  sentence="Slow Heavy Blur Focus"
  blurAmount={9}
  animationDuration={2}
  className="text-3xl font-bold text-foreground"
/>`,
            render: () => (<Stage>
          <TrueFocus sentence="Slow Heavy Blur Focus" blurAmount={9} animationDuration={2} className="text-3xl font-bold text-foreground"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "blurAmount", type: "number", defaultValue: 5, label: "Out of focus blur px" },
        { prop: "manualMode", type: "boolean", defaultValue: false, label: "Manual hover" },
        { prop: "animationDuration", type: "number", defaultValue: 1.2, label: "Stay seconds" },
    ],
    states: [
        {
            name: "default (auto focus carousel)",
            render: () => (<Stage>
          <TrueFocus sentence="True Focus Effect" className="text-3xl font-bold text-foreground"/>
        </Stage>),
        },
        {
            name: "manualMode (hover a word to focus)",
            render: () => (<Stage>
          <TrueFocus sentence="Hover each word" manualMode className="text-3xl font-bold text-foreground"/>
        </Stage>),
        },
        {
            name: "Customized corner frame color (main color token)",
            render: () => (<Stage>
          <TrueFocus sentence="Hulian Real Focus" borderColor="var(--color-primary)" blurAmount={6} className="text-3xl font-bold text-foreground"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <TrueFocus sentence="Hulian Real Focus Effect" blurAmount={p.blurAmount as number} manualMode={p.manualMode as boolean} animationDuration={p.animationDuration as number} className="text-3xl font-bold text-foreground"/>
    </Stage>),
    toCode: (p) => [
        `<TrueFocus`,
        `  sentence="Hulian Real Focus Effect"`,
        `  blurAmount={${p.blurAmount}}`,
        `  manualMode={${p.manualMode}}`,
        `  animationDuration={${p.animationDuration}}`,
        `/>`,
    ].join("\n"),
};
