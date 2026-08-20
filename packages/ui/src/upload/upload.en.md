---
slug: upload
name: Upload
category: forms
group: advanced
tags: []
exports: [Upload, useUpload, matchesAccept, moveUploadFile]
status: enriched
---

# Upload

> File upload UI · dropzone or button + accept/size/count validation + controlled thumbnail, progress, and sortable list + transport isolated in `useUpload` · forms/advanced

## When to use

Use Upload to select or drop files and display a controlled list with thumbnails, status, progress, and optional sorting.

**Layering is the component's central contract:**

- `<Upload>` is **presentation and status only**. It performs no network request. After `accept`, `maxSize`, and `limit` validation, it emits `onSelect(File[])`; consumers write status back through controlled `files`.
- `useUpload({ request, concurrency })` is the **transport layer**. It owns queuing, concurrency, progress, cancellation, and retry, while the supplied `request` defines how bytes are sent.

`request` has the signature `(file, { onProgress, signal }) => Promise<{ url }>`. The library deliberately omits `action`, `headers`, `withCredentials`, and `transformResponse`: authentication and response-envelope handling belong in the application's request closure.

Use `variant="dropzone"` for a drop area and `variant="button"` for a compact trigger. Use [ImageCropper](../image-cropper/image-cropper.md) to crop selected images, or [Sortable](../sortable/sortable.md) when the workflow only reorders existing items.

