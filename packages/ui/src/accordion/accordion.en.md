---
slug: accordion
name: Accordion
category: navigation
group: action
tags: []
exports: [Accordion, AccordionItem, AccordionTrigger, AccordionPanel]
status: enriched
---

# Accordion

> Accordion · Base UI single or multiple expansion with height transitions · navigation/action

## When to use

Use Accordion for several adjacent title-and-content sections such as FAQs, settings groups, or documentation outlines. Items are mutually exclusive by default, with optional multiple expansion. Use [Collapsible](../collapsible/collapsible.md) for one disclosure, or [Command](../command/command.md) for navigation without collapsible content.

## Import
```ts
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@hulianui/ui"
```

## Props

`Accordion`, `AccordionItem`, `AccordionTrigger`, and `AccordionPanel` are thin wrappers around the matching Base UI primitives and forward all their props. Common props include:

| Name | Type | Default | Description |
|------|------|------|------|
| `Accordion.multiple` | `boolean` | `false` | Whether multiple items can remain open. When false, opening one closes the previous item. |
| `Accordion.defaultValue` | `string[]` | — | Initially expanded item values when uncontrolled. |
| `Accordion.value` | `string[]` | — | Controlled expanded values. |
| `Accordion.className` | `string` | — | Container class name. |
| `AccordionItem.value` * | `string` | — | Unique item identifier used by `value` and `defaultValue`. |
| `AccordionItem.disabled` | `boolean` | `false` | Whether the item cannot be expanded or collapsed. |

## Events

| Event | Type | Description |
|------|------|------|
| `Accordion.onValueChange` | `(value: string[]) => void` | Called when expansion changes. Pair it with `value` in controlled mode. |

## Slots

| Slot | Type | Description |
|------|------|------|
| `AccordionTrigger.children` | `ReactNode` | Title-row content. |
| `AccordionPanel.children` | `ReactNode` | Collapsible panel content. |

## Example
```tsx
<Accordion defaultValue={["ship"]}>
  <AccordionItem value="ship">
    <AccordionTrigger>How do I release Hulian?</AccordionTrigger>
    <AccordionPanel>Commit directly to local master in the trunk-based workflow after all three gates pass.</AccordionPanel>
  </AccordionItem>
  <AccordionItem value="token">
    <AccordionTrigger>How do colors adapt to light and dark themes?</AccordionTrigger>
    <AccordionPanel>Use semantic tokens; the Tailwind v4 dark variant switches them automatically.</AccordionPanel>
  </AccordionItem>
</Accordion>
```

Multiple expansion:

```tsx
<Accordion multiple defaultValue={["ship", "token"]}>{/* Items */}</Accordion>
```

## Usage guidelines

- Expansion uses Base UI's `--accordion-panel-height` CSS variable and a CSS transition. Do not measure `scrollHeight` in `useLayoutEffect` or add an animation library. Put padding on an inner element so a closed panel can reach zero height. See [[base-ui-accordion-panel-height-css-var-pure-css-transition]].
- Choose controlled `value` or uncontrolled `defaultValue`, not both.

## Related
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
