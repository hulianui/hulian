---
slug: issue-reporter
name: IssueReporter
category: forms
group: advanced
tags: []
exports: [BUILTIN_ISSUE_TEMPLATES, GITHUB_URL_MAX_LENGTH, IssueReporter, IssueReporterModal, buildIssueUrl, createIssueDraft, isUrlTooLong, issueSection, normalizeRepo, renderIssueMarkdown]
status: enriched
---

# IssueReporter

> GitHub issue 草稿器 · 表单收集（类型 Select / 相关组件 Combobox / 标题 Input / 模板字段 Textarea 或 MarkdownEditor）→ 按模板 `toMarkdown` 纯函数拼正文 → 实时 Markdown 预览 + `onSubmit(draft)` 回吐结构化草稿 + 生成 `issues/new?title=…&body=…&labels=…` 预填链接 · 链接超长自动降级为「复制 Markdown」 · 内置 bug / 新组件 / 优化建议三套模板，`templates` 可整套替换 · **不调 GitHub API、不持 token** · forms/advanced

## 何时用

把用户口头的「缺组件 / 出 bug / 想优化」收成一份字段齐全、可直接贴进 GitHub 的 issue 草稿——组件库自身的反馈入口、内部平台的「报障」按钮、文档站的「这页写错了」。

不要拿它当通用表单：字段清单由 issue 模板决定，不是任意 schema，通用录入用 [ProForm](../pro-form/pro-form.md)；要弹层里做增删改查用 [ModalForm](../form-dialog/form-dialog.md)；只想要一个 Markdown 输入框用 [MarkdownEditor](../markdown-editor/markdown-editor.md)。

## 导入
```ts
import { BUILTIN_ISSUE_TEMPLATES, GITHUB_URL_MAX_LENGTH, IssueReporter, IssueReporterModal, buildIssueUrl, createIssueDraft, isUrlTooLong, issueSection, normalizeRepo, renderIssueMarkdown } from "@hulianui/ui"
```

## Props

`IssueReporterProps`。`IssueReporterModalProps` 继承它，另加下表末尾的弹层专属项。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| repo | string | "hulianui/hulian" | 目标仓库 `owner/name`；也接受完整 GitHub URL / 带 `.git`，内部经 `normalizeRepo` 规范化 |
| templates | IssueTemplate[] | BUILTIN_ISSUE_TEMPLATES | 模板集合（`{ type, label, labels?, tone?, fields, toMarkdown }`），整套替换 |
| type | string | - | 受控当前模板 type |
| defaultType | string | templates[0].type | 非受控初始模板 type |
| components | IssueComponentOption[] | - | 相关组件候选（`{ slug, name? }`）；不传就不渲染该字段。**组件不会自己去取 llms.txt / registry**，候选由你喂 |
| relatedComponent | string | - | 相关组件受控值（slug） |
| defaultRelatedComponent | string | "" | 相关组件非受控初值 |
| defaultTitle | string | "" | 标题初值（issue 里写的 `title` prop 落到这里，避免与 HTML `title` 撞名） |
| defaultValues | IssueFieldValues | - | 模板字段初值，按字段 `name`（issue 里写的 `body` prop 落到这里） |
| showSubmit | boolean | true | 是否渲染内置提交按钮；`IssueReporterModal` 内部固定置 false |
| openInNewTab | boolean | true | 点「在 GitHub 上打开」时是否 `window.open` 新标签页 |
| preview | "source" ｜ "rendered" ｜ false | "source" | 预览形态：CodeBlock 源码 / Markdown 渲染后 / 关闭 |
| urlLimit | number | 8000 | 预填链接长度上限，超过即降级（见「禁忌 / 坑」） |
| text | Partial\<IssueReporterText\> | - | 界面文案覆盖；不传则取 ConfigProvider 的 locale。注意与模板上的 `labels`（GitHub 标签）不是一回事 |
| actions | ReactNode | - | 动作区追加的自定义按钮 |
| apiRef | MutableRefObject\<IssueReporterApi ｜ null\> | - | 命令式句柄：`submit()` / `getDraft()` / `getUrl()` / `reset()` |
| className | string | - | 表单本体外层类名 |
| open / defaultOpen | boolean | - | 仅 Modal：受控 / 非受控开关 |
| onOpenChange | (open: boolean) => void | - | 仅 Modal：开合回调（受控时必接） |
| trigger | ReactElement | - | 仅 Modal：触发元素 |
| modalTitle | string | 取自 locale | 仅 Modal：弹层标题；不传则跟随 ConfigProvider（内置中文兜底「反馈 issue」） |
| submitText / cancelText | string | - | 仅 Modal：页脚按钮文案 |
| modalClassName | string | - | 仅 Modal：弹层容器类名（宽度等） |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSubmit | (draft: IssueDraft) => void | 校验通过后回吐结构化草稿（`{ type, title, relatedComponent?, labels, values, body }`）。**组件到此为止，提交与否由你决定** |
| onDraftChange | (draft: IssueDraft) => void | 任一输入变化后回吐最新草稿（含已渲染的 body），用于外部实时预览 |
| onTypeChange | (type: string) => void | 模板类型变化 |
| onRelatedComponentChange | (slug: string) => void | 相关组件变化；选「不指定」回吐空串 |
| onOpenUrl | (url: string) => void | 生成预填链接后触发，无论是否自动开新标签页 |
| onCopy | (markdown: string) => void | 复制 Markdown 后触发（复制的是正文，不是 URL） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| actions | ReactNode | 动作区右侧追加的按钮 |
| trigger | ReactElement | 仅 Modal：打开弹层的触发元素 |

