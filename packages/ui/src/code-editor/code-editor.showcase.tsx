"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { CodeEditor } from "./code-editor";
import type { CodeEditorProps } from "./code-editor.types";

const TSX_SAMPLE = `import { Button } from "@hulianui/ui";

export function Panel({ title }: { title: string }) {
  const items = [1, 2, 3];
  return (
    <section className="p-4">
      <h2>{title}</h2>
      <Button onClick={() => console.log(items)}>Run</Button>
    </section>
  );
}
`;

const JSON_SAMPLE = `{
  "type": "Stack",
  "props": { "gap": 12, "align": "center" },
  "children": [
    { "type": "Heading", "props": { "level": 2 } },
    { "type": "Button", "props": { "tone": "primary" } }
  ]
}
`;

const CSS_SAMPLE = `.panel {
  --gap: 12px;
  display: grid;
  gap: var(--gap);
  color: #2563eb;
  padding: 1.5rem 0 !important;
}

@media (min-width: 40rem) {
  .panel { grid-template-columns: 1fr 1fr; }
}
`;

/** showcase 里的活预览：CodeEditor 是全受控的，必须有人持 state 回写。 */
function Live({ initial, ...rest }: { initial: string } & Partial<CodeEditorProps>) {
  const [value, setValue] = useState(initial);
  return <CodeEditor value={value} onChange={setValue} {...rest} />;
}

export const codeEditorShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "受控 value/onChange。Tab 缩进、Enter 续缩进、括号自动闭合、Cmd/Ctrl + / 切注释，Cmd+Z 照常撤销。",
      code: `const [code, setCode] = useState(source);

<CodeEditor value={code} onChange={setCode} language="tsx" rows={12} />`,
      render: () => <Live initial={TSX_SAMPLE} language="tsx" rows={12} />,
    },
    {
      title: "JSON 编辑",
      description:
        "language=\"json\" 时不提供注释切换（JSON 规范无注释），引号只认双引号。",
      code: `<CodeEditor value={dsl} onChange={setDsl} language="json" rows={9} />`,
      render: () => <Live initial={JSON_SAMPLE} language="json" rows={9} />,
    },
    {
      title: "CSS 着色",
      description: "选择器、属性名、数值与 @规则分色；块外伪类不会被当成属性名。",
      code: `<CodeEditor value={css} onChange={setCss} language="css" rows={11} />`,
      render: () => <Live initial={CSS_SAMPLE} language="css" rows={11} />,
    },
    {
      title: "只读预览",
      description: "readOnly 仍可聚焦、选中、复制，只是不接受输入与键盘增强。",
      code: `<CodeEditor value={code} language="tsx" readOnly rows={8} />`,
      render: () => (
        <CodeEditor value={TSX_SAMPLE} language="tsx" readOnly rows={8} />
      ),
    },
    {
      title: "紧凑无行号",
      description: "关掉行号槽与当前行高亮，配合更小行高塞进窄侧栏。",
      code: `<CodeEditor
  value={code}
  onChange={setCode}
  lineNumbers={false}
  highlightActiveLine={false}
  lineHeight={1.4}
  rows={6}
/>`,
      render: () => (
        <Live
          initial={JSON_SAMPLE}
          language="json"
          lineNumbers={false}
          highlightActiveLine={false}
          lineHeight={1.4}
          rows={6}
        />
      ),
    },
    {
      title: "四空格缩进",
      description: "tabSize 同时决定一级缩进宽度与 tab-size 显示宽度。",
      code: `<CodeEditor value={code} onChange={setCode} language="tsx" tabSize={4} rows={8} />`,
      render: () => <Live initial={TSX_SAMPLE} language="tsx" tabSize={4} rows={8} />,
    },
    {
      title: "固定高度内滚",
      description: "外层给确定高度即变成内滚面板，行号槽与着色层跟随滚动。",
      code: `<CodeEditor value={code} onChange={setCode} className="h-[220px]" />`,
      render: () => <Live initial={TSX_SAMPLE} language="tsx" className="h-[220px]" />,
    },
  ],
  controls: [
    { prop: "language", type: "select", options: ["tsx", "json", "css", "bash"], defaultValue: "tsx", label: "语言" },
    { prop: "lineNumbers", type: "boolean", defaultValue: true, label: "行号" },
    { prop: "highlightActiveLine", type: "boolean", defaultValue: true, label: "当前行高亮" },
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
    { prop: "tabSize", type: "number", defaultValue: 2, label: "缩进宽度" },
    { prop: "rows", type: "number", defaultValue: 10, label: "可见行数" },
  ],
  states: [
    { name: "TSX 编辑", render: () => <Live initial={TSX_SAMPLE} language="tsx" rows={10} /> },
    { name: "JSON 编辑", render: () => <Live initial={JSON_SAMPLE} language="json" rows={8} /> },
    { name: "CSS 编辑", render: () => <Live initial={CSS_SAMPLE} language="css" rows={10} /> },
    {
      name: "只读",
      render: () => <CodeEditor value={TSX_SAMPLE} language="tsx" readOnly rows={8} />,
    },
    {
      name: "无行号紧凑",
      render: () => (
        <Live
          initial={JSON_SAMPLE}
          language="json"
          lineNumbers={false}
          highlightActiveLine={false}
          lineHeight={1.4}
          rows={6}
        />
      ),
    },
  ],
  renderWithProps: (props) => (
    <Live
      initial={
        props.language === "json" ? JSON_SAMPLE : props.language === "css" ? CSS_SAMPLE : TSX_SAMPLE
      }
      {...(props as Partial<CodeEditorProps>)}
    />
  ),
  toCode: (props) =>
    `<CodeEditor value={code} onChange={setCode} language="${String(props.language ?? "tsx")}" />`,
};
