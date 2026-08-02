---
slug: layout
name: Layout
category: layout
group: container
tags: []
exports: [Layout, LayoutHeader, LayoutSider, LayoutContent, LayoutFooter]
status: enriched
---

# Layout

> Full-page layout · Composable Header/Sider/Content/Footer regions + controlled, breakpoint-aware Sider collapse + animated width transitions · dependency-free · RSC-friendly · reuses ScrollArea · layout/container

## When to use

Use Layout when you need a general page skeleton with Header, Sider, Content, and Footer regions while retaining control of menu and tab behavior. For a ready-made admin shell with branding, NavMenu, and persistent multi-tab navigation, use [AdminLayout](../admin-layout/admin-layout.md), which is assembled from these primitives.

## Import
```ts
import { Layout, LayoutHeader, LayoutSider, LayoutContent, LayoutFooter } from "@hulianui/ui"
```

## Props

### Layout (also available through compound members such as `Layout.Sider`)
| Name | Type | Default | Description |
|------|------|------|------|
| hasSider | `boolean` | auto-detected | Forces a horizontal layout containing a sidebar. By default, direct children are inspected for `Layout.Sider`: present means `row`, absent means `column`. Set this explicitly when the Sider is rendered asynchronously or conditionally. |

Inherited from `HTMLAttributes<HTMLDivElement>`.

### LayoutHeader
| Name | Type | Default | Description |
|------|------|------|------|
| sticky | `boolean` | `false` | Sticky top-0. |

### LayoutSider
| Name | Type | Default | Description |
|------|------|------|------|
| width | `number` | `240` | Expanded state width (px). |
| collapsedWidth | `number` | `64` | Width in the collapsed state (px), typically for an icon-only menu. |
| collapsible | `boolean` | `false` | Enables collapsing and displays the bottom trigger. |
| collapsed | `boolean` | — | Controlled collapsed state. Pair it with `onCollapse` to update the value. |
| defaultCollapsed | `boolean` | `false` | Initial collapsed state when uncontrolled. |
| breakpoint | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| number` | — | Responsive breakpoint: the viewport automatically collapses when ≤ the width, and expands when >. |

### LayoutContent / LayoutFooter
Accept standard `HTMLAttributes<HTMLElement>` and define no component-specific props.

## Events

### LayoutSider
| Event | Type | Description |
|------|------|------|
| onCollapse | `(collapsed: boolean, type: "clickTrigger" \| "responsive") => void` | Collapse state change callback (triggered when trigger is clicked or breakpoint is hit). |

## Slots

### LayoutSider
| Slot | Type | Description |
|------|------|------|
| trigger | `ReactNode` | Bottom collapse trigger. `undefined` uses the default chevron; `null` hides the trigger even when collapsible; a node supplies custom content inside the component's clickable button. |

## Example
```tsx
// Classic shell: collapsible Sider on the left, page regions on the right
<Layout>
  <Layout.Sider collapsible>
    {/* Brand and menu */}
  </Layout.Sider>
  <Layout>
    <Layout.Header sticky>Top bar</Layout.Header>
    <Layout.Content>Content</Layout.Content>
    <Layout.Footer>Footer</Layout.Footer>
  </Layout>
</Layout>
```

```tsx
// Controlled collapse: trigger and breakpoint changes update local state
function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Layout.Sider
      collapsible
      collapsed={collapsed}
      breakpoint="md"
      onCollapse={(c) => setCollapsed(c)}
    >
      <NavMenu items={menu} mode={collapsed ? "collapsed" : "inline"} />
    </Layout.Sider>
  );
}
```

## Usage guidelines

- **Choose controlled or uncontrolled state.** Passing `collapsed` makes `Layout.Sider` controlled, so `onCollapse` must write changes back or the trigger and breakpoint cannot update it. Use `defaultCollapsed` only for uncontrolled state.
- **Layout direction is inferred from direct children.** A direct `Layout.Sider` makes the parent horizontal. Detection cannot see a Sider rendered asynchronously, conditionally, or inside a wrapper such as `<AppSider />`; set `hasSider` explicitly in those cases.
- In the collapsed state, pass `mode="collapsed"` to NavMenu for its built-in icon-only track. Do not hand-build truncated menu labels.

## Related
[AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md) · [FitScreen](../fit-screen/fit-screen.md)
