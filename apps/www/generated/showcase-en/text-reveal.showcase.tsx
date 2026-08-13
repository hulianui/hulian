import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TextReveal } from "../../../../packages/ui/src/text-reveal/text-reveal";
export const textRevealShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "An \"in progress\" status label",
            description: "What this component is for: the stage name of a long background task. repeat keeps it sweeping, because the animation stopping is itself an error signal - the user reads \"still moving\" as \"the task is still alive\". startOnView={false} is there because such a label usually sits in the viewport from the start.",
            code: `<TextReveal text="Running OCR" repeat startOnView={false} className="text-sm" />`,
            render: () => (<TextReveal text="Running OCR" repeat startOnView={false} className="text-sm font-medium"/>),
        },
        {
            title: "Rotating strings (the widest one reserves the width)",
            description: "An array moves to the next string after each sweep. The box takes the width of the widest one, so switching strings never nudges its neighbours.",
            code: `<TextReveal text={["Running OCR", "Parsing", "Archiving"]} repeat startOnView={false} />`,
            render: () => (<span className="inline-flex items-center gap-2 text-sm">
          <TextReveal text={["Running OCR", "Parsing", "Archiving"]} repeat startOnView={false} className="font-medium"/>
          <span className="text-muted-foreground">- this text never jumps</span>
        </span>),
        },
        {
            title: "Entrance: reveal once on scroll",
            description: "The default startOnView without repeat: one sweep as it scrolls into view, resting fully revealed. Good for headings and pull quotes.",
            code: `<TextReveal text="Make development faster, more stable and more beautiful" className="text-2xl font-bold" />`,
            render: () => <TextReveal text="Make development faster, more stable and more beautiful" className="text-2xl font-bold"/>,
        },
        {
            title: "Band colours and timing",
            description: "colors sets the colours of the sweeping band (five theme-aware tokens, chart-1..5, by default) and duration sets the seconds of one sweep. A single colour works too.",
            code: `<TextReveal
  text="Syncing"
  colors={["var(--color-primary)"]}
  duration={1.2}
  repeat
  startOnView={false}
/>`,
            render: () => (<TextReveal text="Syncing" colors={["var(--color-primary)"]} duration={1.2} repeat startOnView={false} className="text-base font-medium"/>),
        },
    ],
    controls: [
        { prop: "duration", type: "number", defaultValue: 2 },
        { prop: "repeat", type: "boolean", defaultValue: true },
        { prop: "startOnView", type: "boolean", defaultValue: false },
    ],
    states: [
        {
            name: "default (a looping task-status label)",
            render: () => (<TextReveal text="Running OCR" repeat startOnView={false} className="text-sm font-medium"/>),
        },
        {
            name: "Rotating strings",
            render: () => (<TextReveal text={["Running OCR", "Parsing", "Archiving"]} repeat startOnView={false} className="text-sm font-medium"/>),
        },
        {
            name: "Single-colour band",
            render: () => (<TextReveal text="Syncing" colors={["var(--color-primary)"]} repeat startOnView={false} className="text-sm font-medium"/>),
        },
    ],
    renderWithProps: (p) => (<TextReveal text="Running OCR" className="text-base font-medium" duration={p.duration as number} repeat={p.repeat as boolean} startOnView={p.startOnView as boolean}/>),
    toCode: (p) => `<TextReveal text="Running OCR" duration={${p.duration}} repeat={${p.repeat}} startOnView={${p.startOnView}} />`,
};
