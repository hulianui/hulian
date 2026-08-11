"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { CodeBlock } from "./code-block";

const sample = `<Lens zoom={1.8}>\n  <img src="/photo.jpg" />\n</Lens>`;
const longer = `import { Button } from "@hulianui/ui";\n\n// 点击计数示例\nexport function Demo() {\n  const [n, setN] = useState(0);\n  return <Button onClick={() => setN(n + 1)}>点了 {n} 次</Button>;\n}`;
const shell = `# 安装并构建\npnpm add @hulianui/ui\npnpm --filter @hulianui/ui build`;
const python = `# 猜数字：把范围一半一半地砍\nimport functools\nimport random\n\nSECRET = random.randint(1, 100)\n\n\n@functools.cache\ndef guess(n: int) -> str:\n    """比大小并给提示。\n\n    n 是玩家这一轮猜的数字。\n    """\n    if not isinstance(n, int):\n        raise TypeError("只收整数")\n    if n == SECRET:\n        return f"猜中了，就是 {n}"\n    return "大了" if n > SECRET else "小了"\n\n\nfor i in range(0, 3):\n    print(guess(random.randint(1, 100)))`;

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
      title: "Python",
      description: "lang=\"python\"（py / python3 同义）按 Python 词法着色：# 注释、三引号文档串、f-string、装饰器与内置名。",
      code: `<CodeBlock code={python} lang="python" />`,
      render: () => <CodeBlock code={python} lang="python" />,
    },
    {
      title: "带行号",
      description:
        "lineNumbers 显示行号，正文里就能指「第 12 行」。行号不可选中也不进复制内容；列宽按最大行号位数自适应；横向滚动时行号钉在左侧。片段从中间截取时用 lineNumbers={{ start: 120 }}。",
      code: `<CodeBlock code={python} lang="python" lineNumbers />

// 片段从第 120 行起算
<CodeBlock code={snippet} lang="python" lineNumbers={{ start: 120 }} />`,
      render: () => (
        <div className="flex w-full flex-col gap-3">
          <CodeBlock code={python} lang="python" lineNumbers />
          <CodeBlock code={sample} lineNumbers={{ start: 120 }} />
        </div>
      ),
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
    { prop: "lineNumbers", type: "boolean", defaultValue: false, label: "行号" },
  ],
  states: [
    { name: "默认", render: () => <CodeBlock code={sample} /> },
    { name: "带语言标签", render: () => <CodeBlock code={longer} lang="tsx" /> },
    { name: "Shell", render: () => <CodeBlock code={shell} lang="bash" /> },
    { name: "Python", render: () => <CodeBlock code={python} lang="python" /> },
    { name: "带行号", render: () => <CodeBlock code={python} lang="python" lineNumbers /> },
    {
      name: "行号自定义起点",
      render: () => <CodeBlock code={longer} lang="tsx" lineNumbers={{ start: 120 }} />,
    },
    { name: "关闭着色", render: () => <CodeBlock code={longer} highlight={false} /> },
    { name: "不可复制", render: () => <CodeBlock code={sample} copyable={false} /> },
  ],
  renderWithProps: (p) => (
    <CodeBlock
      code={longer}
      lang={typeof p.lang === "string" && p.lang ? p.lang : undefined}
      copyable={p.copyable !== false}
      lineNumbers={p.lineNumbers === true}
      className="w-full"
    />
  ),
  toCode: (p) =>
    `<CodeBlock code={code}${p.lang ? ` lang="${p.lang}"` : ""}${p.copyable === false ? " copyable={false}" : ""}${p.lineNumbers === true ? " lineNumbers" : ""} />`,
};
