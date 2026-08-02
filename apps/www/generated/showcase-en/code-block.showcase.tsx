"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CodeBlock } from "../../../../packages/ui/src/code-block/code-block";
const sample = `<Lens zoom={1.8}>
  <img src="/photo.jpg" />
</Lens>`;
const longer = `import { Button } from "@hulianui/ui";

// Click counting example
export function Demo() {
  const [n, setN] = useState(0);
  return <Button onClick={() => setN(n + 1)}> clicked {n} times</Button>;
}`;
const shell = `# Install and build
pnpm add @hulianui/ui
pnpm --filter @hulianui/ui build`;
export const codeBlockShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass in multiple lines of code (wrap with \\n), automatic syntax coloring + copy button in the upper right corner.",
            code: `const code = \`<Lens zoom={1.8}>
  <img src="/photo.jpg" />
</Lens>\`;

<CodeBlock code={code} />`,
            render: () => <CodeBlock code={sample}/>,
        },
        {
            title: "With language tag",
            description: "lang Displays the language identifier in the upper left corner and affects coloring rules.",
            code: `<CodeBlock code={code} lang="tsx" />`,
            render: () => <CodeBlock code={longer} lang="tsx"/>,
        },
        {
            title: "Shell command",
            description: "lang=\"bash\" Colorize the command name according to Shell rules with flag.",
            code: `<CodeBlock code={shell} lang="bash" />`,
            render: () => <CodeBlock code={shell} lang="bash"/>,
        },
        {
            title: "Coloring Off / Not Copyable",
            description: "highlight={false} renders plain text; copyable={false} removes the copy button.",
            code: `<>
  <CodeBlock code={code} highlight={false} />
  <CodeBlock code={code} copyable={false} />
</>`,
            render: () => (<div className="flex w-full flex-col gap-3">
          <CodeBlock code={longer} highlight={false}/>
          <CodeBlock code={sample} copyable={false}/>
        </div>),
        },
    ],
    controls: [
        { prop: "lang", type: "text", defaultValue: "tsx", label: "Language tag" },
        { prop: "copyable", type: "boolean", defaultValue: true, label: "Can be copied" },
    ],
    states: [
        { name: "Default", render: () => <CodeBlock code={sample}/> },
        { name: "With language tag", render: () => <CodeBlock code={longer} lang="tsx"/> },
        { name: "Shell", render: () => <CodeBlock code={shell} lang="bash"/> },
        { name: "Turn off coloring", render: () => <CodeBlock code={longer} highlight={false}/> },
        { name: "Not to be copied", render: () => <CodeBlock code={sample} copyable={false}/> },
    ],
    renderWithProps: (p) => (<CodeBlock code={longer} lang={typeof p.lang === "string" && p.lang ? p.lang : undefined} copyable={p.copyable !== false} className="w-full"/>),
    toCode: (p) => `<CodeBlock code={code}${p.lang ? ` lang="${p.lang}"` : ""}${p.copyable === false ? " copyable={false}" : ""} />`,
};
