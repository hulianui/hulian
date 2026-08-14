---
slug: rich-text-editor
name: RichTextEditor
category: forms
group: advanced
tags: []
exports: [RichTextEditor, sanitizePastedHtml, normalizeLegacyHtml]
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
| maxRows | `number` | — | **Maximum** height of the content area, in the same rows unit as `minRows`. Past that the body scrolls internally and the toolbar stays outside the scroll area. See "Height cap". |
| maxHeight | `number \| string` | — | The same cap expressed as a length (numbers are pixels, strings are any CSS length such as `"60vh"`). **It wins over `maxRows`** when both are given, and the component warns in development. |
| toolbar | `RichTextToolbarItem[]` | Full set | Toolbar entries and their order; `[]` renders no toolbar at all. **Trimming an entry also disables its extension** — see the usage guidelines. |
| sanitizePaste | `boolean` | `true` | Sanitizes pasted content: removes `class`, `on*` handlers, and `<style>`, filters `href` / `src` through a URL-scheme allowlist, and filters inline `style` through a property allowlist. |
| legacyHtml | `boolean \| LegacyHtmlOptions` | `false` | Compatibility with legacy HTML from the WeChat editor, Word, or an old UEditor. Off by default; `true` enables all three tiers, and an object enables only the tiers you name. See "Legacy HTML compatibility". |
| extensions | `AnyExtension[]` | — | Extra TipTap extensions, for example a node type for `<iframe>` videos that already exist in legacy content. |
| className | `string` | — | Additional class name for the shell. |
| aria-label | `string` | locale | Accessible name of the content area. |

`RichTextToolbarItem` is `"bold" | "italic" | "underline" | "strike" | "heading" | "fontSize" | "color" | "backgroundColor" | "align" | "bulletList" | "orderedList" | "blockquote" | "link" | "image" | "table" | "clear" | "divider"`.

### LegacyHtmlOptions

| Name | Type | Default | Description |
|------|------|------|------|
| font | `boolean` | `false` | Translates `<font color\|face\|size>` into `<span style="color\|font-family\|font-size">` and puts the color, font-size, font-family, and background-color marks into the schema. |
| imgStyle | `boolean` | `false` | Keeps the inline `style` on `<img>`, allowing `max-width`, `width`, and `height`. |
| align | `boolean` | `false` | Pushes block alignment down: `text-align` on `<section>` or `<div>`, the `align="center"` attribute, and the `<center>` tag. |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(html: string) => void` | Called with the current HTML string. |
| onUploadImage | `(file: File) => Promise<{ url: string }>` | Image upload: receives the `File`, returns a URL. **The toolbar button, pasting, and dropping all go through it.** Without it the button falls back to prompting for a URL and pasted or dropped images are discarded (see "How images get in"). |

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

```tsx
// Legacy content migrated from the WeChat editor, Word, or an old UEditor
<RichTextEditor legacyHtml value={html} onChange={setHtml} />

// Or only the tiers you need
<RichTextEditor legacyHtml={{ font: true, imgStyle: true }} value={html} onChange={setHtml} />
```

## Height cap

Without a cap the editor's height simply follows the length of the body. In an admin app "one field is a whole long article" is the norm - privacy policies, terms of service, campaign rules, product descriptions - and legacy content routinely runs to several thousand words. Measured on a real page, an 8,000-word body stretched the content area to nearly 9,000px and the page to over 12,000px, which left the Save button entirely outside the viewport; with two editors on one page, a long first one pushes the second far below the fold.

One cap is enough, and the scrolling lands on the **body** while the toolbar stays put:

```tsx
<RichTextEditor minRows={8} maxRows={20} />       // same unit as minRows (1 row = 1.75rem)
<RichTextEditor minRows={8} maxHeight={480} />    // or straight pixels
<RichTextEditor minRows={8} maxHeight="60vh" />   // or any CSS length
```

The two props are one thing in two units, so pick one; when both are given `maxHeight` wins and the component warns in development.

**Only the library can provide this tier.** Wrapping `max-h-[480px] overflow-y-auto` around the component in product code can only wrap the **whole shell**, and the toolbar lives inside that shell - so the toolbar scrolls away with the body, which is worse than no cap at all. Scrolling the body alone would mean reaching into the component's internal DOM structure from product code.

## How images get in

Three entry points, **all going through the same `onUploadImage`** (receives a `File`, returns a URL):

| Entry point | With `onUploadImage` | Without |
|------|------|------|
| Toolbar image button | Opens a file picker (`accept="image/*"`), uploads, inserts the returned URL | Falls back to a URL prompt |
| **Pasting a screenshot** (`Cmd+V`) | Uploads and inserts | Ignored, with one development warning |
| **Dropping an image file** | Uploads and inserts at the drop point | Ignored, with one development warning |
| Pasting body text from Word or the web (images inlined as base64) | Each image is uploaded, then the whole fragment is inserted | The base64 is discarded (never written into the content), with one development warning |

The last row deserves a note: body text copied from Word, Excel, or some web pages carries its images **inlined as base64 in the HTML**, with no corresponding file entry on the clipboard - so it is a different path from "pasting a screenshot" and the component handles the two separately. With `onUploadImage` the `data:` URL is turned back into a `File` and uploaded; without it the whole `<img>` is removed by the sanitizer: **losing one image beats writing several megabytes of base64 into your database column.**

```tsx
// Transport is entirely yours: auth headers, direct upload, progress, retries
<RichTextEditor
  onUploadImage={async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form, headers: authHeaders });
    return { url: (await res.json()).url };
  }}
