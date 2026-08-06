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

> GitHub issue draft builder · collects a form (type Select, related component Combobox, title Input, template fields as Textarea or MarkdownEditor), renders the body through the template's pure `toMarkdown`, shows a live Markdown preview, hands back a structured draft via `onSubmit(draft)`, and builds an `issues/new?title=…&body=…&labels=…` prefill link · falls back to "copy Markdown" when the link grows too long · ships bug / feature / enhancement templates and accepts your own through `templates` · **never calls the GitHub API and never holds a token** · forms/advanced

## When to use

Use it to turn "this component is missing / this is broken / this could be better" into a complete issue draft that can be pasted straight into GitHub: a feedback entry point for a component library, a "report a problem" button in an internal platform, or a "this page is wrong" link in docs.

It is not a generic form: the field list comes from an issue template, not an arbitrary schema. Use [ProForm](../pro-form/pro-form.md) for general data entry, [ModalForm](../form-dialog/form-dialog.md) for create/edit dialogs, and [MarkdownEditor](../markdown-editor/markdown-editor.md) when all you need is one Markdown input.

## Import
```ts
import { BUILTIN_ISSUE_TEMPLATES, GITHUB_URL_MAX_LENGTH, IssueReporter, IssueReporterModal, buildIssueUrl, createIssueDraft, isUrlTooLong, issueSection, normalizeRepo, renderIssueMarkdown } from "@hulianui/ui"
```

## Props

`IssueReporterProps`. `IssueReporterModalProps` extends it and adds the modal-only rows at the end.

| Name | Type | Default | Description |
|------|------|------|------|
| repo | string | "hulianui/hulian" | Target repository as `owner/name`; a full GitHub URL or a `.git` suffix also works and is normalized by `normalizeRepo`. |
| templates | IssueTemplate[] | BUILTIN_ISSUE_TEMPLATES | Template set (`{ type, label, labels?, tone?, fields, toMarkdown }`), replaceable as a whole. |
| type | string | — | Controlled current template type. |
| defaultType | string | templates[0].type | Uncontrolled initial template type. |
| components | IssueComponentOption[] | — | Related-component candidates (`{ slug, name? }`); the field is not rendered without it. **The component never fetches llms.txt or the registry** — you supply the list. |
| relatedComponent | string | — | Controlled related-component value (slug). |
| defaultRelatedComponent | string | "" | Uncontrolled initial related component. |
| defaultTitle | string | "" | Initial title. Named this way so it never collides with the HTML `title` attribute. |
| defaultValues | IssueFieldValues | — | Initial template field values, keyed by field `name`. |
| showSubmit | boolean | true | Render the built-in submit button; `IssueReporterModal` always sets it to false. |
| openInNewTab | boolean | true | Whether "Open on GitHub" calls `window.open`. |
| preview | "source" \| "rendered" \| false | "source" | Preview mode: CodeBlock source, rendered Markdown, or off. |
| urlLimit | number | 8000 | Prefill link length limit; above it the component degrades (see Pitfalls). |
| text | Partial\<IssueReporterText\> | — | UI copy overrides; omit it and the reporter takes its copy from the ConfigProvider locale. Not the same thing as a template's `labels` (GitHub labels). |
| actions | ReactNode | — | Extra buttons appended to the action row. |
| apiRef | MutableRefObject\<IssueReporterApi \| null\> | — | Imperative handle: `submit()` / `getDraft()` / `getUrl()` / `reset()`. |
| className | string | — | Class name on the form body. |
| open / defaultOpen | boolean | — | Modal only: controlled / uncontrolled open state. |
| trigger | ReactElement | — | Modal only: element that opens the dialog. |
| modalTitle | string | From locale | Modal only: dialog title. Omit it and the modal follows the ConfigProvider locale. |
| submitText / cancelText | string | — | Modal only: footer button labels. |
| modalClassName | string | — | Modal only: dialog container class name (width and so on). |

## Events

| Event | Type | Description |
|------|------|------|
| onSubmit | (draft: IssueDraft) => void | Fires after validation passes with the structured draft (`{ type, title, relatedComponent?, labels, values, body }`). **The component stops here; sending it anywhere is your call.** |
| onDraftChange | (draft: IssueDraft) => void | Fires on every input change with the latest draft, including the rendered body. |
| onTypeChange | (type: string) => void | Template type changed. |
| onRelatedComponentChange | (slug: string) => void | Related component changed; picking "none" reports an empty string. |
| onOpenUrl | (url: string) => void | Fires after the prefill link is built, whether or not a tab is opened. |
| onCopy | (markdown: string) => void | Fires after copying; the copied text is the Markdown body, not the URL. |

