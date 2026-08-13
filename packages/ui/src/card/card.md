---
slug: card
name: Card
category: data-display
group: collection
tags: []
exports: [Card, CardHeader, CardBody, CardFooter]
status: enriched
---

# Card

> 卡片 · Header/Body/Footer 插槽 · data-display/collection

## 何时用

把一组相关内容圈进带边框/阴影的容器——信息块、统计项、表单分区、列表卡片。需要条目流用 [List](../list/list.md)(其 `grid` 态本身就是卡片栅格)；展示键值对详情用 [Descriptions](../descriptions/descriptions.md)。本组件只是纯容器外壳 + 三段插槽，不含业务逻辑。

## 导入
```ts
import { Card, CardHeader, CardBody, CardFooter } from "@hulianui/ui"
```

## Props

`CardProps` 继承原生 `HTMLAttributes<HTMLDivElement>`，外加 CVA 变体：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variant | `"outline" \| "elevated" \| "featured" \| "plain"` | `"outline"` | 外观：描边 / 投影抬升 / 强调 / 不画皮 |
| divided | `boolean` | `true` | 是否用分隔线把 `CardHeader` / `CardFooter` 与正文切开。设 `false` 时两条线一起去掉，并把它们原本撑着的那段内边距收一档 |

`CardBody` / `CardFooter` 为插槽容器，接收原生 div 属性 + `children`。

`CardHeaderProps`（另继承 `HTMLAttributes<HTMLDivElement>`，除 `title`，因其类型被改为 ReactNode）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| title | `ReactNode` | — | 主标题。标题有自己的元素（`data-slot="card-title"`），因此有独立的字号 / 行高 / 字重 |
| description | `ReactNode` | — | 副标题 / 说明，排在标题下方，次要文字色 |
| extra | `ReactNode` | — | 右侧操作区（按钮、开关、计数），与标题群**恒同行**垂直居中：换行判据不看内容长度，`description` 再长也不会把它挤到第二行 |

「有值」的口径与 `PageHeader` 的 `meta` 一致：`null` / `undefined` / `false` / `""` 都算没传，所以 `title={isEditing && "编辑中"}` 在假值时不会切进结构态。

三者**一个都不传**时 `CardHeader` 就是今天的裸插槽：`children` 直接作正文，容器带 `font-medium`。传了任意一个即切换为「标题群 / 右侧操作区」两列排布，此时 `font-medium` 从容器上撤掉、只落在标题元素上——同一行的图标、`Tag`、计数不再被染成标题字重。`children` 保留为逃生口，结构态下排在标题与副标题之后（仍在左列）。

`plain` 是「不画皮」的那一档：不画边框、不铺底色、不投阴影，只留圆角、文字色和三段插槽语义。用在**容器的外观已经由别处提供**的场景——迁移期页面自带的 hero 样式、外层已经有一层卡片、或者卡片坐在带渐变的区块里。其余三档都会画底色（`bg-surface`），套上去就是双重描边 + 双重底色。同名的 `plain` 在 [Accordion](../accordion/accordion.md) / [Collapsible](../collapsible/collapsible.md) 的 Panel 上也有，语义一致：**内容自带外观时，要的不是改皮肤而是没有皮肤**。

## 示例
```tsx
<Card variant="elevated" className="w-64">
  <CardHeader>瑚琏卡片</CardHeader>
  <CardBody>宗庙玉器，至美又大用。</CardBody>
  <CardFooter>footer 区</CardFooter>
</Card>
```

「图标 + 标题 + 状态标签 + 右侧操作」这一行——中后台卡片头最常见的形状：
```tsx
<Card>
  <CardHeader
    title={<><Users className="size-5 text-muted-foreground" />指派任务<Tag>按角色</Tag></>}
    description="按角色批量指派，指派后立即生效"
    extra={<Button variant="ghost" size="sm">展开</Button>}
  />
  <CardBody>…</CardBody>
</Card>
```

## 禁忌 / 坑

- 别用 Card 包 loading 骨架屏——参见 [[loading-skeletons-are-chromeless-dont-wrap-in-card]]：骨架按惯例是无边框无阴影的纯 shimmer 块，套 Card 会显得过重。
- 列表/侧栏里 Card 末行(时间戳/meta 行)若设了外层 `min-height` 又用 flex 撑高，meta 行可能漏到卡片背景外——参见 [[grid-card-button-tail-row-leaks-outside-when-outer-min-height]]。
- 标题里放图标 / `Tag` 时用 `title` 而不是把整行塞进 `children`：塞进 `children` 时 header 的 `font-medium` 会连图标、标签、计数一起染成标题字重，而标题自己反而没有字号与行高的表达。
- `CardHeader` 的 `title` 是 `ReactNode`，与原生 `HTMLAttributes.title?: string` 冲突，类型已 `Omit<"title">`——需要原生 tooltip 请挂在内层元素上。
- `extra` **不会因为 `title` / `description` 变长而掉到第二行**（#263）：左列是 `flex: 1 1 0`，换行判据与内容长度脱钩，长文本该 `truncate` / `line-clamp` 就截断。**这也意味着窄容器里 `extra` 会一直占着位置**——想让它挤压标题就得给标题写溢出处理。卡片宽度由布局给（三列网格、侧栏），与视口无关，所以这里刻意没有「窄屏换行」那一档；页面级的 [PageHeader](../page-header/page-header.md) 才有，那边页头总是全宽、视口窄等于页头窄。
- `divided={false}` 只作用于 Card 的**直接子** `CardHeader` / `CardFooter`，卡里套卡时外层的取值不会传染给内层（内层要关线自己传）。它也不是 context 下发——Card 至今没有 `"use client"`，能直接放进 server component 里用。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
