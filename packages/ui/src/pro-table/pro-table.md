---
slug: pro-table
name: ProTable
category: data-display
group: collection
tags: []
exports: [ProTable]
status: enriched
---

# ProTable

> 高级表格 · 列表页编排层(复用 Table/SearchForm/Pagination) · 查询区 + 工具栏(密度/列设置/刷新/全屏) + 行选择 + 集成分页(企业中后台列表页旗舰) · data-display/collection

## 何时用

企业中后台「一整个列表页」的旗舰组件：顶部查询区（SearchForm）+ 工具栏（密度/列设置/刷新/全屏）+ 主表（Table）+ 底部分页一套打包。只要列表 + 服务端分页/排序/筛选，优先用它。区别于 [Table](../table/table.md)：Table 是裸表皮，要自己拼查询区、工具栏、分页、请求生命周期；ProTable 的「托管模式」（传 `request`）连这些都自管。

## 导入
```ts
import { ProTable } from "@hulianui/ui"
```

## Props

继承 `Omit<TableProps<TData>, "data">`（即 Table 的 columns/enableSorting/enableRowSelection/density/getRowId/rowClassName… 全可用），并新增：

> **大数据列表记得开 `virtual`。** 它继承自 Table，透传下去即生效，但因为没有出现在下面这张表里，
> 很容易被当成 ProTable 不支持而把上万行直接铺进 DOM：
>
> ```tsx
> <ProTable columns={columns} request={fetchRows} virtual={{ enabled: true, height: 480 }} />
> ```
>
> 参数与禁忌见 [Table 的 `virtual`](../table/table.md)（需装 `@tanstack/react-virtual`；不建议与树形/明细面板、行拖拽同开）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| data | `TData[]` | — | 展示模式必传；托管模式由 request 提供，忽略此项 |
| request | `(params: ProTableRequestParams) => Promise<ProTableRequestResult<TData>>` | — | 传则进「托管模式」：自管 page/pageSize/sort/filters/loading/data/选择，忽略 data/pagination/loading。内部以 ref 持有，**不进请求依赖**（内联箭头函数也不会死循环） |
| params | `Record<string, unknown>` | — | 托管模式固定查询参数；**浅比较**，内容变化才回第 1 页重查。以 `params` 字段单独传给 request，不混入 filters |
| paginationMode | `"page" \| "cursor"` | `"page"` | 托管分页协议：page=返回 `{data,total}` 数字分页；cursor=入参带 cursor、返回 `{data,nextCursor,hasMore}` 上下页 |
| defaultPageSize | `number` | `10` | 托管模式初始每页条数 |
| defaultSorting | `SortingState` | `[]` | 托管模式初始排序（非受控默认值，仅首次挂载生效）；首次 request 即带上，用来表达「默认按某列倒序」 |
| pageSizeOptions | `number[]` | — | 提供则渲染「每页条数」切换器（如 [10,20,50,100]） |
| pagination | `ProTablePagination` | — | 展示模式集成分页（底部）；`{page,pageSize,total,onPageChange,showFirstLast?,onPageSizeChange?}` |
| search | `Omit<SearchFormProps,"onSearch"> & { onSearch? }` | — | 集成查询区（复用 SearchForm）；托管模式下 onSearch 可省 |
| toolbar | `boolean \| ProTableToolbarFeatures` | `true` | true=全开 / false=不渲染 / 对象逐项开关（reload/density/columnSetting/fullscreen） |
| loading | `boolean` | — | 加载态：刷新图标旋转 |
| actionRef | `Ref<ProTableActions>` | — | 命令式句柄：`reload()` 重新请求 / `clearSelection()` 清选 |
| rootClassName | `string` | — | 外层容器类名（区别透传 Table 的 className） |

## Events

继承的 Table 事件（onSortingChange / onRowSelectionChange / onExpandedChange / onColumnFiltersChange）随 `Omit<TableProps,"data">` 一并可用。ProTable 自有：

| 事件 | 类型 | 说明 |
|------|------|------|
| onReload | `() => void` | 点工具栏刷新图标触发 |
| onRequestError | `(error: unknown) => void` | 托管 request 失败回调（默认 `console.error`）；失败时 loading 复位、保留上次数据 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 卡片标题（工具栏左侧） |
| toolbarActions | `ReactNode` | 工具栏右侧自定义操作（新增按钮等），位于内置图标按钮左侧 |
| batchActions | `(ctx: ProTableBatchCtx) => ReactNode` | 渲染函数；选中行时渲染批量操作区（需 enableRowSelection） |

