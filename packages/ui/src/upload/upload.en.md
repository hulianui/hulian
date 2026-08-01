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
| `retry` | Retries one failed item. |
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

<Upload multiple limit={5} files={up.files} onSelect={up.add} onRemove={up.remove} />
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
- **The library does not unwrap backend envelopes.** Your `request` closure must extract `{ url }` from shapes such as `code/data/msg` before returning.
- `sortable` requires `onSort` because ordering is controlled. Supplying `sortable` alone intentionally falls back to a static list.
- `renderPreview` runs on every render. **Do not call `URL.createObjectURL` directly inside it** or URLs will leak. Cache by file ID and call `revokeObjectURL` during cleanup; the showcase's `useObjectUrls` demonstrates the pattern.
- `limit` counts controlled `files.length`. Without `files`, the existing count is treated as zero, so the limit can reject an oversized single selection but cannot prevent accumulation across selections.
- `useUpload.remove` calls `abort()`, but cancellation reaches the transport only if `request` forwards `signal`. Late resolutions are discarded and cannot revive removed rows.
- Enabling `sortable` introduces a static dependency on `@dnd-kit/*`, shared with Sortable and Kanban. Under source distribution it may be bundled even when a specific Upload instance is not sortable.

## Related
[Sortable](../sortable/sortable.md) · [ImageCropper](../image-cropper/image-cropper.md) · [SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Progress](../progress/progress.md)