/>
```

When an upload throws, that image is not inserted and the component shows no UI of its own - **the message is yours to write**, since only you know what to say (quota exceeded? unsupported format? retry?). When several images are uploaded at once, one failure does not interrupt the rest.

## Legacy HTML compatibility

The editor schema decides which tags survive, and it decides **at load time**. The table below is the "open, edit nothing, read the HTML back" contract; check your legacy samples against it before going live.

| Legacy markup | Default (`legacyHtml` off) | `legacyHtml` on |
|------|------|------|
| `<b>` / `<i>` | Normalized to `<strong>` / `<em>` | Same |
| `<section>` / `<div>` wrappers | Flattened to `<p>`; the tag itself is not kept | Same |
| `<img src>` / `<a href>` | Kept | Kept |
| `<p style="text-align">` | Kept, if `toolbar` includes `align` | Kept, regardless of `toolbar` |
| `<span style="color\|font-size">` | Kept, if `toolbar` includes `color` / `fontSize` | Kept, regardless of `toolbar` |
| `<span style="background-color">` (text highlight) | Kept, if `toolbar` includes `backgroundColor` (it does by default) | Kept, regardless of `toolbar`; always a `<span style>`, never a `<mark>` |
| `<font color\|face\|size>` | **Lost** | Translated to `<span style>`; output stays a span |
| `<img style="max-width:100%">` | **Lost** | Keeps `max-width`, `width`, and `height` |
| `<section style="text-align">` | **Lost**, along with the tag it was attached to | Pushed down to `<p style="text-align">` |
| `align="center"` attribute / `<center>` | **Lost** | Translated to `text-align` on the child block |
| `<table>` | Needs `toolbar` to include `table`, otherwise lost | Same; not part of this feature |
| `<iframe>` / `<video>` / custom tags | Lost | Lost — add a node through `extensions` |

Two entry points, chosen by which side does the translating:

- **The `legacyHtml` prop** covers all three tiers. `imgStyle` and the `font-family` half of `font` are **only** available here: an attribute that is not in the schema is gone the moment the content is parsed, so no pure function can bring it back. While it is on, the matching extensions ignore `toolbar` trimming — nobody should have to enable a color picker they do not want just to stop losing red text.
- **The `normalizeLegacyHtml(html)` pure function** covers the `font` and `align` tiers only, both of which are pre-parse markup translation. Use it to convert before feeding the editor, to clean a table in bulk, to write a migration script, or to share one mapping with another editor.

```ts
import { normalizeLegacyHtml } from "@hulianui/ui"