## Import
```ts
import { Upload, useUpload, matchesAccept, moveUploadFile } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| accept | `string` | — | Native accept filter, such as `"image/*,.pdf"`; also validates dropped files. |
| multiple | `boolean` | `false` | Whether to allow selecting more than one file. |
| disabled | `boolean` | `false` | Whether to disable file selection and dropping. |
| maxSize | `number` | — | Maximum size of each file in bytes; oversized files are reported through `onReject` with reason `"size"`. |
| limit | `number` | — | Maximum file count, based on `files.length`. At the limit, the trigger is disabled and shows “selected n/limit”; excess files are reported with reason `"limit"`. |
| variant | `"dropzone" \| "button"` | `"dropzone"` | Presentation as either a drag-and-drop area or a compact button. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Size step for the dropzone height, or the trigger height in button mode. Button mode matches the same step of `<Button>`. |
| name | `string` | — | The `name` of the inner `<input type="file">`. **Only with a name is it a real form control**: a native `<form>` plus `new FormData(form)` can read the file, and `required` is validated by the browser. |
| required | `boolean` | — | Native required validation, forwarded to the inner input. **Provide `name` as well**, otherwise the form never sees the control. It also attaches a screen-reader-only "required" note to the trigger. |
| aria-required | `boolean \| "true" \| "false"` | — | The **semantic** required marker, normally injected by `<Field required>` — you rarely pass it yourself. It only turns on the accessibility half (the screen-reader-only note on the trigger); it does **not** enable native `required` validation. |
| inputRef | `Ref<HTMLInputElement>` | — | Access to the inner input for custom validation, manual clearing, or registration with a third-party form library. |
| resetInputAfterSelect | `boolean` | `true` without `name`, `false` with `name` | Whether to clear `input.value` after a selection. Clearing allows picking the same file twice; keeping the value is what lets FormData read it. |
| files | `UploadFile[]` | — | Controlled display list, including status, progress, and URL metadata. Omit it to hide the list. |
| renderPreview | `(file: UploadFile) => ReactNode` | — | Thumbnail renderer. A returned node occupies a 40 px preview area with the status dot shown as a corner badge; returning `null` uses the default status dot. |
| sortable | `boolean` | `false` | Enables drag reordering when `onSort` is also provided. |
| className | `string` | — | Additional class name for the container. |

## Events

| Event | Type | Description |
|------|------|------|
| onSelect | `(files: File[]) => void` | Called with files that pass validation. |
| onReject | `(rejections: UploadRejection[]) => void` | Called for rejected files with reason `"type"`, `"size"`, or `"limit"`. |
| onRemove | `(id: string) => void` | Called with the file ID when its remove button is clicked. |
| onRetry | `(id: string) => void` | Called with the file ID when the retry button on a failed row is clicked. **The button renders only when this handler is provided**, matching `onRemove`; connect it to `retry` from `useUpload`. |
| onSort | `(files: UploadFile[]) => void` | Called with the reordered list after a drag; write it back to controlled `files`. |

## Slots

| Slot | Type | Description |
|------|------|------|
| label | `ReactNode` | Dropzone label; the default is `"\u70b9\u51fb\u6216\u62d6\u62fd\u6587\u4ef6\u5230\u6b64\u5904"`, built-in Chinese copy meaning “Click or drag files here.” |
| hint | `ReactNode` | Supporting dropzone text, such as accepted formats or size limits. |
| buttonLabel | `ReactNode` | Button-mode label; the default is `"\u9009\u62e9\u6587\u4ef6"`, built-in Chinese copy meaning “Choose files.” |
| children | `ReactNode` | Custom dropzone content that replaces `label` and `hint`. |

> `UploadFile`: `{ id; name; size?; status?: "ready"\|"uploading"\|"success"\|"error"; progress?; error?; url?; raw? }`
> · `progress` displays a progress bar and percentage only for `status="uploading"`; values are clamped internally to 0–100.
> · `url` and `raw` are **metadata only**. Upload does not interpret them; they are available to `renderPreview` and consumer code. `onSelect` still emits `File[]`.

## useUpload (transport layer)

```ts
const up = useUpload({ request, concurrency?, onChange?, onSuccess?, onError? })
// up: { files, add, remove, retry, reorder, clear, uploading }
```

| Options | Type | Default | Description |
|------|------|------|------|
| request | `(file, { onProgress, signal }) => Promise<{ url }>` | — | Required transport implementation. Forward `signal` to fetch or XHR. |
| concurrency | `number` | `3` | Maximum concurrent uploads; excess files queue, and values below 1 fall back to 1. |
| onChange | `(files: UploadFile[]) => void` | — | Called after any change to the file list. |
| onSuccess / onError | `(file, result \| error) => void` | — | Called when an individual upload settles; cancellation through abort does not trigger `onError`. |

| Returns | Description |
|------|------|
| `files` | Controlled file list to pass directly to `<Upload files>`. |
| `add` | Handler for `<Upload onSelect>` that queues files and starts uploads within the concurrency limit. |
| `remove` | Handler for `<Upload onRemove>` that also aborts an in-progress task. |
| `retry` | Handler for `<Upload onRetry>` that retries one failed item. |
| `reorder` | Connect to `<Upload onSort>`; it changes list order without affecting upload tasks. |
| `clear` | Cancels every task and clears the list. |
| `uploading` | Whether any task is queued or in progress. |

## Example

Automatic upload with progress, concurrency, and a file-count limit:
```tsx
const up = useUpload({
  request: async (file, { onProgress, signal }) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd, signal });
    onProgress(100);
    return { url: (await res.json()).data.url }; // Unwrap the API envelope in the application layer
  },
  concurrency: 3,
});

<Upload multiple limit={5} files={up.files} onSelect={up.add} onRemove={up.remove} onRetry={up.retry} />
```

Native `<form>` plus `FormData`, with no React state and `required` left to the browser:
```tsx
<form
  onSubmit={(e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget); // fd.get("file") is the File
    void fetch("/api/upload", { method: "POST", body: fd });
  }}
>
  <Upload name="file" required accept=".pdf" size="sm" hint="PDF only, 10 MB max" />
  <button type="submit">Submit</button>
</form>
```

If you want a real progress bar, use XHR (fetch has no upload progress event):
```ts
const request: UploadRequest = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress((e.loaded / e.total) * 100);
    xhr.onload = () => resolve({ url: JSON.parse(xhr.responseText).url });
    xhr.onerror = () => reject(new Error("Network error"));
    signal.addEventListener("abort", () => xhr.abort());
    xhr.open("POST", "/api/upload");
    xhr.send(new FormData(/* ... */));
  });
