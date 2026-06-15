---
slug: book-3d
name: Book3D
category: data-display
group: collection
tags: [animated]
exports: [Book3D]
status: enriched
---

# Book3D

> 3D 立体书 · CSS 3D transform 透视书体(前封/书脊/页块/后封) + 渐变或图封面 + 封面标题副标 + 角标缎带 + hover 翻正(纯 transform·GPU 合成·reduced-motion 降级) · 作品集书架/封面墙 · data-display/collection · #animated

## 何时用

作品集/书架/封面墙这类需要立体书视觉的展示场景用，hover 时书体翻正、可选翻开内页。它是纯装饰展示卡，和本组下的数据型组件（[Table](../table/table.md)/[PricingTable](../pricing-table/pricing-table.md)）无关；要规整网格卡片用 [List](../list/list.md)。

## 导入
```ts
import { Book3D } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| title* | `ReactNode` | — | 封面主标题（如 "CSS" / "JS"） |
| subtitle | `ReactNode` | — | 封面副标题（如 "转换" / "FUNCTION"） |
| cover | `string` | — | 封面图 url；提供时覆盖 coverColor 渐变 |
| logo | `string` | — | 封面中心叠加的产品 logo / app icon（图 url），标题落底部 |
| inside | `ReactNode` | — | 内页内容；提供则 hover 时前封绕书脊翻开露出内页 |
| coverColor | `{ from: string; to: string }` | 品牌渐变 | 封面渐变色 |
| spineColor | `string` | 浅纸色 | 书脊/页厚颜色（CSS color） |
| thickness | `string` | `"2.25rem"` | 书脊厚度（CSS 长度） |
| ribbon | `string` | — | 角标缎带文字（如 "NEW" / "N°1"） |
| ribbonTone | `"brand" \| "danger" \| "success"` | `"danger"` | 缎带语气 |
| href | `string` | — | 提供则整本书是链接 |
| onClick | `() => void` | — | 无 href 时提供则整本书是按钮 |
| target | `string` | — | 外链是否新窗（href 时生效） |
| className | `string` | — | 根节点类名 |

## 示例
```tsx
// 书架（多本并排，hover 翻正）
<div className="flex flex-wrap gap-8">
  <Book3D title="CSS" subtitle="转换" ribbon="NEW" coverColor={{ from: "#f7b733", to: "#e0992b" }} />
  <Book3D title="JS" subtitle="FUNCTION" coverColor={{ from: "#5aa6e0", to: "#3f7fc0" }} />
  <Book3D title="HTML" subtitle="5" ribbon="N°1" ribbonTone="danger" coverColor={{ from: "#e0654a", to: "#c14a32" }} />
</div>

// 品牌渐变（默认 coverColor）
<Book3D title="瑚琏" subtitle="hulianui" />
```

## 禁忌 / 坑

- `cover`（图封面）会覆盖 `coverColor`（渐变），二者同传以图为准。
- hover 翻正/翻开是纯 CSS transform 动画，`prefers-reduced-motion` 下自动降级——不要再额外包 JS 动画。
- `href` 和 `onClick` 二选一：有 href 整本是 `<a>`，否则有 onClick 是 `<button>`。

## 相关
[Table](../table/table.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md) · [List](../list/list.md)
