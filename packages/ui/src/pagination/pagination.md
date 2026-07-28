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

> 分页器 · 纯皮肤受控 + 页码区间算法(省略号) · navigation/inpage

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
| page* | `number` | — | 当前页（1 起），受控 |
| total | `number` | — | **总页数**（不是总条数）。与 `totalItems` 二选一，同传时以本项为准 |
| totalItems | `number` | — | **总条数**（后端 `data.total` 的常见语义），与 `pageSize` 一起换算页数 |
| pageSize | `number` | `10` | 每页条数，仅在给了 `totalItems` 时参与算页数 |
| siblingCount | `number` | `1` | 当前页左右各显示的页码数 |
| showFirstLast | `boolean` | `false` | 是否显示「跳首页/末页」按钮 |
| showTotal | `boolean ｜ (totalItems, [from, to]) => ReactNode` | `false` | 左侧总数文案（默认「共 N 条」）。**依赖 `totalItems`**，只给 `total` 时静默不渲染 |
| showQuickJumper | `boolean` | `false` | 右侧「跳至 __ 页」输入框（回车/失焦提交，自动夹紧到合法范围） |
| disabled | `boolean` | `false` | 禁用整个分页器 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onPageChange* | `(page: number) => void` | 页码变更回调（点击页码/上下页/首末页时触发，已夹紧到 `[1, total]`） |

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

## 相关
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../_mui/stepper.md)
