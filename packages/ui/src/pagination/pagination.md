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
| total* | `number` | — | 总页数 |
| onPageChange* | `(page: number) => void` | — | 页码变更回调，已夹紧到 `[1, total]` |
| siblingCount | `number` | `1` | 当前页左右各显示的页码数 |
| showFirstLast | `boolean` | `false` | 是否显示「跳首页/末页」按钮 |
| disabled | `boolean` | `false` | 禁用整个分页器 |

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

## 禁忌 / 坑

- [[pagination-range-single-gap-fill-not-ellipsis]]：页码序列由 `getPaginationRange` 生成 —— 当两个展示页之间**只隐藏了 1 页**时直接补出那个页码，而不是显示「…」（省略号仅在 gap > 1 时出现），避免出现 `1 … 3` 这种只藏一页还占省略号的丑态。模型同 MUI usePagination。
- 组件不持有内部页码态，忘了在 `onPageChange` 里更新 `page` 会点不动。

## 相关
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../_mui/stepper.md)
