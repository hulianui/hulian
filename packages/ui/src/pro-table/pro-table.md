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

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| data | `TData[]` | — | 展示模式必传；托管模式由 request 提供，忽略此项 |
| request | `(params: ProTableRequestParams) => Promise<ProTableRequestResult<TData>>` | — | 传则进「托管模式」：自管 page/pageSize/sort/filters/loading/data/选择，忽略 data/pagination/loading |
| paginationMode | `"page" \| "cursor"` | `"page"` | 托管分页协议：page=返回 `{data,total}` 数字分页；cursor=入参带 cursor、返回 `{data,nextCursor,hasMore}` 上下页 |
| onRequestError | `(error: unknown) => void` | `console.error` | 托管 request 失败回调；失败时 loading 复位、保留上次数据 |
| defaultPageSize | `number` | `10` | 托管模式初始每页条数 |
| pageSizeOptions | `number[]` | — | 提供则渲染「每页条数」切换器（如 [10,20,50,100]） |
| pagination | `ProTablePagination` | — | 展示模式集成分页（底部）；`{page,pageSize,total,onPageChange,showFirstLast?,onPageSizeChange?}` |
| search | `Omit<SearchFormProps,"onSearch"> & { onSearch? }` | — | 集成查询区（复用 SearchForm）；托管模式下 onSearch 可省 |
| toolbar | `boolean \| ProTableToolbarFeatures` | `true` | true=全开 / false=不渲染 / 对象逐项开关（reload/density/columnSetting/fullscreen） |
| toolbarActions | `ReactNode` | — | 工具栏右侧自定义操作（新增按钮等），位于内置图标按钮左侧 |
| title | `ReactNode` | — | 卡片标题（工具栏左侧） |
| onReload | `() => void` | — | 点工具栏刷新图标触发 |
| loading | `boolean` | — | 加载态：刷新图标旋转 |
| batchActions | `(ctx: ProTableBatchCtx) => ReactNode` | — | 选中行时渲染批量操作区（需 enableRowSelection） |
| actionRef | `Ref<ProTableActions>` | — | 命令式句柄：`reload()` 重新请求 / `clearSelection()` 清选 |
| rootClassName | `string` | — | 外层容器类名（区别透传 Table 的 className） |

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
```

## 禁忌 / 坑

- 托管模式（传 `request`）下 `data`/`pagination`/`loading` 三个 prop 被忽略——别两种模式混用。cursor 分页无 total/不能随机跳页，且 filters/sort/pageSize 任一变化会自动重置回第 1 页。
- 托管模式必须给 `getRowId`，否则行选择/批量在翻页后 key 不稳。
- `request` reject 默认走 `console.error` 兜底（保证不 unhandled），生产里接 `onRequestError` 弹 toast / 上报。
- `batchActions` 需配合 `enableRowSelection` 且有选中行才显示警示条。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md) · [List](../list/list.md)
