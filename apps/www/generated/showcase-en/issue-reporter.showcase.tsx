"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button/button";
import { IssueReporter } from "../../../../packages/ui/src/issue-reporter/issue-reporter";
import { IssueReporterModal } from "../../../../packages/ui/src/issue-reporter/issue-reporter-modal";
import type { IssueTemplate } from "../../../../packages/ui/src/issue-reporter/issue-reporter.types";
const components = [
    { slug: "select", name: "Select" },
    { slug: "combobox", name: "Combobox" },
    { slug: "pro-table", name: "ProTable" },
    { slug: "markdown-editor", name: "MarkdownEditor" },
];
const docsTemplate: IssueTemplate = {
    type: "docs",
    label: "Docs fix",
    labels: ["documentation"],
    tone: "brand",
    fields: [
        {
            name: "page",
            label: "Page URL",
            control: "input",
            required: true,
            placeholder: "/components/select",
        },
        { name: "problem", label: "What is wrong", rows: 3 },
    ],
    toMarkdown: (values) => [`Page: ${values.page ?? ""}`, values.problem ? `
${values.problem}` : ""].join(""),
};
const logDraft = (draft: unknown) => console.log(draft);
const Demo = () => (<div className="w-full max-w-2xl">
    <IssueReporter components={components}/>
  </div>);
export const issueReporterShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Three built-in templates: bug, new component, and enhancement. The preview below shows the assembled Markdown live.",
            code: `<IssueReporter
  repo="hulianui/hulian"
  components={[
    { slug: "select", name: "Select" },
    { slug: "combobox", name: "Combobox" },
  ]}
  onSubmit={(draft) => console.log(draft)}
/>`,
            render: () => (<div className="w-full max-w-2xl">
          <IssueReporter components={components} onSubmit={logDraft}/>
        </div>),
        },
        {
            title: "Modal variant",
            description: "Wrapped in ModalForm: the submit button comes from the modal footer, and failed validation keeps the modal open.",
            code: `<IssueReporterModal
  trigger={<Button>Report an issue</Button>}
  components={components}
  onSubmit={(draft) => console.log(draft)}
/>`,
            render: () => (<IssueReporterModal trigger={<Button>Report an issue</Button>} components={components} onSubmit={(draft) => console.log(draft)}/>),
        },
        {
            title: "Rendered preview",
            description: "preview=\"rendered\" shows the rendered Markdown instead of the source.",
            code: `<IssueReporter preview="rendered" defaultType="feature" />`,
            render: () => (<div className="w-full max-w-2xl">
          <IssueReporter preview="rendered" defaultType="feature" defaultTitle="Wish there were an IssueReporter" defaultValues={{ problem: "Writing an issue by hand drops fields too easily", api: "<IssueReporter />" }}/>
        </div>),
        },
        {
            title: "Custom template",
            description: "Swap templates for your own set; toMarkdown decides what the body looks like.",
            code: `const docsTemplate = {
  type: "docs",
  label: "Docs fix",
  labels: ["documentation"],
  fields: [
    { name: "page", label: "Page URL", control: "input", required: true },
    { name: "problem", label: "What is wrong" },
  ],
  toMarkdown: (values) => \`Page: \${values.page}\`,
};

<IssueReporter templates={[docsTemplate]} />`,
            render: () => (<div className="w-full max-w-2xl">
          <IssueReporter templates={[docsTemplate]}/>
        </div>),
        },
        {
            title: "Too-long fallback",
            description: "Lower the limit to 300 characters to simulate an oversized link: the Open on GitHub button disappears, leaving Copy Markdown plus a notice.",
            code: `<IssueReporter urlLimit={300} />`,
            render: () => (<div className="w-full max-w-2xl">
          <IssueReporter urlLimit={300} defaultTitle="A report that blows past the prefill link limit" defaultValues={{ summary: "This is a very long body. ".repeat(20) }}/>
        </div>),
        },
    ],
    controls: [],
    states: [
        { name: "Default (bug template)", render: () => <Demo /> },
        {
            name: "New component template",
            render: () => (<div className="w-full max-w-2xl">
          <IssueReporter defaultType="feature" components={components}/>
        </div>),
        },
        {
            name: "Too-long fallback",
            render: () => (<div className="w-full max-w-2xl">
          <IssueReporter urlLimit={300} defaultValues={{ summary: "Long body. ".repeat(40) }}/>
        </div>),
        },
    ],
    renderWithProps: () => <Demo />,
    toCode: () => `<IssueReporter repo="hulianui/hulian" onSubmit={(draft) => \u2026} />`,
};