## 示例
```tsx
// 展示模式：自己管数据 + 受控分页
<ProTable
  title="员工列表"
  columns={columns}
  data={pageData}
  enableRowSelection
  onReload={reload}
  toolbarActions={<Button size="sm">+ 新增</Button>}
  search={{ fields, onSearch, onReset }}
  pagination={{ page, pageSize, total, onPageChange: setPage }}
/>

// 托管模式：传 request，分页/排序/筛选/loading 全自管
<ProTable<Row>
  title="员工列表"
  columns={columns}
  request={async ({ page, pageSize, sort, filters }) => {
    const { rows, total } = await api.list({ page, pageSize, sort, filters });
    return { data: rows, total };
  }}
  getRowId={(r) => String(r.id)}
  search={{ fields: searchFields }}
  pageSizeOptions={[10, 20, 50]}
/>

// 托管模式：默认排序 + 固定查询参数
// request 内联不用 useCallback；params 内联对象字面量不用 useMemo（浅比较）
<ProTable<Row>
  title="排序权重"
  columns={columns}
  defaultSorting={[{ id: "weight", desc: true }]}
  params={{ categoryId }}
  request={async ({ page, pageSize, sort, filters, params }) => {
    const { rows, total } = await api.list({ page, pageSize, sort, ...filters, ...params });
    return { data: rows, total };
  }}
  getRowId={(r) => String(r.id)}
/>
```

## 禁忌 / 坑

- **`columns` 必须 memo**（与 [Table](../table/table.md) 同源）：cell 函数经 TanStack 的 `flexRender` 被当作**组件类型**渲染，identity 一变整格卸载重挂。格子里有输入框时直接坏功能 —— 受控输入框每敲一个字失焦 + 光标跳末尾，挂了 `onBlur` 提交的还会被重挂时的 blur 触发误提交。`useMemo` 的依赖里不要放逐键变化的输入值（那等于没 memo），行内编辑优先让输入框非受控。

- 托管模式（传 `request`）下 `data`/`pagination`/`loading` 三个 prop 被忽略——别两种模式混用。cursor 分页无 total/不能随机跳页，且 filters/sort/pageSize 任一变化会自动重置回第 1 页。
- 托管模式必须给 `getRowId`，否则行选择/批量在翻页后 key 不稳。
- `request` reject 默认走 `console.error` 兜底（保证不 unhandled），生产里接 `onRequestError` 弹 toast / 上报。
- `batchActions` 需配合 `enableRowSelection` 且有选中行才显示警示条。
- **`request` 走 ref 持有，不进请求依赖**：内联写 `request={async (p) => …}` 不会因函数身份每次 render 变化而无限请求（组件层防呆，不需要消费者 `useCallback`）。代价是**换一个 request 函数本身不会触发重查**——要换数据源请改 `params`，或调 `actionRef.reload()`。
- **`defaultSorting` 是非受控默认值**：只在首次挂载读一次，之后由用户点表头接管，后续改这个 prop 不会回灌（同 `defaultValue` 家族）。想在运行中强制改排序请用 `key` 重挂或改用受控 `sorting`。展示模式下它不生效（展示模式的默认排序直接传 `sorting`）。首点方向由 TanStack 按列类型决定（数值列默认 desc 优先），要精确控制请写 `defaultSorting` 而非依赖点击。
- **`params` 是浅比较（只比第一层）**：`params={{ scopeId }}` 这种内联对象字面量安全，不用 `useMemo`；但 `params={{ filter: { a: 1 } }}` 这种嵌套对象每次 render 都是新引用 → 每次都重查，嵌套值请自己保持引用稳定或拍平成一层。
- `params` **不会并入 `filters`**：`filters` 只装查询区提交的值，`params` 单独一个字段。这样固定条件不会被同名 filter 覆盖、也不受查询区「重置」影响；request 里自己合并 `{ ...p.filters, ...p.params }`。
- `params` 内容变化会强制回到第 1 页（cursor 模式同时重置游标栈）——旧页码/旧游标在新固定条件下已无意义。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md) · [List](../list/list.md)
