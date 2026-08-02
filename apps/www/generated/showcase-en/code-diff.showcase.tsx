"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CodeDiff } from "../../../../packages/ui/src/code-diff/code-diff";
const OLD = `export function greet(name) {
  const msg = "hi " + name;
  console.log(msg);
  return msg;
}`;
const NEW = `export function greet(name, lang = "en") {
  const prefix = lang === "zh" ? "Hello " : "hi ";
  const msg = prefix + name;
  return msg;
}`;
export const codeDiffShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage (unified single column)",
            description: "Input oldText / newText, automatically diff line by line, add green/delete red.",
            code: `<CodeDiff filename="greet.ts" oldText={oldText} newText={newText} />`,
            render: () => (<div className="w-full max-w-xl">
          <CodeDiff filename="greet.ts" oldText={OLD} newText={NEW}/>
        </div>),
        },
        {
            title: "Double column comparison (split)",
            description: "mode=\"split\" The old on the left and the new on the right are displayed side by side, making it easy to compare large changes.",
            code: `<CodeDiff mode="split" filename="greet.ts" oldText={oldText} newText={newText} />`,
            render: () => (<div className="w-full max-w-2xl">
          <CodeDiff mode="split" filename="greet.ts" oldText={OLD} newText={NEW}/>
        </div>),
        },
        {
            title: "Purely new (new file)",
            description: "When oldText is an empty string, each line is judged as new.",
            code: `<CodeDiff filename="hello.txt" oldText="" newText={"line 1\\nline 2\\nline 3"} />`,
            render: () => (<div className="w-full max-w-xl">
          <CodeDiff filename="hello.txt" oldText="" newText={"line 1\nline 2\nline 3"}/>
        </div>),
        },
        {
            title: "Hide line number",
            description: "showLineNumbers={false} Remove the line number slots on both sides to save horizontal space.",
            code: `<CodeDiff filename="greet.ts" oldText={oldText} newText={newText} showLineNumbers={false} />`,
            render: () => (<div className="w-full max-w-xl">
          <CodeDiff filename="greet.ts" oldText={OLD} newText={NEW} showLineNumbers={false}/>
        </div>),
        },
    ],
    controls: [
        {
            prop: "mode",
            type: "select",
            options: ["unified", "split"],
            defaultValue: "unified",
            label: "Mode",
        },
        { prop: "showLineNumbers", type: "boolean", defaultValue: true, label: "Line number" },
    ],
    states: [
        {
            name: "unified (single column)",
            render: () => (<div className="w-full max-w-xl">
          <CodeDiff filename="greet.ts" oldText={OLD} newText={NEW}/>
        </div>),
        },
        {
            name: "split (double column comparison)",
            render: () => (<div className="w-full max-w-2xl">
          <CodeDiff mode="split" filename="greet.ts" oldText={OLD} newText={NEW}/>
        </div>),
        },
        {
            name: "Purely new (new file)",
            render: () => (<div className="w-full max-w-xl">
          <CodeDiff filename="hello.txt" oldText="" newText={"line 1\nline 2\nline 3"}/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="w-full max-w-xl">
      <CodeDiff filename="greet.ts" oldText={OLD} newText={NEW} mode={p.mode as "unified" | "split"} showLineNumbers={p.showLineNumbers as boolean}/>
    </div>),
    toCode: (p) => `<CodeDiff${p.mode === "split" ? " mode=\"split\"" : ""} filename="greet.ts" oldText={old} newText={next} />`,
};
