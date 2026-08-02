"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { SplitText } from "../../../../packages/ui/src/split-text/split-text";
export const splitTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Fade in from the bottom word by word, Chinese friendly (divided according to code points).",
            code: `<SplitText text="Make development faster, more stable and more beautiful" className="text-3xl font-bold text-foreground" />`,
            render: () => (<SplitText text="Make development faster, more stable and more beautiful" className="text-3xl font-bold text-foreground"/>),
        },
        {
            title: "Word-by-word segmentation",
            description: "splitType=\"word\" Enter word by word according to the blank space, suitable for English slogans.",
            code: `<SplitText
  text="Build faster with Hulian"
  splitType="word"
  from="left"
  className="text-3xl font-bold text-primary"
/>`,
            render: () => (<SplitText text="Build faster with Hulian" splitType="word" from="left" className="text-3xl font-bold text-primary"/>),
        },
        {
            title: "Approach direction",
            description: "from controls the entry direction of each segment of displacement: top / bottom / left / right.",
            code: `<SplitText
  text="Title falling from top to bottom"
  from="top"
  className="text-3xl font-bold text-foreground"
/>`,
            render: () => (<SplitText text="Title falling from top to bottom" from="top" className="text-3xl font-bold text-foreground"/>),
        },
        {
            title: "Staggered rhythm and duration",
            description: "delay adjusts the peak stagger milliseconds of adjacent segments, duration adjusts the duration of a single segment, and makes a slower and more relaxed hero entry.",
            code: `<SplitText
  text="Slow-tempo stretch entrance"
  delay={90}
  duration={0.8}
  className="text-3xl font-bold text-primary"
/>`,
            render: () => (<SplitText text="Slow-tempo stretch entrance" delay={90} duration={0.8} className="text-3xl font-bold text-primary"/>),
        },
    ],
    controls: [
        { prop: "splitType", type: "select", options: ["char", "word"], defaultValue: "char" },
        {
            prop: "from",
            type: "select",
            options: ["bottom", "top", "left", "right"],
            defaultValue: "bottom",
        },
        { prop: "delay", type: "number", defaultValue: 40 },
    ],
    states: [
        {
            name: "default (vertical bottom fade in)",
            render: () => (<SplitText text="Make development faster, more stable and more beautiful" className="text-3xl font-bold text-foreground"/>),
        },
        {
            name: "word (word by word \u00B7 English)",
            render: () => (<SplitText text="Build faster with Hulian" splitType="word" from="left" className="text-3xl font-bold text-primary"/>),
        },
    ],
    renderWithProps: (p) => (<SplitText key={`${p.splitType}-${p.from}-${p.delay}`} text="The title of entering the market at different peaks step by step" splitType={p.splitType as "char" | "word"} from={p.from as "bottom"} delay={p.delay as number} className="text-3xl font-bold text-foreground"/>),
    toCode: (p) => `<SplitText text="Title of peak-staggered entry step by step" splitType="${p.splitType}" from="${p.from}" delay={${p.delay}} />`,
};
