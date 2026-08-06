"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button/button";
import { IssueReporter } from "./issue-reporter";
import { IssueReporterModal } from "./issue-reporter-modal";
import type { IssueTemplate } from "./issue-reporter.types";

const components = [
  { slug: "select", name: "Select 选择器" },
  { slug: "combobox", name: "Combobox 搜索选择" },
  { slug: "pro-table", name: "ProTable 列表页" },
  { slug: "markdown-editor", name: "MarkdownEditor 编辑器" },
];

const docsTemplate: IssueTemplate = {
  type: "docs",
  label: "文档纠错",
  labels: ["documentation"],
  tone: "brand",
  fields: [
    {
      name: "page",
      label: "页面地址",
      control: "input",
      required: true,
      placeholder: "/components/select",
    },
    { name: "problem", label: "哪里不对", rows: 3 },
  ],
  toMarkdown: (values) =>
    [`页面：${values.page ?? ""}`, values.problem ? `\n${values.problem}` : ""].join(""),
};

// 提到模块级而不是内联写在 render 里：内联箭头每轮渲染都是新引用，IssueReporter 的 memo
// 从原理上就 bail 不掉，运行时性能门禁会把这条记成 avoidable-render。示例代码（code 串）
// 仍写成内联形态 —— 那是给人看的最短写法，这里是给 fixture 跑的。
const logDraft = (draft: unknown) => console.log(draft);

const Demo = () => (
  <div className="w-full max-w-2xl">
    <IssueReporter components={components} />
  </div>
);

export const issueReporterShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "内置 bug / 新组件 / 优化建议三套模板，下方实时预览拼好的 Markdown。",
      code: `<IssueReporter
  repo="hulianui/hulian"
  components={[
    { slug: "select", name: "Select 选择器" },
    { slug: "combobox", name: "Combobox 搜索选择" },
  ]}
  onSubmit={(draft) => console.log(draft)}
/>`,
      render: () => (
        <div className="w-full max-w-2xl">
          <IssueReporter components={components} onSubmit={logDraft} />
        </div>
      ),
    },
    {
      title: "弹层版",
      description: "套 ModalForm：提交按钮由弹层页脚提供，校验不过保持打开。",
      code: `<IssueReporterModal
  trigger={<Button>反馈问题</Button>}
  components={components}
  onSubmit={(draft) => console.log(draft)}
/>`,
      render: () => (
        <IssueReporterModal
          trigger={<Button>反馈问题</Button>}
          components={components}
          onSubmit={(draft) => console.log(draft)}
        />
      ),
    },
    {
      title: "渲染态预览",
      description: 'preview="rendered" 显示渲染后的 Markdown，而非源码。',
      code: `<IssueReporter preview="rendered" defaultType="feature" />`,
      render: () => (
        <div className="w-full max-w-2xl">
          <IssueReporter
            preview="rendered"
            defaultType="feature"
            defaultTitle="希望有 IssueReporter"
            defaultValues={{ problem: "手写 issue 太容易漏字段", api: "<IssueReporter />" }}
          />
        </div>
      ),
    },
    {
      title: "自定义模板",
      description: "templates 换成自己的一套，toMarkdown 决定正文长什么样。",
      code: `const docsTemplate = {
  type: "docs",
  label: "文档纠错",
  labels: ["documentation"],
  fields: [
    { name: "page", label: "页面地址", control: "input", required: true },
    { name: "problem", label: "哪里不对" },
  ],
  toMarkdown: (values) => \`页面：\${values.page}\`,
};

<IssueReporter templates={[docsTemplate]} />`,
      render: () => (
        <div className="w-full max-w-2xl">
          <IssueReporter templates={[docsTemplate]} />
        </div>
      ),
    },
    {
      title: "超长降级",
      description:
        "把上限调到 300 字符模拟超长：不再给「在 GitHub 上打开」，只留复制 Markdown 加提示。",
      code: `<IssueReporter urlLimit={300} />`,
      render: () => (
        <div className="w-full max-w-2xl">
          <IssueReporter
            urlLimit={300}
            defaultTitle="一条会撑爆预填链接的反馈"
            defaultValues={{ summary: "这里是很长的正文。".repeat(20) }}
          />
        </div>
      ),
    },
  ],
  controls: [],
  states: [
    { name: "默认（bug 模板）", render: () => <Demo /> },
    {
      name: "新组件模板",
      render: () => (
        <div className="w-full max-w-2xl">
          <IssueReporter defaultType="feature" components={components} />
        </div>
      ),
    },
    {
      name: "超长降级",
      render: () => (
        <div className="w-full max-w-2xl">
          <IssueReporter urlLimit={300} defaultValues={{ summary: "长正文。".repeat(40) }} />
        </div>
      ),
    },
  ],
  renderWithProps: () => <Demo />,
  toCode: () => `<IssueReporter repo="hulianui/hulian" onSubmit={(draft) => …} />`,
};
