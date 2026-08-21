---
slug: remote-select
name: RemoteSelect
category: forms
group: advanced
tags: []
exports: [RemoteSelect]
status: enriched
---

# RemoteSelect

> 从远端接口搜索选项，带防抖、分页和初值回显 · forms/advanced

## 何时用

选项来自**后端接口**、数据量大到不可能一次性拉全（门店、会员、商品、员工…）时用：输入防抖搜索、滚动加载下一页、编辑表单打开即回显已选项的中文名。

选项固定且已在前端就用 [Select](../select/select.md)；选项在前端数组里只是需要搜索用 [Combobox](../combobox/combobox.md)（本组件即基于它，只是把过滤权从本地交给了服务端）；国家/地区这类内置数据用 [CountrySelect](../country-select/country-select.md)。

## 导入
```ts
import { RemoteSelect } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| fetcher * | `(query, { page, pageSize, signal }) => Promise<{ options, total? }>` | - | 远程搜索数据源。`options` 是后端原始行数组；`total` 给了就用它判断还有没有下一页 |
| resolveValue | `(values: string[]) => Promise<Row[]>` | - | 初值回显解析器：按 value 批量解 label。**编辑表单必配**，见下方「禁忌 / 坑」 |
| labelKey | `string` | `"name"` | 从原始行取显示文案的字段名 |
| valueKey | `string` | `"id"` | 从原始行取值的字段名 |
| debounce | `number` | `300` | 输入防抖毫秒数 |
| pageSize | `number` | `10` | 每页条数，透传给 `fetcher` |
| multiple | `boolean` | `false` | 多选（chips 形态）。开启后 `value`/`onChange` 变数组 |
| value | `string｜number｜null`（多选为数组） | - | 受控值。数组顺序即 chip 渲染顺序 |
| defaultValue | 同上 | - | 非受控初值 |
| placeholder | `string` | `"请选择"` | 字段占位 |
| emptyMessage | `ReactNode` | `"无匹配数据"` | 空态文案 |
| loadingMessage | `ReactNode` | `"加载中…"` | 加载态文案 |
| size | `"sm"｜"md"｜"lg"` | `"md"` | 尺寸 |
| clearable | `boolean` | `true` | 单选时渲染清除按钮（多选靠 chip 上的 × 逐个删） |
| disabled | `boolean` | `false` | 禁用 |
| invalid | `boolean` | `false` | 独立使用（非 Field 内）时手动置无效态皮肤 |
| defaultOpen | `boolean` | `false` | 非受控初始展开（调试 / 文档演示用） |
| renderOption | `(option) => ReactNode` | - | 自定义选项行（`option.raw` 是后端原始行） |
| virtualized | `boolean` | 已累积候选 ≥ 100 时为 `true` | 列表虚拟化。配 `renderOption` 渲染多行选项时要显式关掉，见「禁忌 / 坑」 |
| className | `string` | - | 字段（输入框 / chips 外壳）类名 |
| popupClassName | `string` | - | 浮层类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | 单选 `(value: string｜null, option: Option｜null) => void`<br>多选 `(value: string[], options: Option[]) => void` | 选中变化。第二参给出完整选项（含 `raw` 原始行），与 value 同序 |

## 示例

基础用法（防抖搜索 + 滚动分页）：
```tsx
<RemoteSelect
  valueKey="store_id"
  labelKey="store_name"
  placeholder="搜索门店…"
  fetcher={async (query, { page, pageSize, signal }) => {
    const res = await fetch(`/api/stores?q=${query}&page=${page}&size=${pageSize}`, { signal })
    const json = await res.json()
    return { options: json.list, total: json.total }
  }}
/>
```

编辑表单回显（value 不在首屏列表里）：
```tsx
<RemoteSelect
  valueKey="store_id"
  labelKey="store_name"
  value={form.storeId}
  onChange={(v) => setForm({ ...form, storeId: v })}
  fetcher={fetchStores}
  // 与 fetcher 分开的第二个端点：按 id 取详情，不参与搜索/分页
  resolveValue={async (ids) => (await api.storesByIds(ids)).list}
/>
```

多选：
```tsx
<RemoteSelect
  multiple
  valueKey="store_id"
  labelKey="store_name"
  value={form.storeIds}
  onChange={(ids) => setForm({ ...form, storeIds: ids })}
  fetcher={fetchStores}
  resolveValue={resolveStores}
/>
```

## 禁忌 / 坑

- **`resolveValue` 不是可选装饰，编辑表单必配**：打开编辑表单时 `value` 已有，但它常常不在首屏那一页里（在第 7 页、或被当前搜索词过滤掉）。只有 `resolveValue` 能把它的 label 解出来，缺了就只会显示裸 id。它与 `fetcher` 是**两个不同的后端语义**（一个按关键词分页搜，一个按主键批量取），别合并成一个函数。
- **`fetcher` 必须把 `signal` 透传给 fetch/axios**：不传也能跑（组件用请求序号丢弃过期响应），但旧请求会一直占着连接，快速输入时可能连开十几条。
- **多选 chip 只能按 `value` 顺序渲染**：底层 `ComboboxChipRemove` 按 chip 在容器内的渲染序绑定 `selectedValue[index]`，乱序渲染会**删错项**。组件内部已按 `value` 顺序渲染，自定义时别打乱。
- **候选攒到 100 条后列表会自动虚拟化**（远程分页一页页累积，翻够页数就会切过去）：只有视口内的选项在 DOM 里，行高按 32px 固定估算、不逐项测量。默认单行 label 恰好 32px，无感。**如果**你用 `renderOption` 渲染了多行/带头像的选项（高度 ≠ 32px），那么翻到第 10 页往后滚动落位会开始偏——**不报错、前几页也复现不出来**，这种用法请显式传 `virtualized={false}`。
- 本地不做二次过滤（底层 `filter={null}`）：搜索结果完全由服务端决定，`fetcher` 忽略 `query` 就等于没有搜索。
- 关闭浮层即结束一次搜索会话：关键词清空、下次打开重新拉第一页（与 el-select 的 remote 行为一致），因此不要在 `fetcher` 里做「同参数缓存穿透」以外的副作用。
- `total` 不给也能分页：此时按「本页返回条数 ≥ pageSize 即可能还有下一页」推断，最后会多打一次空请求；能给就给。
- 未在 Props 里列出的原生属性（`aria-*` / `data-*` / `id` / `title` …）落到**输入框**上（多选时是 chips 外壳里的那个 input），不是外层容器 —— 读屏念的、能聚焦的都是它。`<Field required>` 注入的 `aria-required` 也走这条路（#293），此前被封闭 props 吃掉，必填只剩视觉星号。

## 相关
[Combobox](../combobox/combobox.md) · [Select](../select/select.md) · [CountrySelect](../country-select/country-select.md) · [Cascader](../cascader/cascader.md) · [ProTable](../pro-table/pro-table.md)
