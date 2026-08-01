---
slug: command
name: Command
category: navigation
group: action
tags: []
exports: [Command, useCommandShortcut]
status: enriched
---

# Command

> Command palette · Command/Ctrl+K modal built on Dialog with live filtering, groups, and dependency-free keyboard navigation · navigation/action

## When to use

Use Command for a global Command/Ctrl+K palette that brings cross-page navigation, actions, and theme switching into one searchable, grouped, keyboard-navigable surface. Use [Toolbar](../toolbar/toolbar.md) for a persistent row of controls or [ContextMenu](../context-menu/context-menu.md) for actions opened at a pointer location. Command is a modal, data-driven search entry point.

## Import
```ts
import { Command, useCommandShortcut } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| open* | `boolean` | — | Controlled open state. |
| groups* | `CommandGroupData[]` | — | Command groups, each with an optional heading. |
| placeholder | `string` | `"\u8f93\u5165\u547d\u4ee4\u6216\u641c\u7d22\u2026"` | Search-field placeholder. The built-in Chinese copy means “Type a command or search…”. |
| filter | `(item: CommandItemData, query: string) => boolean` | Substring match | Custom predicate; return true to retain an item. The default case-insensitively searches `keywords`, string `label`, and `value`. |
| closeOnSelect | `boolean` | `true` | Whether executing an item closes the palette. |
| shortcut | `boolean` | `false` | Whether to install the global Command/Ctrl+K open-state shortcut. |
| className | `string` | — | Additional class name. |
| aria-label | `string` | `"\u547d\u4ee4\u9762\u677f"` | Accessible label. The built-in Chinese copy means “Command palette.” |

## Events

| Event | Type | Description |
|------|------|------|
| onOpenChange* | `(open: boolean) => void` | Called when the palette requests an open-state change. |
| onSelectItem | `(value: string) => void` | Called after an item's own `onSelect`, with its value. |
| onQueryChange | `(query: string) => void` | Called on query changes, including the reset each time the palette opens. Use it with `filter={() => true}` when the consumer owns sorting, grouping, and filtering. |

## Slots

| Slot | Type | Description |
|------|------|------|
| emptyMessage | `ReactNode` | Empty-state content shown when no command matches. The built-in Chinese copy is `"\u65e0\u5339\u914d\u7ed3\u679c"`, meaning “No matching results.” |

**CommandGroupData**: `heading?: ReactNode` / `items: CommandItemData[]`.

**CommandItemData**

| Field | Type | Description |
|------|------|------|
| value* | `string` | Unique value used for callbacks, the React key, and fallback filtering. |
| label* | `ReactNode` | Visible title. |
| keywords | `string` | Additional searchable terms, especially for non-string labels. |
| description | `ReactNode` | Muted secondary content below the label. |
| icon | `ReactNode` | Leading icon. |
| shortcut | `ReactNode` | Trailing keyboard shortcut or marker. |
| disabled | `boolean` | Whether the item is unavailable. |
| onSelect | `(value: string) => void` | Called when Enter or a click executes the item. |

## Example
```tsx
const groups = [
  {
    heading: "Quick navigation",
    items: [
      { value: "go-orders", label: "Orders", keywords: "orders", icon: <ShoppingCart />, onSelect: () => router.push("/orders") },
      { value: "new-order", label: "New order", icon: <Plus />, shortcut: "⌘N" },
    ],
  },
];

const [open, setOpen] = useState(false);
<Command open={open} onOpenChange={setOpen} groups={groups} shortcut placeholder="Type a command or search…" />
```

## Usage guidelines

- Command is always controlled; provide both `open` and `onOpenChange`.
- A non-string `label` is not directly searchable by the default filter. Add `keywords`, or the item can match only through `value`.
- Enable the built-in shortcut with `shortcut`. If the surrounding application installs its own trigger, use `useCommandShortcut` instead and do not enable both.

## Related
[ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
