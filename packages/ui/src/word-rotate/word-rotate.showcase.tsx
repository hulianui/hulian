"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { WordRotate } from "./word-rotate";

const words = ["更快", "更稳", "更美", "瑚琏"];

export const wordRotateShowcase: ShowcaseSpec = {
  controls: [{ prop: "duration", type: "number", defaultValue: 2000 }],
  states: [
    {
      name: "default（2.5s 轮换）",
      render: () => (
        <div className="text-3xl font-bold text-foreground">
          让开发 <WordRotate words={words} className="text-primary" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="text-3xl font-bold text-foreground">
      让开发 <WordRotate words={words} duration={p.duration as number} className="text-primary" />
    </div>
  ),
  toCode: (p) => `<WordRotate words={["更快","更稳","更美"]} duration={${p.duration}} />`,
};
