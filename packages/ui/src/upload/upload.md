---
slug: upload
name: Upload
category: forms
group: advanced
tags: []
exports: [Upload, matchesAccept]
status: enriched
---

# Upload

> 文件上传 · 拖拽落区/按钮形态 + accept/maxSize 校验 + 受控文件列表(状态/进度)，零依赖自研只发 onSelect · forms/advanced

## 何时用

需要选/拖文件并展示带状态进度的文件列表时用。注意：组件**不做网络传输**，它只在通过 `accept`/`maxSize` 校验后回 `onSelect`，真正上传、进度回填由消费者完成（受控 `files`）。落区形态用 `variant="dropzone"`，紧凑场景用 `variant="button"`。图片选完要裁剪请配合 [ImageCropper](../image-cropper/image-cropper.md)。

## 导入
```ts
import { Upload, matchesAccept } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| accept | `string` | — | 原生 accept（如 `"image/*,.pdf"`）；同时用于落区校验 |
| multiple | `boolean` | `false` | 是否允许多选 |
| disabled | `boolean` | `false` | 禁用 |
| maxSize | `number` | — | 单文件字节上限；超限进 `onReject(reason="size")` |
| variant | `"dropzone" \| "button"` | `"dropzone"` | 形态：拖拽落区 / 单按钮 |
| files | `UploadFile[]` | — | 受控展示的文件列表（含状态/进度）；不传则不渲染列表 |
| className | `string` | — | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSelect | `(files: File[]) => void` | 通过校验的文件被选中（点击选择或拖入） |
| onReject | `(rejections: UploadRejection[]) => void` | 被校验拒绝的文件（类型/大小） |
| onRemove | `(id: string) => void` | 列表项移除按钮点击 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| label | `ReactNode` | 落区主文案 |
| hint | `ReactNode` | 落区辅助说明（格式/大小限制提示） |
| buttonLabel | `ReactNode` | button 形态的按钮文案（默认 `"选择文件"`） |
| children | `ReactNode` | 自定义落区内容（覆盖 label/hint） |

> `UploadFile`：`{ id; name; size?; status?: "ready"\|"uploading"\|"success"\|"error"; progress?; error? }`，`progress` 仅 `status="uploading"` 时展示进度条。

## 示例
```tsx
const [files, setFiles] = useState<UploadFile[]>([]);
<Upload
  multiple
  maxSize={5 * 1024 * 1024}
  hint="支持任意格式，单文件 ≤ 5MB"
  files={files}
  onSelect={(picked) => /* 上传并回填 files */}
  onRemove={(id) => /* 移除 */}
/>
```

按钮形态 + 仅图片：
```tsx
<Upload variant="button" accept="image/*" files={files} onSelect={add} onRemove={remove} />
```

## 禁忌 / 坑

- 组件只发 `onSelect`，**不会自己上传**。进度条/成功/失败态全靠消费者把 `UploadFile.status`/`progress`/`error` 回填到受控 `files`。
- 想知道某文件为何被拒（类型 vs 大小）接 `onReject`，`reason` 区分 `"size"`/`"type"`。
- 暂无其它已知坑。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../_mui/rating.md)
