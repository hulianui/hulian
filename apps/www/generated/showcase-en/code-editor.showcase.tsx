"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CodeEditor } from "../../../../packages/ui/src/code-editor/code-editor";
import type { CodeEditorProps } from "../../../../packages/ui/src/code-editor/code-editor.types";
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
function Live({ initial, ...rest }: {
    initial: string;
} & Partial<CodeEditorProps>) {
    const [value, setValue] = useState(initial);
    return <CodeEditor value={value} onChange={setValue} {...rest}/>;
}
export const codeEditorShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Controlled value/onChange. Tab indents, Enter keeps the indent, brackets auto-close, Cmd/Ctrl + / toggles comments, and Cmd+Z still undoes.",
            code: `const [code, setCode] = useState(source);

<CodeEditor value={code} onChange={setCode} language="tsx" rows={12} />`,
            render: () => <Live initial={TSX_SAMPLE} language="tsx" rows={12}/>,
        },
        {
            title: "JSON editing",
            description: "With language=\"json\" there is no comment toggle, because JSON has no comments, and only double quotes are treated as quotes.",
            code: `<CodeEditor value={dsl} onChange={setDsl} language="json" rows={9} />`,
            render: () => <Live initial={JSON_SAMPLE} language="json" rows={9}/>,
        },
        {
            title: "CSS highlighting",
            description: "Selectors, property names, values, and at-rules get distinct colors, and pseudo-classes outside a block are not mistaken for property names.",
            code: `<CodeEditor value={css} onChange={setCss} language="css" rows={11} />`,
            render: () => <Live initial={CSS_SAMPLE} language="css" rows={11}/>,
        },
        {
            title: "Read-only preview",
            description: "readOnly still allows focus, selection, and copy; it only rejects input and the keyboard shortcuts.",
            code: `<CodeEditor value={code} language="tsx" readOnly rows={8} />`,
            render: () => (<CodeEditor value={TSX_SAMPLE} language="tsx" readOnly rows={8}/>),
        },
        {
            title: "Compact, no line numbers",
            description: "Turn off the gutter and the active-line highlight, and use a tighter line height to fit a narrow sidebar.",
            code: `<CodeEditor
  value={code}
  onChange={setCode}
  lineNumbers={false}
  highlightActiveLine={false}
  lineHeight={1.4}
  rows={6}
/>`,
            render: () => (<Live initial={JSON_SAMPLE} language="json" lineNumbers={false} highlightActiveLine={false} lineHeight={1.4} rows={6}/>),
        },
        {
            title: "Four-space indent",
            description: "tabSize sets both the width of one indent level and the rendered tab-size.",
            code: `<CodeEditor value={code} onChange={setCode} language="tsx" tabSize={4} rows={8} />`,
            render: () => <Live initial={TSX_SAMPLE} language="tsx" tabSize={4} rows={8}/>,
        },
        {
            title: "Fixed height with inner scroll",
            description: "Give the wrapper a fixed height to turn it into a scrolling panel; the gutter and the highlight layer follow the scroll.",
            code: `<CodeEditor value={code} onChange={setCode} className="h-[220px]" />`,
            render: () => <Live initial={TSX_SAMPLE} language="tsx" className="h-[220px]"/>,
        },
    ],
    controls: [
        { prop: "language", type: "select", options: ["tsx", "json", "css", "bash"], defaultValue: "tsx", label: "Language" },
        { prop: "lineNumbers", type: "boolean", defaultValue: true, label: "Line number" },
        { prop: "highlightActiveLine", type: "boolean", defaultValue: true, label: "Highlight active line" },
        { prop: "readOnly", type: "boolean", defaultValue: false, label: "Read only" },
        { prop: "tabSize", type: "number", defaultValue: 2, label: "Indent width" },
        { prop: "rows", type: "number", defaultValue: 10, label: "Number of visible lines" },
    ],
    states: [
        { name: "TSX editing", render: () => <Live initial={TSX_SAMPLE} language="tsx" rows={10}/> },
        { name: "JSON editing", render: () => <Live initial={JSON_SAMPLE} language="json" rows={8}/> },
        { name: "CSS editing", render: () => <Live initial={CSS_SAMPLE} language="css" rows={10}/> },
        {
            name: "Read only",
            render: () => <CodeEditor value={TSX_SAMPLE} language="tsx" readOnly rows={8}/>,
        },
        {
            name: "Compact without line numbers",
            render: () => (<Live initial={JSON_SAMPLE} language="json" lineNumbers={false} highlightActiveLine={false} lineHeight={1.4} rows={6}/>),
        },
    ],
    renderWithProps: (props) => (<Live initial={props.language === "json" ? JSON_SAMPLE : props.language === "css" ? CSS_SAMPLE : TSX_SAMPLE} {...(props as Partial<CodeEditorProps>)}/>),
    toCode: (props) => `<CodeEditor value={code} onChange={setCode} language="${String(props.language ?? "tsx")}" />`,
};
