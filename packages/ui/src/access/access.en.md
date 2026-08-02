---
slug: access
name: Access
category: uncatalogued
group:
tags: []
exports: [Access]
status: enriched
---

# Access

> Declarative permission access control: render children if you have permission, otherwise render fallback (hidden by default). · uncatalogued

## When to Use

Wrap buttons, menu items, or sections whose visibility depends on the current user's permissions. This keeps scattered checks such as `hasPermission && <X />` out of business markup. An ancestor `AccessProvider` must supply the permission set. For imperative checks inside an `if` statement or effect, use the `useAccess()` hook instead.

## Import
```ts
import { Access } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| permission | `string \| string[]` | — | Required permission or permissions; mutually exclusive with `accessible`, which takes precedence |
| mode | `"all" \| "any"` | `"all"` | Matching mode for an array: require every permission with `all`, or at least one with `any`; ignored for a single string |
| accessible | `boolean \| ((access: AccessContextValue) => boolean)` | — | Custom access decision; takes precedence over `permission` |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Content rendered when access is granted |
| fallback | `ReactNode` | Content rendered when access is denied; defaults to `null`, so denied content is hidden |

> Place `<AccessProvider permissions={...}>` above this component to supply a `string[]` or `Set` of permissions. A user with the `"*"` wildcard is treated as an administrator and passes every check.

## Examples
```tsx
// Supply the permission set near the application root after sign-in.
<AccessProvider permissions={["user:read", "user:delete"]}>
  <App />
</AccessProvider>

// Gate business actions.
<Access permission="user:delete" fallback={<Tooltip>No permission</Tooltip>}>
  <Button tone="danger">Delete</Button>
</Access>

// Grant access when any listed permission is present.
<Access permission={["order:export", "order:admin"]} mode="any">
  <Button>Export</Button>
</Access>
```

## Usage Guidelines

- Evaluation order is `accessible > permission > unrestricted`. With neither `accessible` nor `permission`, access is **always granted**; omitting `permission` does not deny access.
- Use the component inside an `AccessProvider` subtree so `useAccess()` can read the permission set.
- Client-side gating is a UX safeguard, not a security boundary. Authorize every backend request independently; hidden UI is not authorization.

## Related
—