## Slots

| Slot | Type | Description |
|------|------|------|
| actions | ReactNode | Extra buttons on the right of the action row. |
| trigger | ReactElement | Modal only: element that opens the dialog. |

## Examples

Inline form with the candidate list supplied by you:

```tsx
<IssueReporter
  repo="hulianui/hulian"
  components={[
    { slug: "select", name: "Select" },
    { slug: "combobox", name: "Combobox" },
  ]}
  onSubmit={(draft) => console.log(draft.body)}
/>
```

Modal variant (the submit button comes from the ModalForm footer, and failed validation keeps it open):

```tsx
<IssueReporterModal
  trigger={<Button>Report an issue</Button>}
  components={components}
  onSubmit={(draft) => sendToMyBacklog(draft)}
/>
```

Your own repository's template:

```tsx
const docsTemplate: IssueTemplate = {
  type: "docs",
  label: "Docs fix",
  labels: ["documentation"],
  fields: [
    { name: "page", label: "Page URL", control: "input", required: true },
    { name: "problem", label: "What is wrong" },
  ],
  // Pure function: values in, markdown out. issueSection drops empty sections for you.
  toMarkdown: (values) =>
    [issueSection("Page", values.page), issueSection("Problem", values.problem)]
      .filter(Boolean)
      .join("\n\n"),
};

<IssueReporter templates={[docsTemplate]} />
```

Pure functions without any UI (works in scripts and on the server):

```ts
const draft = createIssueDraft(
  { type: "bug", title: "Select clearable does nothing", values: { summary: "Clicking x is a no-op" } },
  BUILTIN_ISSUE_TEMPLATES[0],
);
const url = buildIssueUrl(draft, "hulianui/hulian");
if (isUrlTooLong(url)) {
  // Too long: ask the user to copy draft.body and paste it manually.
}
```

## Accessibility

- Every field sits in a [Field](../field/field.md), so Base UI wires `htmlFor`/`id`, links the error text through `aria-describedby`, and sets `aria-invalid` automatically.
- Required errors appear only **after a submit attempt**, so the form never greets a first-time user with a wall of red.
- The too-long fallback explains itself through an [Alert](../alert/alert.md) instead of silently disabling a button.
- The copy button swaps its label to "Copied" for 1.5 seconds; the change is textual, not icon-only, so screen readers announce it.
- Keyboard behavior for the two dropdowns comes from [Select](../select/select.md) and [Combobox](../combobox/combobox.md).

## Pitfalls

- **It does not create the issue, and it must not receive a token.** The component only hands back a draft and builds a prefill link. That link opens GitHub's own "new issue" form; the issue exists only after the user confirms it there. If you want one-click submission, take the `draft` to your own server and call the GitHub API from there — **never ship a PAT to the browser**.
- **Prefill links have a length ceiling.** In practice a URL beyond roughly 8000 characters (`GITHUB_URL_MAX_LENGTH`) gets truncated by browsers, proxies, or mail clients, or is rejected outright. Past that the component **does not render** the "Open on GitHub" button and shows a notice plus "Copy Markdown" instead. The check measures the **whole URL, not the body**: percent-encoded CJK costs nine characters per glyph, so a long title alone can exhaust the budget.
- **The related-component list must come from outside.** The component never fetches `llms.txt` or the registry — the data source and its caching belong to the consumer, the same boundary ComponentPicker draws. Omit `components` and the field disappears.
- **`control: "markdown"` pulls in tiptap.** MarkdownEditor depends on `@tiptap/*`, which is not small. All three built-in templates deliberately use `textarea`; opt a field into `markdown` yourself when you need rich text.
- **Do not wrap it in a `<form>` expecting native submit.** The body deliberately renders no `<form>` element, because it has to nest inside ModalForm's form and nested forms are invalid HTML. Outside a dialog, use the built-in submit button or `apiRef.submit()`.
- **A template's `labels` and the component's `text` are different things.** The former are GitHub labels (they land in `draft.labels` and the URL's `labels` parameter); the latter overrides UI copy.
- **UI copy follows the locale by default.** Without `text`, every string comes from the ConfigProvider locale and falls back to the built-in Chinese when no provider is present; `modalTitle` on `IssueReporterModal` works the same way. Priority is the `text` prop, then the locale, then the fallback. Note that **the field `label` and `placeholder` of a template are not covered by the locale** — they live in the `templates` data, so an English surface needs its own templates too.
- **Switching templates keeps values of same-named fields.** The value map is shared across templates, so if both `bug` and `feature` declare `summary`, its content survives the switch — intentional, so a mis-click does not destroy typed text. Call `apiRef.reset()` to clear.
