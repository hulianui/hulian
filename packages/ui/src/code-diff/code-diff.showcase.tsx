"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { CodeDiff } from "./code-diff";

const OLD = `export function greet(name) {
  const msg = "hi " + name;
  console.log(msg);
  return msg;
}`;

const NEW = `export function greet(name, lang = "en") {
  const prefix = lang === "zh" ? "你好 " : "hi ";
  const msg = prefix + name;
  return msg;
}`;

export const codeDiffShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "mode",
      type: "select",
      options: ["unified", "split"],
      defaultValue: "unified",
      label: "模式",
    },
    { prop: "showLineNumbers", type: "boolean", defaultValue: true, label: "行号" },
  ],
  states: [
    {
      name: "unified（单栏）",
      render: () => (
        <div className="w-full max-w-xl">
          <CodeDiff filename="greet.ts" oldText={OLD} newText={NEW} />
        </div>
      ),
    },
    {
      name: "split（双栏对照）",
      render: () => (
        <div className="w-full max-w-2xl">
          <CodeDiff mode="split" filename="greet.ts" oldText={OLD} newText={NEW} />
        </div>
      ),
    },
    {
      name: "纯新增（新建文件）",
      render: () => (
        <div className="w-full max-w-xl">
          <CodeDiff filename="hello.txt" oldText="" newText={"line 1\nline 2\nline 3"} />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="w-full max-w-xl">
      <CodeDiff
        filename="greet.ts"
        oldText={OLD}
        newText={NEW}
        mode={p.mode as "unified" | "split"}
        showLineNumbers={p.showLineNumbers as boolean}
      />
    </div>
  ),
  toCode: (p) =>
    `<CodeDiff${p.mode === "split" ? ' mode="split"' : ""} filename="greet.ts" oldText={old} newText={next} />`,
};
