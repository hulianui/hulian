"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { BlurText } from "../../../../packages/ui/src/blur-text/blur-text";
export const blurTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Word by word analysis from fuzzy + displacement to clear in two steps, advancing in waves.",
            code: `<BlurText text="Isn't this so cool?!" className="text-3xl font-bold text-foreground" />`,
            render: () => (<BlurText text="Isn't this so cool?!" className="text-3xl font-bold text-foreground"/>),
        },
        {
            title: "Verbatim \u00B7 Chinese \u00B7 Float in from the bottom",
            description: "splitType=\"char\" is parsed word by word, direction=\"bottom\" floats in from below.",
            code: `<BlurText
  text="Clearly emerging Hulian title"
  splitType="char"
  direction="bottom"
  className="text-3xl font-bold text-primary"
/>`,
            render: () => (<BlurText text="The clearly displayed title of Hulian" splitType="char" direction="bottom" className="text-3xl font-bold text-primary"/>),
        },
        {
            title: "Starting blur and peak shifting",
            description: "blur adjusts the starting blur pixel, and delay adjusts the adjacent segment peak shift milliseconds to create a stronger hero level of resolution.",
            code: `<BlurText
  text="Enterprise-grade components \u00B7 High quality \u00B7 Native adaptation"
  splitType="char"
  delay={90}
  blur={12}
  className="text-2xl font-semibold text-muted"
/>`,
            render: () => (<BlurText text="Enterprise-level components · High quality · Native adaptation" splitType="char" delay={90} blur={12} className="text-2xl font-semibold text-muted"/>),
        },
    ],
    controls: [
        { prop: "splitType", type: "select", options: ["word", "char"], defaultValue: "word", label: "Segmentation granularity" },
        { prop: "direction", type: "select", options: ["top", "bottom"], defaultValue: "top", label: "Approach direction" },
        { prop: "blur", type: "number", defaultValue: 8, label: "Starting blur px" },
        { prop: "delay", type: "number", defaultValue: 120, label: "Peak offset milliseconds" },
    ],
    states: [
        {
            name: "default (word-by-word fuzzy analysis)",
            render: () => (<BlurText text="Isn't this so cool?!" className="text-3xl font-bold text-foreground"/>),
        },
        {
            name: "char (Verbatim \u00B7 Chinese \u00B7 Float in from below)",
            render: () => (<BlurText text="The clearly displayed title of Hulian" splitType="char" direction="bottom" className="text-3xl font-bold text-primary"/>),
        },
        {
            name: "Large size slow peak shifting (hero grade)",
            render: () => (<BlurText text="Enterprise-level components · High quality · Native adaptation" splitType="char" delay={90} blur={12} className="text-2xl font-semibold text-muted"/>),
        },
    ],
    renderWithProps: (p) => (<BlurText key={`${p.splitType}-${p.direction}-${p.blur}-${p.delay}`} text="Fuzzy parsed title text Blur Text" splitType={p.splitType as "word" | "char"} direction={p.direction as "top" | "bottom"} blur={p.blur as number} delay={p.delay as number} className="text-3xl font-bold text-foreground"/>),
    toCode: (p) => `<BlurText text="Fuzzy parsed title text" splitType="${p.splitType}" direction="${p.direction}" blur={${p.blur}} delay={${p.delay}} />`,
};
