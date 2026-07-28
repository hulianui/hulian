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

> 文件上传 · 拖拽落区/按钮形态 + accept/maxSize/limit 校验 + 受控列表(缩略图/进度/拖拽调序)，传输层拆成 useUpload · forms/advanced

## 何时用

需要选/拖文件并展示带缩略图、状态、进度的文件列表时用。

**分层**（这是本组件的核心设计约束，别搞混）：

- `<Upload>` = **纯皮肤 + 状态展示**。它仍然**不做网络传输**，只在通过 `accept`/`maxSize`/`limit` 校验后回 `onSelect(File[])`，其余状态靠受控 `files` 回填。
- `useUpload({ request, concurrency })` = **传输层**。队列、并发闸门、进度回填、取消、重传都在这里；但**怎么发**由你给的 `request` 决定。

`request` 的签名是 `(file, { onProgress, signal }) => Promise<{ url }>`。库内**刻意没有** `action` / `headers` / `withCredentials` / `transformResponse` 这类参数——瑚琏是通用库，不给某一家后端的响应信封开后门，鉴权与解包请写在你的应用层闭包里。

落区形态用 `variant="dropzone"`，紧凑场景用 `variant="button"`。图片选完要裁剪请配合 [ImageCropper](../image-cropper/image-cropper.md)；纯排序不涉及上传用 [Sortable](../sortable/sortable.md)。

## 导入
```ts
import { Upload, useUpload, matchesAccept, moveUploadFile } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| accept | `string` | — | 原生 accept（如 `"image/*,.pdf"`）；同时用于落区校验 |
| multiple | `boolean` | `false` | 是否允许多选 |
| disabled | `boolean` | `false` | 禁用 |
| maxSize | `number` | — | 单文件字节上限；超限进 `onReject(reason="size")` |
| limit | `number` | — | 文件数量上限（按 `files.length` 计）；达标后触发器自动禁用并显示「已选 n/limit」，超额进 `onReject(reason="limit")` |
| variant | `"dropzone" \| "button"` | `"dropzone"` | 形态：拖拽落区 / 单按钮 |
| files | `UploadFile[]` | — | 受控展示的文件列表（含状态/进度/url）；不传则不渲染列表 |
| renderPreview | `(file: UploadFile) => ReactNode` | — | 缩略图渲染钩子；返回节点时列表项左侧变 40px 预览位（状态点降级为角标），返回 `null` 回落默认圆点 |
| sortable | `boolean` | `false` | 列表可拖拽调序（**需同时传 `onSort` 才生效**） |
| className | `string` | — | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSelect | `(files: File[]) => void` | 通过校验的文件被选中（点击选择或拖入） |
| onReject | `(rejections: UploadRejection[]) => void` | 被校验拒绝的文件（`reason`: `"type"` / `"size"` / `"limit"`） |
| onRemove | `(id: string) => void` | 列表项移除按钮点击 |
| onSort | `(files: UploadFile[]) => void` | 拖拽调序后的新顺序（组件不偷存顺序，由你写回 `files`） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| label | `ReactNode` | 落区主文案 |
| hint | `ReactNode` | 落区辅助说明（格式/大小限制提示） |
| buttonLabel | `ReactNode` | button 形态的按钮文案（默认 `"选择文件"`） |
| children | `ReactNode` | 自定义落区内容（覆盖 label/hint） |

> `UploadFile`：`{ id; name; size?; status?: "ready"\|"uploading"\|"success"\|"error"; progress?; error?; url?; raw? }`
> · `progress` 仅 `status="uploading"` 时展示进度条 + 百分比（内部 clamp 到 0–100）
> · `url` / `raw` 都是**纯附加字段**，不参与组件内部逻辑，只供 `renderPreview` 与你自己回读；`onSelect` 仍然给 `File[]`，File 语义没被替换

## useUpload（传输层）

```ts
const up = useUpload({ request, concurrency?, onChange?, onSuccess?, onError? })
// up: { files, add, remove, retry, reorder, clear, uploading }
```

| 选项 | 类型 | 默认 | 说明 |
|------|------|------|------|
| request | `(file, { onProgress, signal }) => Promise<{ url }>` | — | 必填。怎么发由你定；`signal` 请透传给 fetch/XHR |
| concurrency | `number` | `3` | 并发上限，超出的排队（`0` 会兜到 `1`，不会死锁） |
| onChange | `(files: UploadFile[]) => void` | — | 任一次 files 变化后回调 |
| onSuccess / onError | `(file, result \| error) => void` | — | 单个文件落定回调（被 abort 的取消不触发 onError） |

| 返回 | 说明 |
|------|------|
| `files` | 直接喂 `<Upload files>` |
| `add` | 接 `<Upload onSelect>`，入列并按并发自动开传 |
| `remove` | 接 `<Upload onRemove>`，进行中的任务会被 abort |
| `retry` | 重传单个失败项 |
| `reorder` | 接 `<Upload onSort>`，只换顺序不影响在飞任务 |
| `clear` | 全部取消并清空 |
| `uploading` | 是否还有排队中或进行中的任务 |

## 示例

自动上传（进度 + 并发 + 数量上限）：
```tsx
const up = useUpload({
  request: async (file, { onProgress, signal }) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd, signal });
    onProgress(100);
    return { url: (await res.json()).data.url }; // 信封解包在应用层
  },
  concurrency: 3,
});

<Upload multiple limit={5} files={up.files} onSelect={up.add} onRemove={up.remove} />
```

要真进度条就用 XHR（fetch 无上传进度事件）：
```ts
const request: UploadRequest = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress((e.loaded / e.total) * 100);
    xhr.onload = () => resolve({ url: JSON.parse(xhr.responseText).url });
    xhr.onerror = () => reject(new Error("网络异常"));
    signal.addEventListener("abort", () => xhr.abort());
    xhr.open("POST", "/api/upload");
    xhr.send(new FormData(/* ... */));
  });
```

图片墙：缩略图 + 拖拽调序
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

纯受控（不用 useUpload，自己管上传）：
```tsx
<Upload variant="button" accept="image/*" files={files} onSelect={add} onRemove={remove} />
```

## 禁忌 / 坑

- `<Upload>` **不会自己上传**。要自动上传就配 `useUpload`；坚持自己管，就把 `status`/`progress`/`error`/`url` 回填到受控 `files`。
- **不要指望库帮你解后端信封**。`request` 拿到的 `{ url }` 是你自己 resolve 的，`code/data/msg` 之类的形状在你的闭包里剥完再返回。
- `sortable` 单独给不生效，**必须同时给 `onSort`**（顺序是受控的，组件不偷存）；只给 `sortable` 会静默退回静态列表。
- `renderPreview` 每次渲染都会被调用，**别在里面直接 `URL.createObjectURL`** —— 会漏对象 URL。缓存到 `Map<id, url>` 并在卸载时 `revokeObjectURL`（showcase 的 `useObjectUrls` 是可抄的写法）。
- `limit` 按受控 `files.length` 算；`files` 没传时视为 0，此时 `limit` 只能拦住"单次选太多"，拦不住累计。
- `useUpload` 的 `remove` 会 `abort()`，但**只有你把 `signal` 透传下去**才真取消；迟到的 resolve 会被丢弃，不会复活已移除的行。
- 引入 `sortable` 让 upload 静态依赖了 `@dnd-kit/*`（与 Sortable/Kanban 同源），source 分发下不用 sortable 也会打进包里。

## 相关
[Sortable](../sortable/sortable.md) · [ImageCropper](../image-cropper/image-cropper.md) · [SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Progress](../progress/progress.md)
