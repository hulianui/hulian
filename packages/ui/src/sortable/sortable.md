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
| items * | T[] | - | 受控数据数组；拖拽后由你据 onChange 写回 state |
| getId | (item: T) => UniqueIdentifier | 读 `item.id` | 取每项稳定 id，须列表内唯一且稳定 |
| orientation | `"vertical"｜"horizontal"` | `"vertical"` | 排列方向 |
| handle | boolean | false | true=仅左侧手柄可拖（触屏体验更稳、抓手更明确）；false=整项可拖。行内交互元素已由组件守卫，两种模式都不会劫持 |
| className | string | - | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange * | (items: T[]) => void | 顺序变化回调（拖拽或键盘移动均触发），参数是 arrayMove 后的新数组 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderItem * | (item: T, state: SortableItemState) => ReactNode | 渲染单项的渲染函数；`state.dragging` 表示该项正被拖拽，`state.index` 是该项在 items 中的下标（0 起） |

`SortableItemState`：

| 字段 | 类型 | 说明 |
|------|------|------|
| dragging | boolean | 该项是否正被拖拽 |
| index | number | 该项在当前 items 中的下标（0 起）。用于「第 N 项」序号与行内控件的唯一 `aria-label`，无需消费方 `items.findIndex` 兜回来（O(n²)） |

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
      <span className="shrink-0 text-xs text-muted-foreground">{f.hint}</span>
    </div>
  )}
/>

// 横向
<Sortable items={tags} orientation="horizontal" onChange={setTags}
  renderItem={(t) => <span>{t.name}</span>} />

// 行内交互元素 + 序号：整项可拖也不会劫持 input/button
<Sortable
  items={questions}
  onChange={setQuestions}
  renderItem={(q, { index }) => (
    <div className="flex items-center gap-2">
      <span>第 {index + 1} 题</span>
      <span className="flex-1 truncate">{q.title}</span>
      <input type="number" value={q.score} aria-label={`第 ${index + 1} 题分值`} onChange={...} />
      <button type="button" aria-label={`删除第 ${index + 1} 题`} onClick={...}>删除</button>
    </div>
  )}
/>
```

## 禁忌 / 坑

- 受控组件：`onChange` 不会替你改 state，必须自己把新数组写回（`onChange={setItems}`）。
- `getId` 返回的 id 必须稳定唯一；用数组下标当 id 会在重排后错乱。
- 行内的 `input / textarea / select / button / label / a / [role=button] / [role=link] / [contenteditable]` 不会劫持拖拽——守卫内置在指针 sensor 里，**默认（`handle={false}`）就安全**，不必为此设 `handle`（参考 [[dnd-kit-draggable-container-guard-interactive-children]]）。自绘的可拖控件（色卡、滑块、画布）不在上述标签之列，给它加 `data-no-drag` 即可放行。
- 拖拽手柄的无障碍名称跟随 `ConfigProvider locale`；`enUS` 提供 “Reorder item N”，未包 Provider 时保持中文。
- 守卫向上查找止步于当前项（`<li>`），不会一路找到 document——整个列表被外层 `<a>`/`<label>` 包住时不会全体锁死。
- 展示序号别用 `items.findIndex(...)` 反查（O(n²)），直接取 `renderItem` 第二参的 `state.index`。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
