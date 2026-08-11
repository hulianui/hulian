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
| values | `Record<string, unknown>` | — | 受控值；缺省走内部 state |
| columns | `number` | `3` | 桌面列数 |
| gap | `number` | `4` | 行列间距（× 0.25rem） |
| collapsible | `boolean` | `true` | 字段填不满一行时自动失效 |
| defaultCollapsed | `boolean` | `true` | 初始折叠 |
| loading | `boolean` | `false` | 查询按钮 loading 态 |
| className | `string` | — | 根节点类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSearch* | `(values: Record<string, unknown>) => void` | 查询 / 回车提交 |
| onChange | `(values: Record<string, unknown>) => void` | 任一字段编辑触发（受控回填） |
| onReset | `(values: Record<string, unknown>) => void` | 重置（values = 各字段 default 后的值） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| submitText | `ReactNode` | 主按钮文案（默认 `"查询"`） |
| resetText | `ReactNode` | 重置按钮文案（默认 `"重置"`） |

`SearchField` 是判别联合（按 `type`/`render` 区分，缺省即 `input`）。公共字段：`name*`（值 key）、`label*`、`placeholder?`、`colSpan?`（默认 1，封顶 columns）、`defaultValue?`。各形态：
- `type?: "input"` + `inputType?: string`
- `type: "number"` + `min?` / `max?` / `step?`（透传原生 input）
- `type: "number-range"` + 同上三项（值是二元组）
- `type: "select"` + `options: { value: string; label: ReactNode }[]`
- `type: "multi-select"` + `options`（值是 `string[]`）
- `type: "remote-select"` + `fetcher`（签名同 RemoteSelect）+ `resolveValue?` + `multiple?`
- `type: "cascader"` + `options: TreeNode[]`（即 Cascader 的 `nodes`）+ `changeOnSelect?` / `showSearch?`（值是路径数组）
- `type: "region"` + `level?: 2 | 3` + `changeOnSelect?` / `showSearch?`（省市区数据内置，不用喂 options；值是 code 路径数组）
- `type: "date"` / `type: "date-range"`
- `type: "datetime"` / `type: "datetime-range"`（原生 `datetime-local`）

**值形状按类型定**：`*-range` 恒为二元组 `[start, end]`（未填的那端是 `""`）；
`multi-select` 与 `remote-select multiple` 是 `string[]`；其余是 `string`。
重置后各自回到 `defaultValue` 或上述空形状 —— 别假设「重置 = 全变空串」。
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
- **operator（`LIKE` / `BETWEEN` / `=` 之类）不属于本组件**。那是后端查询契约，
  由你在 `onSearch` 里把 values 翻译成自家请求形状。把 operator 塞进字段配置会让一个通用组件
  编码某一家后端的协议，换个后端就得改库。
- `datetime` / `datetime-range` 用的是原生 `datetime-local`，**值是不带时区的本地时间串**
  （`"2026-07-29T14:30"`）。别对它调 `new Date(...).toISOString()` —— 东八区会直接少 8 小时，
  且不报错只写坏数据。要 ISO 请在 `onSearch` 里显式按本地时刻拼。
- `cascader` / `region` 的值是**路径数组**（根 → 叶），未选时是 `[]` 而不是 `""`。后端只认末级 id 时在 `onSearch` 里取 `path.at(-1)`；要中间层级也能提交请开 `changeOnSelect`。
- `region` 的内置区划表约 137KB，因此那一档是**按需加载**的：只有配了 `type: "region"` 的页面才会拉那个 chunk。它到达前控件位置是一块等高占位，不会让整片查询区跳一下。
- `region` 只回传 **code 路径**（`["11","1101","110101"]`）。后端要的是名称路径时用 `render` 逃生舱自己接 [RegionCascader](../region-cascader/region-cascader.md)，它的 `onChange` 第二参就是名称路径。
- `remote-select` 的受控回调在 RemoteSelect 那边叫 `onChange`（第二参给完整选项），
  本组件只取第一参喂回 values；需要拿到原始行请改用 `render` 逃生舱自己接。

## 相关
[Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md)
