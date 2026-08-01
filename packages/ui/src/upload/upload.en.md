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
| multiple | `boolean` | `false` | Whether to allow multiple selections |
| disabled | `boolean` | `false` | Disable |
| maxSize | `number` | — | The upper limit of single file bytes; if the limit is exceeded, enter `onReject(reason="size")` |
| limit | `number` | — | The upper limit of the number of files (according to `files.length`); after reaching the limit, the trigger is automatically disabled and "selected n/limit" is displayed. If the limit is exceeded, `onReject(reason="limit")` will be entered. |
| variant | `"dropzone" \| "button"` | `"dropzone"` | Form: drag drop area/single button |
| files | `UploadFile[]` | — | List of files for controlled display (including status/progress/url); if not passed, the list will not be rendered. |
| renderPreview | `(file: UploadFile) => ReactNode` | — | Thumbnail rendering hook; when returning to the node, the left side of the list item changes to 40px preview position (the status point is downgraded to a corner mark), and `null` is returned to the default dot. |
| sortable | `boolean` | `false` | Enables drag reordering when `onSort` is also provided. |
| className | `string` | — | Container class name |

## Events

| Event | Type | Description |
|------|------|------|
| onSelect | `(files: File[]) => void` | Called with files that pass validation. |
| onReject | `(rejections: UploadRejection[]) => void` | Called for rejected files with reason `"type"`, `"size"`, or `"limit"`. |
| onRemove | `(id: string) => void` | List item remove button click |
| onSort | `(files: UploadFile[]) => void` | The new sequence after drag-and-drop resequencing (the component does not save the sequence, you write it back to `files`) |

## Slots

| Slot | Type | Description |
|------|------|------|
| label | `ReactNode` | Dropzone label; the default is `"\u70b9\u51fb\u6216\u62d6\u62fd\u6587\u4ef6\u5230\u6b64\u5904"`, built-in Chinese copy meaning “Click or drag files here.” |
| hint | `ReactNode` | Drop zone auxiliary instructions (format/size limit tips) |
| buttonLabel | `ReactNode` | Button-mode label; the default is `"\u9009\u62e9\u6587\u4ef6"`, built-in Chinese copy meaning “Choose files.” |
| children | `ReactNode` | Customize drop zone content (override label/hint) |

> `UploadFile`: `{ id; name; size?; status?: "ready"\|"uploading"\|"success"\|"error"; progress?; error?; url?; raw? }`
> · `progress` Show progress bar + percentage only for `status="uploading"` (internally clamped to 0–100)
> · `url` / `raw` are **pure additional fields** that do not participate in the internal logic of the component and are only for `renderPreview` and yourself to read back; `onSelect` is still given to `File[]`, and the File semantics have not been replaced.

## useUpload (transport layer)

```ts
const up = useUpload({ request, concurrency?, onChange?, onSuccess?, onError? })
// up: { files, add, remove, retry, reorder, clear, uploading }
```

| Options | Type | Default | Description |
|------|------|------|------|
| request | `(file, { onProgress, signal }) => Promise<{ url }>` | — | Required transport implementation. Forward `signal` to fetch or XHR. |
| concurrency | `number` | `3` | Concurrency upper limit, excessive queuing (`0` will go to `1`, no deadlock) |
| onChange | `(files: UploadFile[]) => void` | — | Callback after any file changes |
| onSuccess / onError | `(file, result \| error) => void` | — | Single file finalization callback (cancellation by abort does not trigger onError) |

| Returns | Description |
|------|------|
| `files` | Feed `<Upload files>` directly |
| `add` | Connect to `<Upload onSelect>`, enter the queue and automatically start transmission according to concurrent |
| `remove` | Connect to `<Upload onRemove>`, and the ongoing task will be aborted. |
| `retry` | Retransmit a single failed item |
| `reorder` | Connect to `<Upload onSort>`; it changes list order without affecting upload tasks. |
| `clear` | Cancel all and clear |
| `uploading` | Are there any tasks queued or in progress? |

## Example

Automatic upload (progress + concurrency + quantity limit):
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

Image wall with thumbnails and drag sorting:
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
