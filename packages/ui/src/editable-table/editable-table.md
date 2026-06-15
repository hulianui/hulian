---
slug: editable-table
name: EditableTable
category: data-display
group: collection
tags: []
exports: [EditableTable]
status: enriched
---

# EditableTable

> 行内编辑表格 · 行级编辑(草稿副本/保存校验/取消还原) + 自定义编辑器(editor 逃生舱) + 增删行 + 列对齐/宽度(企业录入场景·文案接 i18n) · data-display/collection

## 何时用

需要在表格里直接行内编辑、增删行的录入场景——报价单、账单明细、人员配置。只读展示用 [Table](../table/table.md)；带查询区/工具栏/分页的完整列表页用 [ProTable](../pro-table/pro-table.md)。本组件聚焦"逐行编辑保存"这一窄能力。

## 导入
```ts
import { EditableTable } from "@hulianui/ui"
```

## Props

`EditableTableProps<T>`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| columns* | `EditableColumn<T>[]` | — | 列定义(见下表) |
| data* | `T[]` | — | 数据数组(受控数据源) |
| rowKey* | `(row: T) => string` | — | 行稳定 key |
| addable | `boolean` | `false` | 显示「新增一行」按钮(需配合 `newRow`) |
| newRow | `() => T` | — | 新行工厂(返回新行数据)；新增后该行自动进入编辑态 |
| deletable | `boolean` | `false` | 每行可删除 |
| validateRow | `(row: T) => boolean` | — | 保存前校验整行，返回错误(falsy)则拦截保存(行内提示由消费者自理) |
| className | `string` | — | — |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(next: T[]) => void` | 任一提交/删除/新增后回传完整新数据 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| summary | `(data: T[]) => ReactNode` | 渲染函数——合计页脚：返回 tfoot 内容，消费者自备 `<tr><td colSpan=…>` 控制跨列对齐 |

`EditableColumn<T>`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| key* | `keyof T & string` | — | 数据键 |
| title* | `ReactNode` | — | 列标题 |
| editable | `boolean` | `false` | 是否可编辑(false=只读列，编辑态也展示原值) |
| render | `(value, row) => ReactNode` | — | 展示态渲染(默认直接渲染该键的值) |
| editor | `(value, onChange, row) => ReactNode` | — | 编辑态编辑器(默认文本 Input)，`onChange` 写回草稿对应键 |
| width | `number` | — | 列宽(px) |
| align | `"left" \| "center" \| "right"` | `"left"` | 单元格对齐 |

## 示例
```tsx
const [data, setData] = useState(rows);
const columns: EditableColumn<Row>[] = [
  { key: "name", title: "姓名", editable: true, width: 160 },
  { key: "salary", title: "月薪", editable: true, align: "right",
    render: (v) => `¥${Number(v).toLocaleString()}`,
    editor: (v, onChange) => (
      <input type="number" value={v as number}
        onChange={(e) => onChange(Number(e.target.value))} />
    ) },
];

<EditableTable<Row>
  columns={columns}
  data={data}
  rowKey={(r) => String(r.id)}
  onChange={setData}
  addable
  deletable
  newRow={() => ({ id: Date.now(), name: "", salary: 0 })}
/>
```

## 禁忌 / 坑

- 数据源**受控**：必须把 `onChange` 回传的 `next` 写回 state，否则保存/增删后界面不更新。
- `validateRow` 只负责"阻断保存"，不渲染错误提示——行内报错文案要消费者自己在 `editor` 里处理。
- `summary` 不自动管对齐：内容是 raw tfoot，跨列对齐(`colSpan`/列宽)由消费者自己掌控。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [List](../list/list.md)
