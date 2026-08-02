"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { WordRotate } from "../../../../packages/ui/src/word-rotate/word-rotate";
const words = ["Faster", "More stable", "More beautiful", "Hulian"];
export const wordRotateShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass in the word array, AnimatePresence rotates up and down word by word (the default stay is 2.5s per word).",
            code: `<div className="text-3xl font-bold text-foreground">
  Let the development <WordRotate words={["faster", "more stable", "more beautiful", "Hulian"]} className="text-primary" />
</div>`,
            render: () => (<div className="text-3xl font-bold text-foreground">
          Let Development <WordRotate words={["Faster", "More stable", "More beautiful", "Hulian"]} className="text-primary"/>
        </div>),
        },
        {
            title: "Rotation interval",
            description: "duration controls the milliseconds for each word to stay. The smaller it is, the faster the switching is.",
            code: `<div className="text-3xl font-bold text-foreground">
  <WordRotate words={["Design", "Development", "Delivery"]} duration={1200} className="text-primary" />
</div>`,
            render: () => (<div className="text-3xl font-bold text-foreground">
          <WordRotate words={["Design", "Development", "Delivery"]} duration={1200} className="text-primary"/>
        </div>),
        },
        {
            title: "Pure rotation slogan",
            description: "Use a separate line as the slogan Hero, and mix the prefix and suffix copywriting.",
            code: `<div className="text-4xl font-bold text-foreground">
  Focus on the component library of <WordRotate words={["efficiency", "experience", "aesthetics"]} className="text-chart-2" />
</div>`,
            render: () => (<div className="text-4xl font-bold text-foreground">
          Focus <WordRotate words={["Efficiency", "Experience", "Aesthetics"]} className="text-chart-2"/> Component Library
        </div>),
        },
    ],
    controls: [{ prop: "duration", type: "number", defaultValue: 2000 }],
    states: [
        {
            name: "default (2.5s rotation)",
            render: () => (<div className="text-3xl font-bold text-foreground">
          Let Development <WordRotate words={words} className="text-primary"/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="text-3xl font-bold text-foreground">
      Let Development <WordRotate words={words} duration={p.duration as number} className="text-primary"/>
    </div>),
    toCode: (p) => `<WordRotate words={["faster", "more stable", "more beautiful"]} duration={${p.duration}} />`,
};
