"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { CodeBlock } from "./code-block";

const sample = `<Lens zoom={1.8}>\n  <img src="/photo.jpg" />\n</Lens>`;
const longer = `import { Button } from "@hulian/ui";\n\nexport function Demo() {\n  return <Button>点我</Button>;\n}`;

export const codeBlockShowcase: ShowcaseSpec = {
  controls: [
    { prop: "lang", type: "text", defaultValue: "tsx", label: "语言标签" },
    { prop: "copyable", type: "boolean", defaultValue: true, label: "可复制" },
  ],
  states: [
    { name: "默认", render: () => <CodeBlock code={sample} /> },
    { name: "带语言标签", render: () => <CodeBlock code={longer} lang="tsx" /> },
    { name: "不可复制", render: () => <CodeBlock code={sample} copyable={false} /> },
  ],
  renderWithProps: (p) => (
    <CodeBlock
      code={longer}
      lang={typeof p.lang === "string" && p.lang ? p.lang : undefined}
      copyable={p.copyable !== false}
      className="w-full"
    />
  ),
  toCode: (p) =>
    `<CodeBlock code={code}${p.lang ? ` lang="${p.lang}"` : ""}${p.copyable === false ? " copyable={false}" : ""} />`,
};
