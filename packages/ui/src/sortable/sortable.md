---
slug: sortable
name: Sortable
category: data-display
group: collection
tags: []
exports: [Sortable]
status: enriched
---

# Sortable

> 拖拽排序 · @dnd-kit headless + 键盘可拖(Space 抓起/方向键移动) + 手柄/整项两式 + 横竖向 · 受控 onChange(arrayMove) · data-display/collection

## 何时用

单列表内拖拽改顺序（表格列设置、标签排序、表单字段排序），受控数据 + `onChange` 回吐 arrayMove 后的新数组。要跨多列流转（看板/任务流）用 [Kanban](../kanban/kanban.md)；要节点画布连线编排用 [Flow](../flow/flow.md)。

## 导入
```ts
import { Sortable } from "@hulianui/ui"
```

## Props

`SortableProps<T>` 泛型。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items * | T[] | — | 受控数据数组；拖拽后由你据 onChange 写回 state |
| onChange * | (items: T[]) => void | — | 顺序变化回调（拖拽或键盘移动均触发），参数是 arrayMove 后的新数组 |
| renderItem * | (item: T, state: { dragging: boolean }) => ReactNode | — | 渲染单项；`state.dragging` 表示该项正被拖拽 |
| getId | (item: T) => UniqueIdentifier | 读 `item.id` | 取每项稳定 id，须列表内唯一且稳定 |
| orientation | `"vertical"｜"horizontal"` | `"vertical"` | 排列方向 |
| handle | boolean | false | true=仅左侧手柄可拖（触屏/含交互元素的行推荐）；false=整项可拖 |
| className | string | — | 容器类名 |

## 示例
```tsx
const [items, setItems] = useState(fields);

<Sortable
  items={items}
  onChange={setItems}
  handle
  renderItem={(f) => (
    <div className="flex items-center justify-between gap-3">
      <span className="font-medium text-foreground">{f.label}</span>
      <span className="shrink-0 text-xs text-muted">{f.hint}</span>
    </div>
  )}
/>

// 横向
<Sortable items={tags} orientation="horizontal" onChange={setTags}
  renderItem={(t) => <span>{t.name}</span>} />
```

## 禁忌 / 坑

- 受控组件：`onChange` 不会替你改 state，必须自己把新数组写回（`onChange={setItems}`）。
- `getId` 返回的 id 必须稳定唯一；用数组下标当 id 会在重排后错乱。
- 行内含按钮/链接等交互元素时设 `handle`，否则整项可拖会拦截子元素的点击/拖拽（参考 [[dnd-kit-draggable-container-guard-interactive-children]]）。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
