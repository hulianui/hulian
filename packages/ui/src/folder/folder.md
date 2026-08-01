---
slug: folder
name: Folder
category: data-display
group: collection
tags: [animated]
exports: [Folder]
status: enriched
---

# Folder

> 3D 文件夹 · 点击展开的 3D 文件夹 · 三层纸张扇形铺开 + 展开后磁吸跟随鼠标(零依赖纯 CSS transform·token 派生·reduced-motion) · data-display/collection · #animated

## 何时用

需要一个有趣味交互的「文件夹」展示控件——点击展开、最多 3 张纸扇形铺开、展开后磁吸跟随鼠标时用，适合作品集/文件分组/装饰性入口。要做真实的多层级文件树导航请用 FileTree/Tree；要做表格化数据展示用 [Table](../table/table.md)。

## 导入
```ts
import { Folder } from "@hulianui/ui"
```

## Props

继承 `<div>` 属性（已 `Omit` 掉 `color`/`onClick`，由下表重定义）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| color | `string` | `var(--color-primary)` | 文件夹主体色，接受任意 CSS 颜色，推荐喂 token；showcase 备选 `chart-1/2/4` |
| size | `number` | `1` | 整体缩放倍数（基准 100×80px） |
| open | `boolean` | — | 受控展开态；提供时组件受控，须配 `onOpenChange` |
| defaultOpen | `boolean` | `false` | 默认展开态（非受控） |
| disableMagnet | `boolean` | `false` | 关闭磁吸跟随（展开后纸张不再随鼠标偏移） |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `MouseEventHandler<HTMLButtonElement>` | 点击文件夹（触发展开/收起）时回调 |
| onOpenChange | `(open: boolean) => void` | 展开态变化回调（受控/非受控均触发） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| items | `ReactNode[]` | 最多 3 张纸张内容（多余截断、不足补空），展开后扇形铺开并磁吸跟随 |

## 示例

```tsx
// 默认（点击展开）
<Folder />

// 带 3 张纸内容
<Folder
  size={1.4}
  items={[
    <span key="1">文档</span>,
    <span key="2">图片</span>,
    <span key="3">视频</span>,
  ]}
/>
```

## 禁忌 / 坑

- `items` 超过 3 张会被截断、不足会补空白纸，不要指望它渲染任意数量内容。
- 受控用法须同时给 `open` + `onOpenChange`，只给 `open` 不给回调会导致点击无法切换状态。
- 颜色 token 须带 `--color-` 前缀，裸 `var(--primary)` 不解析。
- 候选坑 [[nextjs-app-router-underscore-private-folder-404]] 讲的是 Next.js `_folder` 私有目录路由，与本组件无关，不适用。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
