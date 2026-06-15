---
slug: search-form
name: SearchForm
category: forms
group: framework
tags: []
exports: [SearchForm, planLayout, canCollapse, totalSpan]
status: enriched
---

# SearchForm

> 查询筛选表单 · 中后台列表页顶部条件区 · fields 配置 + 固定列栅格 + 一行折叠 + 查询/重置(dogfood Grid/Field/Input/Select/Button·零依赖) · forms/framework

## 何时用

中后台列表页顶部的条件筛选区——用 `fields` 配置数组声明若干查询项，组件按固定列栅格排布、字段多时一行折叠、自带「查询/重置」。区别于 [Form](../form/form.md)/[ProForm](../pro-form/pro-form.md)（录入提交业务数据）：SearchForm 专做「筛选参数 → onSearch」。通常不单独用，而是作为 [ProTable](../pro-table/pro-table.md) 的 `search` 区集成进列表页。

## 导入
```ts
import { SearchForm, planLayout, canCollapse, totalSpan } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| fields* | `SearchField[]` | — | 字段配置数组 |
| onSearch* | `(values: Record<string, unknown>) => void` | — | 查询 / 回车提交 |
| values | `Record<string, unknown>` | — | 受控值；缺省走内部 state |
| onChange | `(values: Record<string, unknown>) => void` | — | 任一字段编辑触发（受控回填） |
| onReset | `(values: Record<string, unknown>) => void` | — | 重置（values = 各字段 default 后的值） |
| columns | `number` | `3` | 桌面列数 |
| gap | `number` | `4` | 行列间距（× 0.25rem） |
| collapsible | `boolean` | `true` | 字段填不满一行时自动失效 |
| defaultCollapsed | `boolean` | `true` | 初始折叠 |
| submitText | `ReactNode` | `"查询"` | 主按钮文案 |
| resetText | `ReactNode` | `"重置"` | 重置按钮文案 |
| loading | `boolean` | `false` | 查询按钮 loading 态 |
| className | `string` | — | 根节点类名 |

`SearchField` 是判别联合（按 `type`/`render` 区分，缺省即 `input`）。公共字段：`name*`（值 key）、`label*`、`placeholder?`、`colSpan?`（默认 1，封顶 columns）、`defaultValue?`。各形态：
- `type?: "input"` + `inputType?: string`
- `type: "select"` + `options: { value: string; label: ReactNode }[]`
- `type: "date"` / `type: "date-range"`
- `render: (ctx: { name; value; onChange }) => ReactNode`（逃生舱，自渲染控件）

## 示例
```tsx
const fields: SearchField[] = [
  { name: "keyword", label: "关键词", placeholder: "订单号 / 客户名" },
  { name: "status", label: "状态", type: "select", placeholder: "全部",
    options: [
      { value: "pending", label: "待处理" },
      { value: "done", label: "已完成" },
    ] },
  { name: "range", label: "创建时间", type: "date-range", colSpan: 2 },
];

<SearchForm
  fields={fields}
  values={values}
  onChange={setValues}
  onSearch={(v) => fetchList(v)}
  onReset={() => fetchList({})}
/>
```

## 禁忌 / 坑

- 受控用法（传 `values`）必须同时接 `onChange` 回填，否则字段无法编辑。
- `collapsible` 只在字段总跨度超过一行时才真正出现「展开/收起」；少字段时自动失效，不用手动关。
- `onReset` 回调收到的 values 是「各字段 default 后的值」而非空对象——重置后重新查询应用它而不是 `{}`，以保留默认筛选。

## 相关
[Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md)
