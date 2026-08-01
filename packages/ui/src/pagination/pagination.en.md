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

> Pagination · Controlled presentation with an ellipsis-aware page-range algorithm · navigation/inpage

## When to use

Use Pagination to move through a list or table when the total page count is known. Use [Breadcrumb](../breadcrumb/breadcrumb.md) to communicate hierarchy or [Tabs](../tabs/tabs.md) to switch peer content. Import `getPaginationRange` separately when you need the visible page-number sequence but want to render your own controls.

## Import
```ts
import { Pagination, getPaginationRange } from "@hulianui/ui"
```

## Props

Pagination is controlled only: store `page` externally and update it from `onPageChange`.

| Name | Type | Default | Description |
|------|------|------|------|
| page* | `number` | — | Controlled current page, starting at 1. |
| total | `number` | — | **Total number of pages**, not items. Mutually exclusive with `totalItems`; this prop wins when both are supplied. |
| totalItems | `number` | — | **Total number of items**, matching the common `data.total` API meaning. Used with `pageSize` to derive pages. |
| pageSize | `number` | `10` | Items per page; used only with `totalItems`. |
| siblingCount | `number` | `1` | Visible page numbers on each side of the current page. |
| showFirstLast | `boolean` | `false` | Whether to show first-page and last-page buttons. |
| showTotal | `boolean ｜ (totalItems, [from, to]) => ReactNode` | `false` | Total-items summary on the left. The built-in Chinese format means “N items total.” Requires `totalItems` and silently renders nothing when only `total` is provided. |
| showQuickJumper | `boolean` | `false` | Whether to show the page-jump input. Enter and blur submit, clamped to the valid range. |
| disabled | `boolean` | `false` | Whether all pagination controls are disabled. |

## Events

| Event | Type | Description |
|------|------|------|
| onPageChange* | `(page: number) => void` | Called by page, previous/next, and first/last controls with a value clamped to `[1, total]`. |

## Example
```tsx
function Demo() {
  const [page, setPage] = useState(1);
  return <Pagination page={page} total={20} onPageChange={setPage} />;
}
```

With first/last controls and a wider page window:
```tsx
<Pagination page={page} total={20} onPageChange={setPage} siblingCount={2} showFirstLast />
```

With an API envelope whose `total` is an item count:
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

## Usage guidelines

- [[pagination-range-single-gap-fill-not-ellipsis]]: `getPaginationRange` inserts the missing page number when a gap hides exactly one page. It uses an ellipsis only when the gap is greater than one, avoiding awkward output such as `1 … 3`. This follows MUI's `usePagination` model.
- The component has no internal page state. If `onPageChange` does not update `page`, the controls appear unresponsive.
- **`total` means pages, unlike the item count commonly named `total` by APIs.** Prefer `totalItems` with `pageSize` for API data instead of duplicating `Math.ceil` at call sites. Passing both props warns in development and uses `total`.
- The `total` semantics are reserved for a breaking correction in 1.0, when the two props can be consolidated. Prefer `totalItems` in new code.
- `showTotal` requires `totalItems`; page count alone cannot produce an item count, so the summary is omitted rather than throwing.
- Built-in button and jumper labels are Chinese copy: `"\u8df3\u5230\u9996\u9875"` (“Go to first page”), `"\u4e0a\u4e00\u9875"` (“Previous page”), `"\u4e0b\u4e00\u9875"` (“Next page”), `"\u8df3\u5230\u672b\u9875"` (“Go to last page”), and `"\u8df3\u81f3\u7b2c\u51e0\u9875"` (“Page to jump to”). Supply a custom `showTotal` renderer when the built-in Chinese `"\u5171 N \u6761"` format is not appropriate.

## Related
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../stepper/stepper.md)