// Both tiers by default; you can also pick one: normalizeLegacyHtml(row.content, { align: true })
const html = normalizeLegacyHtml(row.content)
```

`normalizeLegacyHtml` needs `DOMParser`, so under plain Node you have to supply one (jsdom or linkedom); without it the input is returned unchanged rather than throwing. It **translates, it does not disinfect** — sanitizing still belongs to `sanitizePastedHtml` and to your server.

## Usage guidelines

- **The editor schema decides which tags survive, and it decides at load time.** A tag outside the extension set — `<iframe>`, `<video>`, or a custom tag — is dropped the moment the content opens, so saving it back loses data. Not touching the content does not protect it. Add the matching node through `extensions` before going live with legacy content.
- For the same reason, **trimming `toolbar` does more than remove buttons**: dropping `"table"` also drops the table extension, so a legacy `<table>` disappears. `"color"`, `"fontSize"`, and `"backgroundColor"` back `<span style="color|font-size|background-color">`, and `"align"` backs `style="text-align"`. Confirm the legacy content does not use that formatting before trimming.
- **Before shipping, run a batch of real legacy content through "open, edit nothing, read `getHTML`" and diff it.** This matters more than any unit test, because what gets lost is years of layout work. One trap while diffing: reading `innerHTML` off `.ProseMirror` adds a `<br class="ProseMirror-trailingBreak">` that never reaches `getHTML`; leave it in and every `<br>` count looks doubled.
- `legacyHtml` **preserves formatting, not structure**: `<section>` is still flattened into `<p>`, only the alignment that hung on it is pushed down to the child block. Multi-column or card layouts built out of nested `<section>` elements are not recoverable this way; those need your own nodes through `extensions`.
- **A centering wrapper around a lone image cannot be preserved.** In `<section style="text-align:center"><img></section>` the image is a block node, so wrapping it in a `<p>` only makes ProseMirror lift it out and leave an empty paragraph behind. That shape is deliberately left alone — center images with front-end styling (`img { display:block; margin:0 auto }`) rather than through the stored string.
- While `legacyHtml` is on, **none of the removal rules relax** (`class`, `on*`, `<style>`, and `javascript:` are still stripped); the inline `style` allowlist merely gains `font-family` and `max-width`. Values from `<font color>` go through a shape allowlist (named color, `#hex`, `rgb()`) so they cannot smuggle in a second declaration — body content is a user-writable field.
- **Neither swatch picker offers a `var(--…)` color.** The body text is stored in your database and rendered elsewhere (`v-html`, a mini-program `rich-text`, an email), where the library CSS variables do not exist: `color: var(--color-foreground)` resolves to nothing there and silently falls back to the inherited color, which means an editor-only style was written into permanent content. "Default color" and "No highlight" therefore run `unsetColor()` / `unsetBackgroundColor()` - they remove the declaration rather than writing some "default" color.
- Images are **never inlined as base64**, and that now holds on the paste path too (it did not before 0.36.0 - see #213: pasting from Word wrote the base64 straight into the column). Transport concerns - auth headers, direct upload, progress, retries - stay with the consumer.
- **`blob:` and `file:` image URLs are stripped by the paste sanitizer.** The first is valid only for the lifetime of the current page and the second only on that one machine, so storing either leaves a broken image the next time the content is opened - and unlike base64 the column size looks perfectly normal, which makes it harder to notice.
- Paste sanitizing cleans **structure and attributes only**; it is not full XSS disinfection. Escaping and filtering still have to happen server-side when rendering to the front end, because rich text is a user-writable field and a client-side allowlist is not a security boundary.
- While controlled, the component calls `setContent` only when the incoming string differs from the last emitted one. Passing HTML that is semantically identical but textually different on every render (for example after your own formatting pass) resets the caret repeatedly; feed back exactly the string `onChange` gave you.
- **A `maxRows` smaller than `minRows` does nothing at all**: `min-height` beats `max-height` in CSS, so the content area still expands to `minRows` and never scrolls. There is no way to tell that from looking at it, so the component names it in development.
- With a cap in place the content area becomes a scroll container, which also promotes the other axis from `visible` to `auto`: legacy `<img>` or `<table>` elements carrying hard widths get a horizontal scrollbar inside the body instead of bursting out of the shell.
- Do not switch a field back and forth between this component and [MarkdownEditor](../markdown-editor/markdown-editor.md): their value contracts differ, and each switch is another lossy conversion.

## Related
[MarkdownEditor](../markdown-editor/markdown-editor.md) · [Textarea](../textarea/textarea.md) · [Field](../field/field.md) · [Upload](../upload/upload.md) · [Prose](../prose/prose.md)
