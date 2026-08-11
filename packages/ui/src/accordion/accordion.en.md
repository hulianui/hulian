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
| `AccordionPanel.plain` | `boolean` | `false` | No chrome: skip the inner padding-and-secondary-text wrapper so children land directly in the panel. |

`Accordion` is a generic component; `value`, `defaultValue`, and `onValueChange` use `string` elements by default. Write `<Accordion<"a" | "b"> …>` when the item identifiers are an enum or a literal union instead.

### plain: when the panel holds a whole feature block

`AccordionPanel` wraps its children in a `px-4 pb-4 pt-1 text-sm text-muted-foreground` skin element, which is designed for a short paragraph of explanatory text. Add `plain` when the panel holds a **whole feature block** — a permission editor, a configuration form, or a list that already brings its own `border-t` and per-row padding:

```tsx
<AccordionPanel plain>
  <div className="divide-y divide-border border-t border-border">{/* Feature block */}</div>
</AccordionPanel>
```

Without it, two things go wrong: `text-muted-foreground` inherits down into every unstyled piece of text in the panel, so the whole block reads as disabled, and the inner `px-4` stacks on top of the padding the content already has, which also keeps separators from reaching the panel edges. `className` lands on the **outer** panel and cannot reach the inner element, so do not reach in with arbitrary variants such as `[&>div]:p-0` — that turns "the inner element is a div" into an external contract that breaks whenever the internal structure changes.

The same `plain` name means the same thing on the [Collapsible](../collapsible/collapsible.md) panel and as [Card](../card/card.md)'s `variant="plain"`: **when the content brings its own appearance, the answer is no skin rather than a different skin**.

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

Controlled, with expansion driven by external state:

```tsx
const [open, setOpen] = useState<string[]>([]);

<Accordion multiple value={open} onValueChange={(v) => setOpen(v)}>{/* Items */}</Accordion>
```

## Usage guidelines

- Expansion uses Base UI's `--accordion-panel-height` CSS variable and a CSS transition. Do not measure `scrollHeight` in `useLayoutEffect` or add an animation library. Put padding on an inner element so a closed panel can reach zero height. See [[base-ui-accordion-panel-height-css-var-pure-css-transition]].
- Choose controlled `value` or uncontrolled `defaultValue`, not both.
- Add `plain` when the panel content brings its own padding, borders, or body color. Do not reach into the internal skin element with arbitrary variants such as `[&>div]:p-0`.

## Related
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
