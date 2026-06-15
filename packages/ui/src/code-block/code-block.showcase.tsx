"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { CodeBlock } from "./code-block";

const sample = `<Lens zoom={1.8}>\n  <img src="/photo.jpg" />\n</Lens>`;
const longer = `import { Button } from "@hulianui/ui";\n\n// 点击计数示例\nexport function Demo() {\n  const [n, setN] = useState(0);\n  return <Button onClick={() => setN(n + 1)}>点了 {n} 次</Button>;\n}`;
const shell = `# 安装并构建\npnpm add @hulianui/ui\npnpm --filter @hulianui/ui build`;

export const codeBlockShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入多行代码（用 \\n 换行），自动语法着色 + 右上角复制按钮。",
      code: `const code = \`<Lens zoom={1.8}>
  <img src="/photo.jpg" />
</Lens>\`;

<CodeBlock code={code} />`,
      render: () => <CodeBlock code={sample} />,
    },
    {
      title: "带语言标签",
      description: "lang 在左上角显示语言标识，并影响着色规则。",
      code: `<CodeBlock code={code} lang="tsx" />`,
      render: () => <CodeBlock code={longer} lang="tsx" />,
    },
    {
      title: "Shell 命令",
      description: "lang=\"bash\" 按 Shell 规则着色命令名与 flag。",
      code: `<CodeBlock code={shell} lang="bash" />`,
      render: () => <CodeBlock code={shell} lang="bash" />,
    },
    {
      title: "关闭着色 / 不可复制",
      description: "highlight={false} 渲染纯文本；copyable={false} 去掉复制按钮。",
      code: `<>
  <CodeBlock code={code} highlight={false} />
  <CodeBlock code={code} copyable={false} />
</>`,
      render: () => (
        <div className="flex w-full flex-col gap-3">
          <CodeBlock code={longer} highlight={false} />
          <CodeBlock code={sample} copyable={false} />
        </div>
      ),
    },
  ],
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
