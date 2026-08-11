---
slug: rich-text-editor
name: RichTextEditor
category: forms
group: advanced
tags: []
exports: [RichTextEditor, sanitizePastedHtml]
status: enriched
---

# RichTextEditor

> Rich text editor whose value is an HTML string, with a trimmable toolbar, injected image uploads, and paste sanitizing · forms/advanced

## When to use

Long-form content that operators lay out themselves and the front end renders verbatim: campaign rules, brand stories, product descriptions, newsletter articles. There is a single test — **the value going in and out is an HTML string** (the database stores HTML, and the front end feeds it straight into `v-html` or a mini-program `rich-text`).

Use [MarkdownEditor](../markdown-editor/markdown-editor.md) when the value is Markdown, and [Textarea](../textarea/textarea.md) for plain multiline text. Do not mount an editor merely to display existing HTML: opening the content normalizes it against the editor schema.

**Do not route around this with conversion**: `html → md` is lossy. `<span style="color:#e4393c">`, `<p style="text-align:center">`, `<table>`, and `<iframe>` have no Markdown equivalent, so one round trip strips the centering and the red highlights from an article an operator only wanted to fix a typo in.

## Import
```ts
import { RichTextEditor } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string` | — | Controlled **HTML fragment string**. |
| defaultValue | `string` | — | Uncontrolled initial HTML string. |
| name | `string` | — | Name of the hidden input that bridges to a native form or Field; its value is the HTML string. |
| placeholder | `string` | — | Empty-state prompt. |
| invalid | `boolean` | `false` | Invalid state, which switches the shell to the danger color. An enclosing Field can also drive it through `data-invalid`. |
| disabled | `boolean` | `false` | Disables editing and hides the toolbar. |
| minRows | `number` | `8` | Minimum height of the content area, in rows. |
| toolbar | `RichTextToolbarItem[]` | Full set | Toolbar entries and their order; `[]` renders no toolbar at all. **Trimming an entry also disables its extension** — see the usage guidelines. |
| sanitizePaste | `boolean` | `true` | Sanitizes pasted content: removes `class`, `on*` handlers, `<style>`, and `javascript:` URLs, and filters inline `style` through a property allowlist. |
| extensions | `AnyExtension[]` | — | Extra TipTap extensions, for example a node type for `<iframe>` videos that already exist in legacy content. |
| className | `string` | — | Additional class name for the shell. |
| aria-label | `string` | locale | Accessible name of the content area. |

`RichTextToolbarItem` is `"bold" | "italic" | "underline" | "strike" | "heading" | "fontSize" | "color" | "align" | "bulletList" | "orderedList" | "blockquote" | "link" | "image" | "table" | "clear" | "divider"`.

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(html: string) => void` | Called with the current HTML string. |
| onUploadImage | `(file: File) => Promise<{ url: string }>` | Image upload: receives the `File`, returns a URL. Without it the image button falls back to prompting for a URL. |

## Examples
```tsx
// Basic: feed legacy HTML straight in
<RichTextEditor
  defaultValue='<p style="text-align: center"><strong>Campaign rules</strong></p>'
/>
```

```tsx
// Controlled, saved back to the database
const [html, setHtml] = useState(detail.content); // already HTML in storage
<RichTextEditor value={html} onChange={setHtml} />
```

```tsx
// Images go to your own object storage with your own auth headers
<RichTextEditor
  onUploadImage={async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form, headers: authHeaders });
    return { url: (await res.json()).url };
  }}
/>
```

```tsx
// Trim the toolbar to the everyday set
<RichTextEditor toolbar={["bold", "italic", "underline", "divider", "bulletList", "link"]} />
```

```tsx
// Inside a form
<Field label="Campaign details" required error={detail.error}>
  <RichTextEditor name="detail" value={detail.value} onChange={detail.onChange} />
</Field>
```

## Usage guidelines

- **The editor schema decides which tags survive, and it decides at load time.** A tag outside the extension set — `<iframe>`, `<video>`, or a custom tag — is dropped the moment the content opens, so saving it back loses data. Not touching the content does not protect it. Add the matching node through `extensions` before going live with legacy content.
- For the same reason, **trimming `toolbar` does more than remove buttons**: dropping `"table"` also drops the table extension, so a legacy `<table>` disappears. `"color"` and `"fontSize"` back `<span style="color|font-size">`, and `"align"` backs `style="text-align"`. Confirm the legacy content does not use that formatting before trimming.
- **Before shipping, run a batch of real legacy content through "open, edit nothing, read `getHTML`" and diff it.** This matters more than any unit test, because what gets lost is years of layout work.
- Images are **never inlined as base64**. Without `onUploadImage` the button falls back to a URL prompt precisely so a single article cannot balloon to several megabytes and overflow the database column. Transport concerns — auth headers, direct upload, progress, retries — stay with the consumer.
- Paste sanitizing cleans **structure and attributes only**; it is not full XSS disinfection. Escaping and filtering still have to happen server-side when rendering to the front end, because rich text is a user-writable field and a client-side allowlist is not a security boundary.
- While controlled, the component calls `setContent` only when the incoming string differs from the last emitted one. Passing HTML that is semantically identical but textually different on every render (for example after your own formatting pass) resets the caret repeatedly; feed back exactly the string `onChange` gave you.
- Do not switch a field back and forth between this component and [MarkdownEditor](../markdown-editor/markdown-editor.md): their value contracts differ, and each switch is another lossy conversion.

## Related
[MarkdownEditor](../markdown-editor/markdown-editor.md) · [Textarea](../textarea/textarea.md) · [Field](../field/field.md) · [Upload](../upload/upload.md) · [Prose](../prose/prose.md)
