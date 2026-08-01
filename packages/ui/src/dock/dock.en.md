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
| className | `string` | — | Additional class name. |

### DockIcon
| Name | Type | Default | Description |
|------|------|------|------|
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

- Native macOS and Tauri system-Dock caveats do not apply to this React component.
- Magnification depends on the `mouseX` value distributed through context and animated with Motion springs, so it is a client-side interaction. Give icon artwork a consistent fixed size such as `size-5` so every item scales uniformly.

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
