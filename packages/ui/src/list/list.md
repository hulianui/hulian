---
slug: list
name: List
category: data-display
group: collection
tags: []
exports: [List, ListItem, ListItemMeta]
status: enriched
---

# List

> 数据列表 · 复合 List/ListItem/ListItem.Meta + actions/size/bordered/split/grid + 空态/分页/加载更多(零依赖·复用 Empty/Pagination/Avatar/User) · data-display/collection

## 何时用

渲染同构条目流——团队成员、消息、设置项、资源卡片。带表头列/排序/可编辑用 [Table](../table/table.md)/[EditableTable](../editable-table/editable-table.md)；本组件是更轻的"每行一条 + 头像/标题/描述/操作"垂直列表，开 `grid` 即变卡片栅格。

## 导入
```ts
import { List, ListItem, ListItemMeta } from "@hulianui/ui"
```

## Props

`ListProps<T>`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | `T[]` | — | 数据数组(数据驱动模式，配合 `renderItem`) |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 尺寸(影响行内边距) |
| bordered | `boolean` | `false` | 外层边框 + 圆角容器(栅格态下忽略) |
| inset | `boolean` | 跟随 `bordered` | 行/头尾插槽水平内边距(与 bordered 解耦)；放进侧栏等已有容器时设 `inset` 让内容不贴边 |
| split | `boolean` | `true` | 行分隔线(栅格态下忽略) |
| grid | `boolean \| ListGridConfig` | — | 栅格卡片态(复用 Grid)；传 `true` 用默认配置(3 列) |
| loadMore | `ListLoadMore` | — | 「加载更多」配置(底部按钮 + loading) |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderItem | `(item: T, index: number) => ReactNode` | 渲染函数——渲染每一项；建议返回 `<ListItem>`。不传则把 item 当 ReactNode 直接渲染 |
| children | `ReactNode` | 组合模式：直接放 `<ListItem>` 子元素(与 `items` 二选一，`items` 优先) |
| header | `ReactNode` | 头部插槽 |
| footer | `ReactNode` | 底部插槽(渲染在最底部) |
| empty | `ReactNode` | 空态内容(不传用内置 `<Empty>`) |
| pagination | `ReactNode` | 分页槽(放 `<Pagination>`)，渲染在列表下方 |

`ListGridConfig`：`cols`(默认 3) / `gap`(默认 4，×0.25rem) / `colGap` / `rowGap` / `rows`
`ListLoadMore`：`onLoadMore*` / `loading` / `hasMore`(默认 true，false 时不渲染按钮) / `text`(默认 "加载更多")

`ListItemProps`：`actions?: ReactNode[]`(行右侧操作区，多项间自动加分隔线) / `children`
`ListItemMetaProps`：`avatar` / `title` / `description`

## 示例
```tsx
<List
  bordered
  items={people}
  renderItem={(p) => (
    <ListItem actions={[<Button key="e" variant="ghost" size="sm">编辑</Button>]}>
      <ListItem.Meta avatar={<Avatar fallback={p.initials} />} title={p.name} description={p.role} />
    </ListItem>
  )}
  header={<span>团队成员</span>}
/>

// 卡片栅格态
<List grid={{ cols: 2, gap: 4 }} items={people}
  renderItem={(p) => <ListItem>…</ListItem>} />
```

## 禁忌 / 坑

- `items` 与 `children` 二选一，同时给则 `items` 优先；数据驱动用 `items + renderItem`，静态布局直接放 `<ListItem>` children。
- `grid` 态下 `bordered` / `split` 被忽略(边框由卡片自带)。
- `ListLoadMore.hasMore=false` 时整个加载更多按钮不渲染，别等它消失才发现没传完。

### 无障碍名

`aria-label` / `aria-labelledby` / `aria-describedby` 会被透到 `role="list"` 的节点上，
其余原生属性仍落在最外层容器。所以 `getByRole("list", { name: "…" })` 找得到，读屏也不会听到一个无名列表
（hulianui/hulian#60）。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
