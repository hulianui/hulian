---
slug: empty
name: Empty
category: data-display
group: placeholder
tags: []
exports: [Empty]
status: enriched
---

# Empty

> An empty state with a built-in illustration, title, description, action area, a loading mode, and two sizes.

## When to use

Use Empty when a list, table, or search result has no content, explaining why and what to do next. Use [Watermark](../watermark/watermark.md) for sensitive-content overlays, or the built-in empty states in [Table](../table/table.md) and [ProTable](../pro-table/pro-table.md).

### Which component each list state needs

A list region normally has to express four states. They are not four wordings of one component — picking the wrong one makes screen readers announce the wrong thing:

| State | Use | Notes |
|-------|-----|-------|
| Loading | `<Empty loading />`, or [Skeleton](../skeleton/skeleton.md) | Use Skeleton when the shape of the list is known (rows and columns); it keeps the layout steadier. Use `Empty loading` when the shape is unknown or the region is small. **Do not** use Empty without `loading` as a loading placeholder: screen readers announce it as "no data". |
| Empty (there really is no data) | `<Empty title="No projects yet">Create…</Empty>` | Put the next action, such as "create one", in `children`. |
| No results after filtering or searching | `<Empty title="No matching results">Clear filters</Empty>` | Same component as the empty state, different copy and action: offer "clear filters" or "try another keyword", not "create". |
| Error | [Result](../result/result.md) with `status="error"` plus a retry action | An error is not an empty state. It has to explain what went wrong and offer a retry; Empty would disguise a failure as "there was never any data". |

## Import
```ts
import { Empty } from "@hulianui/ui"
```

## Props

Inherits all native `div` attributes except `title`, which is redefined as ReactNode.

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm" \| "md"` | `"md"` | Component size. |
| loading | `boolean` | `false` | Loading mode. The icon area becomes a spinner instead of the empty illustration and the container gets `aria-busy="true"`; the spinner carries its own `role="status"` and localized aria-label. With `icon={null}` the icon area stays hidden. |

## Slots

| Slot | Type | Description |
|------|------|------|
| icon | `ReactNode` | Custom illustration; defaults to an empty box, while `null` removes the icon area. |
| title | `ReactNode` | Primary heading. |
| description | `ReactNode` | Supporting explanation. |
| children | `ReactNode` | Actions rendered below the description. |

## Examples
```tsx
// Default
<Empty title="No data" description="This list does not contain any items yet" />

// With an action
<Empty title="No projects yet" description="Create your first project to get started">
  <Button size="sm">Create project</Button>
</Empty>

// Loading, with the copy left to the spinner's localized aria-label
<Empty loading />

// Loading with copy: the copy follows the state, do not keep the empty-state wording
<Empty loading title="Loading projects" description="The first visit takes a moment" />

// Three states in one region (errors go to Result)
{loading ? (
  <Empty loading title="Loading projects" />
) : items.length === 0 ? (
  <Empty title="No projects yet" description="Create your first project to get started">
    <Button size="sm">Create project</Button>
  </Empty>
) : (
  <ProjectList items={items} />
)}
```

## Pitfalls

- Avoid replacing an entire persistent region with `if (!data.length) return <Empty />`; that unmounts scroll containers, forms, and other stateful children. See [[conditional-empty-return-unmounts-persistent-children]].
- Do not reuse empty-state copy while loading. `loading` only takes over the icon area; `title`, `description`, and `children` keep rendering, so `<Empty loading={loading} title="No data" />` spins next to the words "No data". Let the copy follow the state.
- Do not leave a "create" or "retry" button visible while loading: the data has not arrived, so any decision made against it is blind. "Create" belongs to the empty state and "retry" belongs to the error state ([Result](../result/result.md)).

## Related
[Skeleton](../skeleton/skeleton.md) · [Spinner](../spinner/spinner.md) · [Result](../result/result.md) · [Watermark](../watermark/watermark.md) · [Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md)
