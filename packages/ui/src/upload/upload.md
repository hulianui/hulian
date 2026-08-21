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
| accept | `string` | - | 原生 accept（如 `"image/*,.pdf"`）；同时用于落区校验 |
| multiple | `boolean` | `false` | 是否允许多选 |
| disabled | `boolean` | `false` | 禁用 |
| maxSize | `number` | - | 单文件字节上限；超限进 `onReject(reason="size")` |
| limit | `number` | - | 文件数量上限（按 `files.length` 计）；达标后触发器自动禁用并显示「已选 n/limit」，超额进 `onReject(reason="limit")` |
| variant | `"dropzone" \| "button"` | `"dropzone"` | 形态：拖拽落区 / 单按钮 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 尺寸档：落区高度 / button 形态的按钮高度（button 形态与 `<Button>` 同名档等高） |
| name | `string` | - | 内层 `<input type="file">` 的 name。**给了它才是真表单控件**：原生 `<form>` + `new FormData(form)` 读得到文件，`required` 才会被浏览器校验 |
| required | `boolean` | - | 原生必填校验，透传到内层 input（**需同时给 `name`**）；同时给触发器挂上 sr-only 的「必填」说明 |
| aria-required | `boolean \| "true" \| "false"` | - | 必填的**语义标记**，通常由 `<Field required>` 自动注入，不用自己传。只开无障碍那一半（触发器上的 sr-only「必填」说明），**不**打开原生 `required` 校验 |
| inputRef | `Ref<HTMLInputElement>` | - | 拿到内层 input 的引用（自定义校验、手动清空、第三方表单库注册） |
| resetInputAfterSelect | `boolean` | 无 `name` 时 `true`；有 `name` 时 `false` | 选完是否清空 `input.value`。清了才能重复选同一个文件，清了 FormData 就读不到 |
| files | `UploadFile[]` | - | 受控展示的文件列表（含状态/进度/url）；不传则不渲染列表 |
| renderPreview | `(file: UploadFile) => ReactNode` | - | 缩略图渲染钩子；返回节点时列表项左侧变 40px 预览位（状态点降级为角标），返回 `null` 回落默认圆点 |
| sortable | `boolean` | `false` | 列表可拖拽调序（**需同时传 `onSort` 才生效**） |
| className | `string` | - | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSelect | `(files: File[]) => void` | 通过校验的文件被选中（点击选择或拖入） |
| onReject | `(rejections: UploadRejection[]) => void` | 被校验拒绝的文件（`reason`: `"type"` / `"size"` / `"limit"`） |
| onRemove | `(id: string) => void` | 列表项移除按钮点击 |
| onRetry | `(id: string) => void` | 失败行重试按钮点击。**传了才渲染这个按钮**（同 `onRemove` 的口径）；直接接 `useUpload` 的 `retry` |
| onSort | `(files: UploadFile[]) => void` | 拖拽调序后的新顺序（组件不偷存顺序，由你写回 `files`） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| label | `ReactNode` | 落区主文案 |
| hint | `ReactNode` | 落区辅助说明（格式/大小限制提示） |
| buttonLabel | `ReactNode` | button 形态的按钮文案（默认 `"选择文件"`） |
| children | `ReactNode` | 自定义落区内容（覆盖 label/hint） |

> `UploadFile`：`{ id; name; size?; status?: "ready"\|"uploading"\|"success"\|"error"; progress?; error?; url?; raw? }`
> · `progress` 仅 `status="uploading"` 时展示进度条 + 百分比（内部 clamp 到 0-100）
> · `url` / `raw` 都是**纯附加字段**，不参与组件内部逻辑，只供 `renderPreview` 与你自己回读；`onSelect` 仍然给 `File[]`，File 语义没被替换

## useUpload（传输层）

```ts
const up = useUpload({ request, concurrency?, onChange?, onSuccess?, onError? })
// up: { files, add, remove, retry, reorder, clear, uploading }
```

| 选项 | 类型 | 默认 | 说明 |
|------|------|------|------|
| request | `(file, { onProgress, signal }) => Promise<{ url }>` | - | 必填。怎么发由你定；`signal` 请透传给 fetch/XHR |
| concurrency | `number` | `3` | 并发上限，超出的排队（`0` 会兜到 `1`，不会死锁） |
| onChange | `(files: UploadFile[]) => void` | - | 任一次 files 变化后回调 |
| onSuccess / onError | `(file, result \| error) => void` | - | 单个文件落定回调（被 abort 的取消不触发 onError） |