## 示例

内联表单，把候选组件喂进来：

```tsx
<IssueReporter
  repo="hulianui/hulian"
  components={[
    { slug: "select", name: "Select 选择器" },
    { slug: "combobox", name: "Combobox 搜索选择" },
  ]}
  onSubmit={(draft) => console.log(draft.body)}
/>
```

弹层版（提交按钮由 ModalForm 的页脚提供，校验不过保持打开）：

```tsx
<IssueReporterModal
  trigger={<Button>反馈问题</Button>}
  components={components}
  onSubmit={(draft) => sendToMyBacklog(draft)}
/>
```

换成自己仓库的模板：

```tsx
const docsTemplate: IssueTemplate = {
  type: "docs",
  label: "文档纠错",
  labels: ["documentation"],
  fields: [
    { name: "page", label: "页面地址", control: "input", required: true },
    { name: "problem", label: "哪里不对" },
  ],
  // 纯函数：字段值 → markdown。空字段用 issueSection 兜住，不产出空章节
  toMarkdown: (values) =>
    [issueSection("页面", values.page), issueSection("问题", values.problem)]
      .filter(Boolean)
      .join("\n\n"),
};

<IssueReporter templates={[docsTemplate]} />
```

不要 UI，只要纯函数（脚本 / 服务端同样能用）：

```ts
const draft = createIssueDraft(
  { type: "bug", title: "Select clearable 失效", values: { summary: "点 × 没反应" } },
  BUILTIN_ISSUE_TEMPLATES[0],
);
const url = buildIssueUrl(draft, "hulianui/hulian");
if (isUrlTooLong(url)) {
  // 太长了：让用户复制 draft.body 手动粘贴
}
```

## 无障碍

- 每个字段都包在 [Field](../field/field.md) 里，label 经 Base UI 自动 `htmlFor`/`id` 关联，错误文案自动串 `aria-describedby`，无效态自动置 `aria-invalid`。
- 必填错误只在**尝试提交后**才展示（`aria-invalid` 同步），初次进入不会满屏红字。
- 超长降级用 [Alert](../alert/alert.md) 说明原因，而不是把按钮置灰不给理由。
- 「复制 Markdown」按钮复制成功后按钮文字切换为「已复制」，1.5 秒后复原——文字变化对读屏可感知，不是只换图标。
- 类型下拉、相关组件下拉的键盘操作分别由 [Select](../select/select.md) / [Combobox](../combobox/combobox.md) 保证。

## 禁忌 / 坑

- **它不会替你创建 issue，也不该拿到 token。** 组件只做两件事：`onSubmit(draft)` 回吐草稿、生成一条 GitHub 预填链接。那条链接打开的是 GitHub 自己的「新建 issue」表单，用户点了确认才算创建。想要「一键提交」，请拿 `draft` 去你自己的服务端调 GitHub API——**不要把 PAT 传进浏览器**。
- **预填链接有长度上限。** 实务上整条 URL 超过约 8000 字符（`GITHUB_URL_MAX_LENGTH`）后会被浏览器/代理/邮件客户端截断，或被 GitHub 直接拒绝。此时组件**不渲染**「在 GitHub 上打开」按钮，改为提示 + 「复制 Markdown」。判据量的是**整条 URL 而不是 body**：中文按 UTF-8 百分号编码后一个字占 9 个字符，长标题一样能把额度吃满。
- **相关组件候选必须外部喂。** 组件不会去 fetch `llms.txt` 或 registry —— 那是消费方的数据来源与缓存策略，同 ComponentPicker 的边界。不传 `components` 就不渲染该字段。
- **`control: "markdown"` 会拉入 tiptap。** MarkdownEditor 依赖 `@tiptap/*`，体积不小。内置三套模板刻意全用 `textarea`，需要富文本时自己在模板里把某个字段改成 `markdown`。
- **不要给它套 `<form>` 期待自动提交。** 组件本体刻意不渲染 `<form>`（它要能塞进 ModalForm 的表单里，嵌套 form 是非法 HTML）。弹层外的独立用法请用内置提交按钮或 `apiRef.submit()`。
- **模板的 `labels` 与组件的 `text` 别搞混。** 前者是 GitHub 标签（进 `draft.labels` 与 URL 的 `labels` 参数），后者是界面文案覆盖。
- **界面文案默认跟随 locale。** 不传 `text` 时全部文案取 ConfigProvider 的 locale（未包 Provider 回落内置中文），`IssueReporterModal` 的 `modalTitle` 同理。优先级是 `text` prop > locale > 内置兜底。注意**模板自带的字段 `label` / `placeholder` 不在 locale 覆盖范围内**——它们属于 `templates` 数据，要英文界面请连模板一起替换。
- **切模板不会清空同名字段。** 值表跨模板共用，`bug` 与 `feature` 若都有 `summary`，切过去内容还在——这是有意的（避免误切模板丢内容），需要清空请调 `apiRef.reset()`。
