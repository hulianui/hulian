"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { CodeBlock } from "./code-block";

const sample = `<Lens zoom={1.8}>\n  <img src="/photo.jpg" />\n</Lens>`;
const longer = `import { Button } from "@hulian/ui";\n\n// 点击计数示例\nexport function Demo() {\n  const [n, setN] = useState(0);\n  return <Button onClick={() => setN(n + 1)}>点了 {n} 次</Button>;\n}`;
const shell = `# 安装并构建\npnpm add @hulian/ui\npnpm --filter @hulian/ui build`;

export const codeBlockShowcase: ShowcaseSpec = {
  controls: [
    { prop: "lang", type: "text", defaultValue: "tsx", label: "语言标签" },
    { prop: "copyable", type: "boolean", defaultValue: true, label: "可复制" },
  ],
  states: [
    { name: "默认", render: () => <CodeBlock code={sample} /> },
    { name: "带语言标签", render: () => <CodeBlock code={longer} lang="tsx" /> },
    { name: "Shell", render: () => <CodeBlock code={shell} lang="bash" /> },
    { name: "关闭着色", render: () => <CodeBlock code={longer} highlight={false} /> },
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
