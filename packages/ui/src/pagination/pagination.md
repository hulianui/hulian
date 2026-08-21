---
slug: pagination
name: Pagination
category: navigation
group: inpage
tags: []
exports: [Pagination, getPaginationRange]
status: enriched
---

# Pagination

> 在分好页的数据间跳转，页码过多时折叠成省略号 · navigation/inpage

## 何时用

列表/表格分页切换，已知总页数、点页码或上下页跳转。表达层级位置用 [Breadcrumb](../breadcrumb/breadcrumb.md)；同层内容互斥切换用 [Tabs](../tabs/tabs.md)。需要纯算法拿可见页码序列（自己渲染）可单独用导出的 `getPaginationRange`。

## 导入
```ts
import { Pagination, getPaginationRange } from "@hulianui/ui"
```

## Props

分页器**受控 only**：必须由外部 state 持有 `page` 并在 `onPageChange` 里 setState。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| page* | `number` | - | 当前页（1 起），受控 |
| total | `number` | - | **总页数**（不是总条数）。与 `totalItems` 二选一，同传时以本项为准 |
| totalItems | `number` | - | **总条数**（后端 `data.total` 的常见语义），与 `pageSize` 一起换算页数 |
| pageSize | `number` | `10` | 每页条数，仅在给了 `totalItems` 时参与算页数 |
| siblingCount | `number` | `1` | 当前页左右各显示的页码数 |
| showFirstLast | `boolean` | `false` | 是否显示「跳首页/末页」按钮 |
| showTotal | `boolean ｜ (totalItems, [from, to]) => ReactNode` | `false` | 左侧总数文案（默认「共 N 条」）。**依赖 `totalItems`**，只给 `total` 时静默不渲染 |
| showQuickJumper | `boolean` | `false` | 右侧「跳至 __ 页」输入框（回车/失焦提交，自动夹紧到合法范围） |
| pageSizeOptions | `number[]` | - | 每页条数候选档（对标 el-pagination 的 `page-sizes`）。**与 `onPageSizeChange` 同传才渲染切换器**，只给一个静默不渲染 |
| disabled | `boolean` | `false` | 禁用整个分页器 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onPageChange* | `(page: number) => void` | 页码变更回调（点击页码/上下页/首末页时触发，已夹紧到 `[1, total]`） |
| onPageSizeChange | `(pageSize: number) => void` | 每页条数变更回调。组件不自持 `pageSize`，但**页码归位由组件负责**：给了 `totalItems` 时若当前页超出新页数，会再补发一次 `onPageChange`（夹到新末页，不是回第 1 页） |

## 示例
```tsx
function Demo() {
  const [page, setPage] = useState(1);
  return <Pagination page={page} total={20} onPageChange={setPage} />;
}
```

带首末页跳转 + 更宽窗口：
```tsx
<Pagination page={page} total={20} onPageChange={setPage} siblingCount={2} showFirstLast />
```

带「每页条数」切换（运营常见的「先 100/页 粗扫再筛」）：
```tsx
function Demo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  return (
    <Pagination
      page={page}
      totalItems={5151}
      pageSize={pageSize}
      onPageChange={setPage}
      pageSizeOptions={[20, 50, 100]}
      onPageSizeChange={setPageSize}
      showTotal
    />
  );
}
```

接后端分页信封（后端给的是总条数，不是页数）：
```tsx
// res.data = { list, total: 128 }
<Pagination
  page={page}
  totalItems={res.data.total}
  pageSize={20}
  onPageChange={setPage}
  showTotal
  showQuickJumper
/>
```

## 禁忌 / 坑

- [[pagination-range-single-gap-fill-not-ellipsis]]：页码序列由 `getPaginationRange` 生成 —— 当两个展示页之间**只隐藏了 1 页**时直接补出那个页码，而不是显示「…」（省略号仅在 gap > 1 时出现），避免出现 `1 … 3` 这种只藏一页还占省略号的丑态。模型同 MUI usePagination。
- 组件不持有内部页码态，忘了在 `onPageChange` 里更新 `page` 会点不动。
- **`total` 是总页数，与几乎所有后端回的 `total`（总条数）语义相反。** 接后端数据请走 `totalItems` + `pageSize`，别在调用处自己 `Math.ceil` —— 两处各算一遍最容易在边界（0 条 / 整除）上分叉。两个 prop 同传会在 dev 下告警并以 `total` 为准。
- `total` 的语义修正留到 1.0 主版本一次性做，届时两个 prop 会合并为一个。新代码优先写 `totalItems`。
- `showTotal` 依赖 `totalItems` —— 只给了 `total`（页数）时算不出条数，本项静默不渲染而非报错。
- 切换每页条数时**一次动作可能触发两个回调**：先 `onPageSizeChange(新页长)`，当前页越界时再 `onPageChange(新末页)`。两个 setState 照常写即可，React 会批到同一次渲染。只给了 `total`（总页数）时算不出新页数，组件不补发 `onPageChange`，页码归位由你自己处理。
- `pageSizeOptions` 与 `onPageSizeChange` 缺一即不渲染切换器：只给档等于「切了没人收」，只给回调则无从切起——静默不渲染而非报错，与 `showTotal` 同一口径。
- 切换器用的是库内 [Select](../select/select.md)。它是 [ProTable](../pro-table/pro-table.md) 底栏那个切换器的同一份实现，两处外观、文案、无障碍名一致。

## 相关
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../stepper/stepper.md)
