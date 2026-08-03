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

## Usage guidelines

- [[base-ui-tabs-indicator-slider-via-active-tab-css-vars]]: the slider uses `--active-tab-*` variables written by Base UI on the indicator and a CSS transition, with no animation library. The active hook is `data-active`, not `data-selected`; using the wrong attribute leaves the style inactive. jsdom tests can run without ResizeObserver, although they do not render the indicator's actual geometry.

## Related
[Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../stepper/stepper.md)
