---
slug: collapsible
name: Collapsible
category: navigation
group: action
tags: []
exports: [Collapsible, CollapsibleTrigger, CollapsiblePanel]
status: enriched
---

# Collapsible

> Collapsible · Thin Base UI wrapper with a height transition driven by `--collapsible-panel-height` · navigation/action

## When to use

Use Collapsible to reveal or hide one block of supplementary content, such as details, a “show more” section, or optional advanced settings. Use [Accordion](../accordion/accordion.md) for several adjacent disclosures with mutually exclusive expansion, or [Command](../command/command.md) for navigation without disclosure content.

## Import
```ts
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| `Collapsible.open` | `boolean` | — | Controlled open state. |
| `Collapsible.defaultOpen` | `boolean` | `false` | Initial open state when uncontrolled. |
| `Collapsible.disabled` | `boolean` | `false` | Prevents expansion. |
| `Collapsible.className` | `string` | — | Container class name. |
| `CollapsibleTrigger.disabled` | `boolean` | `false` | Disables the trigger independently. |

## Events

| Event | Type | Description |
|------|------|------|
| `Collapsible.onOpenChange` | `(open: boolean) => void` | Called when the open state changes. HulianUI intentionally omits Base UI event details for consistency with Switch and Toggle. |

## Slots

| Slot | Type | Description |
|------|------|------|
| `Collapsible.children` | `ReactNode` | Trigger and Panel composition. |
| `CollapsibleTrigger.children` | `ReactNode` | Title-row content. |
| `CollapsiblePanel.children` | `ReactNode` | Collapsible content. |

## Example
```tsx
<Collapsible className="w-80">
  <CollapsibleTrigger>Show details</CollapsibleTrigger>
  <CollapsiblePanel>Supplementary content starts collapsed and opens from the title.</CollapsiblePanel>
</Collapsible>
```

Initially open:

```tsx
<Collapsible defaultOpen className="w-80">
  <CollapsibleTrigger>Hide details</CollapsibleTrigger>
  <CollapsiblePanel>This supplementary content starts expanded.</CollapsiblePanel>
</Collapsible>
```

## Usage guidelines

- The height transition uses Base UI's `--collapsible-panel-height` CSS variable. Put padding on an inner panel element so the closed state reaches zero height; do not measure `scrollHeight` or add an animation library. See [[base-ui-accordion-panel-height-css-var-pure-css-transition]].
- Use `open` with `onOpenChange` for controlled state, or `defaultOpen` for uncontrolled state, not both.

## Related
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
