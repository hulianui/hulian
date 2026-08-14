---
slug: tabs
name: Tabs
category: navigation
group: inpage
tags: []
exports: [Tabs, TabsList, TabsTab, TabsPanel, tabsListVariants]
status: enriched
---

# Tabs

> Tabs · Non-overlay Base UI tabs with underline or solid sliding indicators · navigation/inpage

## When to use

Use Tabs to switch among peer content panels such as Account, Password, and Team within one region. Panels are mutually exclusive and have no hierarchy. Use [Breadcrumb](../breadcrumb/breadcrumb.md) to show a page's place in the site, [Anchor](../anchor/anchor.md) for a long-form table of contents that tracks reading progress, or [Stepper](../stepper/stepper.md) for an ordered workflow.

## Import
```ts
import { Tabs, TabsList, TabsTab, TabsPanel, tabsListVariants } from "@hulianui/ui"
```

## Props

`Tabs` forwards Base UI `Tabs.Root` props including `value`, `defaultValue`, `onValueChange`, and `orientation`, and is uncontrolled by default. Visual variants belong on `TabsList`.

### Tabs (root)
| Name | Type | Default | Description |
|------|------|------|------|
| value | `any` | — | Controlled active tab value. |
| defaultValue | `any` | — | Initially active tab when uncontrolled. |
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | Tab-list orientation. |

### TabsList
| Name | Type | Default | Description |
|------|------|------|------|
| variant | `"underline" \| "solid"` | `"underline"` | Underline slider or solid pill styling. |
| size | `"sm" \| "md"` | `"md"` | Size step, passed down to `TabsTab` so it never has to be repeated. `md` is page-level tab navigation; `sm` is for an inline switcher sitting on the same row as a heading or a search box. See Size. |
| className | `string` | — | Additional class name. |

`TabsTab` accepts required `value`, plus `disabled` and `className`; `TabsPanel` accepts `value` and `className`.

## Events

### Tabs (root)
| Event | Type | Description |
|------|------|------|
| onValueChange | `(value) => void` | Called when the active value changes; forwarded to Base UI `Tabs.Root`. |

## Example
```tsx
<Tabs defaultValue="account" className="w-80">
  <TabsList variant="underline">
    <TabsTab value="account">Account</TabsTab>
    <TabsTab value="password">Password</TabsTab>
    <TabsTab value="team" disabled>Team</TabsTab>
  </TabsList>
  <TabsPanel value="account">Manage your profile and preferences.</TabsPanel>
  <TabsPanel value="password">Change your sign-in password.</TabsPanel>
  <TabsPanel value="team">Invite members and assign roles.</TabsPanel>
</Tabs>
```

## Size

`md` (the default) is sized for **page-level tab navigation**. A tab bar is often not navigation though, but a switcher on the same row as a heading and a search box — and that row is already 28-32px tall, which `md` does not fit into:

| | Track (solid) | Tab |
|---|---|---|
| `md`, text only | 40 | 32 |
| `md`, text plus a count `Tag` | 44 | 36 |
| `sm`, text only | **28** | **24** |
| `sm`, text plus `Tag size="sm"` | 32 | 28 |

```tsx
// Inline switcher on the same row as a heading
<div className="flex items-center gap-2">
  <span className="text-sm font-semibold">Reports by title group</span>
  <Tabs defaultValue="a">
    <TabsList variant="solid" size="sm">
      <TabsTab value="a">Title orders<Tag size="sm" className="ml-1.5">2</Tag></TabsTab>
      <TabsTab value="b">Paper orders<Tag size="sm" className="ml-1.5">7</Tag></TabsTab>
    </TabsList>
    <TabsPanel value="a">…</TabsPanel>
  </Tabs>
</div>
```

A count `Tag` inside a `sm` tab **needs its own `size="sm"`**: `Tag` defaults to `md`, which is 24px, and a single one pushes the tab back to 32px. The component does not override a size the child declared explicitly — reaching in from the outside to restyle an inner component is exactly what product code is told not to do here.

## Usage guidelines

- **Do not squeeze the height of `TabsList` from product code** (`<TabsList className="h-7">`). It is an `inline-flex items-center`, so the tabs merely overflow while staying centred, and the solid pill sticks out 4px above and below the track (measured). Use `size="sm"` instead: the `py` of the tab and the `p` of the track have to shrink together, and squeezing only one layer always leaves the pill sticking out.

- [[base-ui-tabs-indicator-slider-via-active-tab-css-vars]]: the slider uses `--active-tab-*` variables written by Base UI on the indicator and a CSS transition, with no animation library. The active hook is `data-active`, not `data-selected`; using the wrong attribute leaves the style inactive. jsdom tests can run without ResizeObserver, although they do not render the indicator's actual geometry.

## Related
[Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../stepper/stepper.md)
