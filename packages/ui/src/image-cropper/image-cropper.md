---
slug: image-cropper
name: ImageCropper
category: forms
group: advanced
tags: []
exports: [ImageCropper, cropImageToBlob]
status: enriched
---

# ImageCropper

> 图片裁剪 · 固定比例框(默认证件照 5:7) + 触屏双指捏合/拖拽对位 + 缩放滑杆 + canvas 出 Blob(尺寸/质量/字节上限可配·react-easy-crop MIT) · forms/advanced

## 何时用

头像、证件照、封面图等「上传前要按固定比例裁一刀并控尺寸/体积」的场景用。给定图片源 + 比例，用户拖拽缩放对位后 `onCropped` 产出目标尺寸的 Blob。通常接在 [Upload](../upload/upload.md) 选完文件之后（把 File 转 object URL 喂给 `image`）。

## 导入
```ts
import { ImageCropper, cropImageToBlob } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| image* | `string` | — | 图片源：object URL / data URL / 同源地址 |
| aspect | `number` | `5/7` | 裁剪框宽高比（证件照 1 寸/2 寸同比例） |
| outputWidth | `number` | `413` | 输出位图宽（px），高按 aspect 推导取整（2 寸 @300DPI） |
| outputType | `string` | `"image/jpeg"` | 输出 mime |
| quality | `number` | `0.9` | 编码质量 0–1 |
| maxBytes | `number` | — | 输出字节上限（如 `200*1024`）：超限降质重试一次 |
| maxZoom | `number` | `3` | 最大缩放倍数 |
| cropAreaClassName | `string` | `h-64 sm:h-80` | 裁剪画布区高度 class |
| className | `string` | — | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onCropped* | `(blob: Blob) => void` | 确认裁剪：产出目标尺寸 Blob |
| onCancel | `() => void` | 取消按钮点击（不传则不渲染取消按钮） |
| onError | `(error: unknown) => void` | 画布导出失败（极旧浏览器 / canvas 受限） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| confirmLabel | `ReactNode` | 确认按钮文案（默认 `"确认"`） |
| cancelLabel | `ReactNode` | 取消按钮文案（默认 `"取消"`） |

## 示例
```tsx
<ImageCropper
  image={objectUrl}
  aspect={5 / 7}
  maxBytes={200 * 1024}
  onCropped={(blob) => /* 存储/上传 */}
  onCancel={() => /* 关闭 */}
/>
```

方形头像：
```tsx
<ImageCropper image={objectUrl} aspect={1} onCropped={save} />
```

## 禁忌 / 坑

- `image` 必须**同源可被 canvas 读取**（object URL / data URL / 同源地址）；跨域无 CORS 头的图会污染画布导致导出抛错（走 `onError`）。
- `maxBytes` 是「尽力而为」：首次超限只降质重试一次（quality×0.72，下限 0.5），仍超限会原样输出，不保证一定达标。
- 不传 `onCancel` 就不渲染取消按钮（单动作场景）。
- 暂无其它已知坑。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
