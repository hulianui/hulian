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
| `CollapsiblePanel.plain` | `boolean` | `false` | No chrome: skip the inner padding-and-secondary-text wrapper so children land directly in the panel. |

### plain: when the panel holds a whole feature block

`CollapsiblePanel` wraps its children in a `px-3 pb-3 pt-1 text-sm text-muted-foreground` skin element, which is designed for a short paragraph of explanatory text. Add `plain` when the disclosure holds a **whole feature block** — an integration settings form, a permission editor, or a list that already brings its own `border-t` and per-row padding:

```tsx
<CollapsiblePanel plain>
  <div className="divide-y divide-border border-t border-border">{/* Feature block */}</div>
</CollapsiblePanel>
```

Without it, two things go wrong: `text-muted-foreground` inherits down into every unstyled piece of text in the panel, so the whole block reads as disabled, and the inner `px-3` stacks on top of the padding the content already has. `className` lands on the **outer** panel and cannot reach the inner element — an extra wrapper can win the color back, but never the padding.

The same `plain` name means the same thing on the [Accordion](../accordion/accordion.md) panel and as [Card](../card/card.md)'s `variant="plain"`: **when the content brings its own appearance, the answer is no skin rather than a different skin**.

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
- Add `plain` when the panel content brings its own padding, borders, or body color. Wrapping it in yet another element wins back the color but never the padding.

## Related
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