| 返回 | 说明 |
|------|------|
| `files` | 直接喂 `<Upload files>` |
| `add` | 接 `<Upload onSelect>`，入列并按并发自动开传 |
| `remove` | 接 `<Upload onRemove>`，进行中的任务会被 abort |
| `retry` | 接 `<Upload onRetry>`，重传单个失败项 |
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

<Upload multiple limit={5} files={up.files} onSelect={up.add} onRemove={up.remove} onRetry={up.retry} />
```

原生 `<form>` + `FormData`（不进 React state，`required` 交给浏览器）：
```tsx
<form
  onSubmit={(e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget); // fd.get("file") 就是 File
    void fetch("/api/upload", { method: "POST", body: fd });
  }}
>
  <Upload name="file" required accept=".pdf" size="sm" hint="仅 PDF，≤ 10MB" />
  <button type="submit">提交</button>
</form>
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
- **不给 `name` 就没有原生表单这条路**：没有 name 的 input 压根不出现在 `FormData` 的 entries 里，`required` 也不会被浏览器校验。这两件事都不会报错，只是静默不生效。
- 挂了 `name` 后有三处默认行为跟着变（都只在有 name 时发生）：① 选完不再清 `value`（否则 FormData 永远读到空），代价是**同一个文件连选两次不会再触发 `onSelect`**——要那个行为就显式写 `resetInputAfterSelect`，但那样 FormData 就读不到了，二者不可兼得；② 拖入的文件会被写回 `input.files`（原生拖放不会自己进去），同时被 accept/maxSize/limit 拒掉的文件会被剔出去，避免「界面说拒了、表单照样提交」；③ 达到 `limit` 时 input **不**跟着禁用——禁用控件会被 FormData 整个跳过，已选的文件会在提交时凭空消失（触发器那侧照旧禁用，点不开选择框）。
- 写回 `input.files` 依赖 `DataTransfer` 构造器。测试环境（jsdom）没有它，回写会静默跳过，`onSelect` 那条路不受影响——**别在 jsdom 里断言拖入后的 `FormData` 内容**。
- 失败行的重试按钮**要传 `onRetry` 才出现**。`useUpload` 早就有 `retry`，但组件不替你决定「这个失败该不该给重试入口」——直接 `onRetry={up.retry}` 接上即可。
- **不要指望库帮你解后端信封**。`request` 拿到的 `{ url }` 是你自己 resolve 的，`code/data/msg` 之类的形状在你的闭包里剥完再返回。
- `sortable` 单独给不生效，**必须同时给 `onSort`**（顺序是受控的，组件不偷存）；只给 `sortable` 会静默退回静态列表。
- `renderPreview` 每次渲染都会被调用，**别在里面直接 `URL.createObjectURL`** —— 会漏对象 URL。缓存到 `Map<id, url>` 并在卸载时 `revokeObjectURL`（showcase 的 `useObjectUrls` 是可抄的写法）。
- `limit` 按受控 `files.length` 算；`files` 没传时视为 0，此时 `limit` 只能拦住"单次选太多"，拦不住累计。
- `useUpload` 的 `remove` 会 `abort()`，但**只有你把 `signal` 透传下去**才真取消；迟到的 resolve 会被丢弃，不会复活已移除的行。
- 引入 `sortable` 让 upload 静态依赖了 `@dnd-kit/*`（与 Sortable/Kanban 同源），source 分发下不用 sortable 也会打进包里。
- 必填对辅助技术的表达走**说明文本**，不是 `aria-required`（#294）：落区是 `role="button"`、button 形态是真 `<button>`，而 `aria-required` 在 ARIA 里只对输入型 role 有效，挂上去读屏不会念。传 `required`（或把 Upload 放进 `<Field required>`）时，触发器会串上一段 sr-only 的「必填」说明。
- `<Field required>` 只给语义标记，**不**打开原生 `required` 校验 —— 要浏览器拦下提交，仍需自己传 `required` 且同时给 `name`。
- 落区自己的 `aria-describedby` 串的是 `hint` 与必填说明，Field 的 `description` / `error` 不走这条路：说明文案请用组件的 `hint`。

## 相关
[Sortable](../sortable/sortable.md) · [ImageCropper](../image-cropper/image-cropper.md) · [SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Progress](../progress/progress.md)
