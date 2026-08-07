---
slug: dock
name: Dock
category: navigation
group: global
tags: []
exports: [Dock, DockIcon]
status: enriched
---

# Dock

> Magnifying dock · macOS-style icon scaling based on pointer distance, with Motion springs and shared `mouseX` context · navigation/global

## When to use

Use Dock for a floating row of shortcuts along the bottom or side of a page. Icons enlarge elastically as the pointer approaches, creating a macOS-like effect suited to portfolios, personal sites, and desktop-inspired interfaces. Use [Navbar](../navbar/navbar.md) for conventional site navigation, or [Menu](../menu/menu.md) and [Menubar](../menubar/menubar.md) for functional action menus.

## Import
```ts
import { Dock, DockIcon } from "@hulianui/ui"
```

## Props

### Dock
| Name | Type | Default | Description |
|------|------|------|------|
| magnification | `number` | `64` | Peak icon size in pixels when the pointer is closest. |
| distance | `number` | `140` | Radius of the magnification influence in pixels. |
| iconSize | `number` | `40` | Resting icon size in pixels. |
| activeKey | `string` | — | Key of the current item, compared against each `DockIcon`'s `itemKey`. |
| onSelect | `(key: string) => void` | — | Fired when an item is chosen. **Providing it turns each `DockIcon` into a real `<button>`** and upgrades the container to a `nav` landmark. |
| aria-label | `string` | — | Landmark name when the container renders as `<nav>`. |
| className | `string` | — | Additional class name. |

### DockIcon
| Name | Type | Default | Description |
|------|------|------|------|
| itemKey | `string` | — | Key of this item, used with the Dock's `activeKey` and `onSelect`. |
| active | `boolean` | — | Forces the selected state, taking precedence over the `activeKey` comparison. |
| label | `string` | — | Accessible name when the icon is clickable, since icons rarely carry text. |
| className | `string` | — | Additional class name. |

## Slots

### Dock
| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | A set of `DockIcon` elements. |

### DockIcon
| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content of one icon. |

## Example
```tsx
<Dock>
  <DockIcon><Home className="size-5" /></DockIcon>
  <DockIcon><Search className="size-5" /></DockIcon>
  <DockIcon><Settings className="size-5" /></DockIcon>
</Dock>
```

## Usage guidelines

- **A current item is core information for a Dock, not decoration.** The macOS Dock itself highlights the active app and marks running ones; on the web a Dock is typically a persistent bottom navigation, which must answer "where am I". Express it with `activeKey` plus `itemKey` on `DockIcon`, and the component emits `aria-current="page"` together with an indicator dot under the icon — a shape cue, not colour alone.
- **`DockIcon` only becomes a real `<button>` when `onSelect` is provided** (focusable, activated by Enter), and the container then upgrades to a `nav` landmark. Without it the icon stays a non-semantic container, because many consumers put their own `<a>` in the children and an automatic button wrapper would nest interactive elements.

- Native macOS and Tauri system-Dock caveats do not apply to this React component.
- Magnification depends on the `mouseX` value distributed through context and animated with Motion springs, so it is a client-side interaction. Give icon artwork a consistent fixed size such as `size-5` so every item scales uniformly.

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