```

Image gallery with thumbnails and drag sorting:
```tsx
<Upload
  multiple
  accept="image/*"
  limit={6}
  sortable
  files={up.files}
  onSelect={up.add}
  onRemove={up.remove}
  onSort={up.reorder}
  renderPreview={(f) => <img src={f.url ?? objectUrl(f.raw)} alt={f.name} />}
/>
```

Fully controlled transport without useUpload:
```tsx
<Upload variant="button" accept="image/*" files={files} onSelect={add} onRemove={remove} />
```

## Usage guidelines

- `<Upload>` **never uploads by itself**. Pair it with `useUpload` for automatic transport, or write `status`, `progress`, `error`, and `url` back through controlled `files` when managing requests yourself.
- **Without `name` there is no native form path.** An input without a name never appears in the entries of `FormData`, and `required` is never validated by the browser. Neither omission raises an error; both simply do nothing.
- Providing `name` also changes three defaults, all of which apply only when a name is present. First, the value is no longer cleared after a selection, because clearing it means FormData always reads an empty control; the cost is that **picking the same file twice in a row no longer fires `onSelect`**. Set `resetInputAfterSelect` explicitly if you need that behavior instead, but then FormData cannot read the file — the two cannot both apply. Second, dropped files are written back into `input.files`, which native drag and drop does not do, and files rejected by `accept`, `maxSize`, or `limit` are removed from it so the form cannot submit what the interface just refused. Third, reaching `limit` no longer disables the input, because a disabled control is skipped entirely by FormData and the already selected file would vanish on submit; the trigger itself stays disabled, so the picker cannot be opened.
- Writing back to `input.files` depends on the `DataTransfer` constructor. Test environments such as jsdom do not provide it, so the write-back is skipped silently while `onSelect` still works. **Do not assert on FormData contents after a drop in jsdom.**
- The retry button on a failed row appears **only when `onRetry` is provided**. `useUpload` has had `retry` all along, but the component does not decide on your behalf whether a given failure deserves a retry entry; wire it up with `onRetry={up.retry}`.
- **The library does not unwrap backend envelopes.** Your `request` closure must extract `{ url }` from shapes such as `code/data/msg` before returning.
- `sortable` requires `onSort` because ordering is controlled. Supplying `sortable` alone intentionally falls back to a static list.
- `renderPreview` runs on every render. **Do not call `URL.createObjectURL` directly inside it** or URLs will leak. Cache by file ID and call `revokeObjectURL` during cleanup; the showcase's `useObjectUrls` demonstrates the pattern.
- `limit` counts controlled `files.length`. Without `files`, the existing count is treated as zero, so the limit can reject an oversized single selection but cannot prevent accumulation across selections.
- `useUpload.remove` calls `abort()`, but cancellation reaches the transport only if `request` forwards `signal`. Late resolutions are discarded and cannot revive removed rows.
- Enabling `sortable` introduces a static dependency on `@dnd-kit/*`, shared with Sortable and Kanban. Under source distribution it may be bundled even when a specific Upload instance is not sortable.
- The required state is exposed to assistive tech through a **description**, not `aria-required` (#294): the dropzone is a `role="button"` element and the button variant is a real `<button>`, and `aria-required` is only valid on input-like roles, so screen readers ignore it there. Passing `required` — or placing Upload inside `<Field required>` — attaches a screen-reader-only "Required" note to the trigger.
- `<Field required>` only sets the semantic marker; it does **not** turn on native `required` validation. To have the browser block submission, pass `required` yourself together with `name`.
- The trigger's own `aria-describedby` carries `hint` plus the required note, so Field's `description` / `error` do not travel that path — put explanatory copy in the component's `hint`.

## Related
[Sortable](../sortable/sortable.md) · [ImageCropper](../image-cropper/image-cropper.md) · [SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Progress](../progress/progress.md)
