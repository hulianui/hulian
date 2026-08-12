---
slug: sidebar
name: Sidebar
category: navigation
group: global
tags: []
exports: [SidebarProvider, Sidebar, SidebarInset, SidebarRail, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter, SidebarSeparator, SidebarInput, SidebarGroup, SidebarGroupLabel, SidebarGroupAction, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarMenuBadge, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, useSidebar, isEditableEventTarget, shouldEnableSidebarTooltip, sidebarMenuButtonVariants]
status: enriched
---

# Sidebar

> Application sidebar · composable shell with a collapse state machine (offcanvas/icon/none) and an automatic mobile drawer · navigation/global

## When to use

Use Sidebar for a **collapsible application sidebar whose contents you assemble yourself**: a workspace switcher, a search field, a project list, per-row secondary menus, a user card in the footer.

How to choose among the three neighbours:

| What you want | Use |
|------|------|
| Data-driven menu **content** (an `items` tree, no shell) | [NavMenu](../nav-menu/nav-menu.md) |
| A **finished full-page** admin shell (sidebar, header, route tabs, and content from a single `menuItems`) | [AdminLayout](../admin-layout/admin-layout.md) |
| Only the shell and the state machine, with fully custom contents | **Sidebar** |

They do not compete. Sidebar owns the shell only, so anything can live inside it — including a `<NavMenu>` placed in `<SidebarContent>` when you do want a data-driven menu. AdminLayout is the pre-wired product built from shell plus NavMenu plus header plus tabs; its shape is fixed and cannot host the custom parts listed above, so drop down to Sidebar when you need them.

## Import
```ts
import {
  SidebarProvider, Sidebar, SidebarInset, SidebarRail, SidebarTrigger,
  SidebarHeader, SidebarContent, SidebarFooter, SidebarSeparator, SidebarInput,
  SidebarGroup, SidebarGroupLabel, SidebarGroupAction, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction,
  SidebarMenuBadge, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubItem,
  SidebarMenuSubButton, useSidebar,
} from "@hulianui/ui"
```

## Props

### SidebarProvider

The state machine and the layout root. It renders a horizontal flex container whose two direct children are `Sidebar` and `SidebarInset`.

| Name | Type | Default | Description |
|------|------|------|------|
| `defaultOpen` | `boolean` | `true` | Uncontrolled initial value. |
| `open` | `boolean` | — | Controlled expanded state; pair it with `onOpenChange`. |
| `onOpenChange` | `(open: boolean) => void` | — | Fires in both controlled and uncontrolled mode. Wire persistence (cookie or localStorage) here. |
| `mobileBreakpoint` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| number` | `"md"` | Viewports narrower than this switch to the mobile drawer. |
| `shortcutKey` | `string \| false` | `"b"` | Key combined with Cmd/Ctrl for the built-in shortcut. `false` disables it. |
| `width` | `string` | `"16rem"` | Expanded width, written to `--hl-sidebar-width`. |
| `iconWidth` | `string` | `"3rem"` | Collapsed width for `collapsible="icon"`, written to `--hl-sidebar-width-icon`. |
| `fitViewport` | `boolean` | `true` | Pins the shell to the viewport height (`h-dvh` plus `overflow-hidden`). Pass `false` when previewing inside an existing scroll container. |

#### Warning: `mobileBreakpoint` differs by 1px from the LayoutSider and AdminLayout breakpoint

The same breakpoint name `"md"` carries **two coexisting meanings** in this library, and their boundaries are exactly one pixel apart:

| Component | Query produced by `"md"` | Meaning |
|------|------|------|
| `breakpoint` on [LayoutSider](../layout/layout.md) and [AdminLayout](../admin-layout/admin-layout.md) | `(max-width: 768px)` | Collapses **at and below** 768px. |
| `mobileBreakpoint` on `SidebarProvider` | `(max-width: 767px)` | Switches to the drawer **below** 768px. |

Both are deliberate, but they answer different questions. The first reads the breakpoint value as the collapse threshold itself; that is its established meaning and a test pins it down. The second matches **Tailwind's `md:` = `min-width: 768px`**, so that "the page starts laying out as desktop" and "Sidebar starts rendering as desktop" happen at the same instant. Aligning it with the first would tear exactly at 768px: the page would already be in its desktop layout while the sidebar was still a drawer. **An iPad in portrait is exactly 768px wide**, so this is not a theoretical edge.

Keep the one-pixel gap in mind when you use both components together. If you need them to line up exactly, pass numbers on both sides — `breakpoint={768}` equals `mobileBreakpoint={769}`, or the other way round — instead of assuming the shared name means the same thing.

### Sidebar

| Name | Type | Default | Description |
|------|------|------|------|
| `side` | `"left" \| "right"` | `"left"` | Attached edge; the mobile drawer slides in from the same side. |
| `collapsible` | `"offcanvas" \| "icon" \| "none"` | `"offcanvas"` | Desktop collapse mode; see "Three collapse modes" below. |
| `variant` | `"sidebar" \| "inset"` | `"sidebar"` | How the sidebar relates to the content area. `inset` gives the sidebar an 8px gutter and turns the content area into a rounded island; see "Depth: sidebar surface and inset" below. |
| `mobileTitle` | `ReactNode` | Locale value | Accessible title of the mobile drawer (visually hidden). |
| `mobileDescription` | `ReactNode` | Locale value | Accessible description of the mobile drawer (visually hidden). |
| `mobileShowClose` | `boolean` | `false` | Whether the mobile drawer renders its built-in top-right close button. Off by default so it cannot cover the first navigation row. |
| `mobileClassName` | `string` | — | Appended to the mobile drawer panel (merged with twMerge). |

### SidebarMenuButton

| Name | Type | Default | Description |
|------|------|------|------|
| `isActive` | `boolean` | `false` | Highlights the current row and sets `aria-current="page"`. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Row height. `SidebarMenuSubButton` only offers `"sm" \| "md"`. |
| `tooltip` | `ReactNode` | — | Label shown when collapsed to the icon rail. Enabled only while `state === "collapsed" && !isMobile`. |
| `tooltipSide` | `"top" \| "right" \| "bottom" \| "left"` | `"right"` | Tooltip direction. Pass `"left"` for a right-hand sidebar. |
| `render` | `ReactElement` | — | Renders as a custom element such as an `<a>` or a router `<Link>`, keeping real link semantics plus client-side routing. `SidebarTrigger`, `SidebarGroupAction`, `SidebarMenuAction`, and `SidebarMenuSubButton` accept the same prop. |

### Remaining structural parts

| Name | Type | Default | Description |
|------|------|------|------|
| `SidebarInset` | `<main>` | — | Sibling content region that fills the remaining width and scrolls itself. |
| `SidebarTrigger` | `<button>` | — | Toggle button with built-in `aria-label`, `aria-expanded`, and `aria-controls`. |
| `SidebarRail.label` | `string` | Locale value | Accessible name of the edge rail. Defaults to `locale.components.sidebar.rail` and is **deliberately different** from the trigger's name. |
| `SidebarHeader` / `SidebarFooter` | `<div>` | — | Pinned top and bottom regions that do not scroll with the content. |
| `SidebarContent` | `<div>` | — | The scrollable middle region. |
| `SidebarSeparator` | `<div role="separator">` | — | Divider. |
| `SidebarInput` | `Input` | — | Search field inside the sidebar; forwards every [Input](../input/input.md) prop. |
| `SidebarGroup` / `SidebarGroupLabel` / `SidebarGroupContent` | `<div>` | — | One section: container, small caption (hidden in icon mode), and body. |
| `SidebarGroupAction` | `<button>` | — | Action pinned to the top-right corner of a group, such as "New". |
| `SidebarMenu` / `SidebarMenuItem` | `<ul role="list">` / `<li>` | — | Menu list and row container. |
| `SidebarMenuAction.showOnHover` | `boolean` | `false` | Whether the trailing secondary action appears only on hover or focus. |
| `SidebarMenuBadge` | `<div>` | — | Trailing count badge; `pointer-events-none` so it never swallows clicks. |
| `SidebarMenuSkeleton.showIcon` | `boolean` | `true` | Whether the loading row shows a leading icon placeholder. |
| `SidebarMenuSkeleton.width` | `string` | `"70%"` | Width of the loading text bar. **Must be deterministic.** |
| `SidebarMenuSub` / `SidebarMenuSubItem` / `SidebarMenuSubButton` | `<ul>` / `<li>` / `<button>` | — | Second-level menu trio, hidden in icon mode. |

## Events

| Event | Type | Description |
|------|------|------|
| `SidebarProvider.onOpenChange` | `(open: boolean) => void` | Desktop expanded state changed. Fires in both controlled and uncontrolled mode. |

## Slots

| Slot | Type | Description |
|------|------|------|
| `SidebarTrigger.children` | `ReactNode` | Custom icon; defaults to the `Menu` icon. |
| `SidebarMenuButton.children` | `ReactNode` | Icon plus label. **Wrap the label in a `<span>`** — icon mode hides it through `[&>span:last-child]`. |

## useSidebar()

Call it from any descendant of `SidebarProvider`. It **throws outside the provider** instead of falling back silently.

| Field | Type | Description |
|------|------|------|
| `state` | `"expanded" \| "collapsed"` | Semantic alias of the desktop expanded state. |
| `open` / `setOpen` | `boolean` / `(open: boolean) => void` | Desktop expanded state. In controlled mode `setOpen` only fires `onOpenChange`. |
| `openMobile` / `setOpenMobile` | `boolean` / `(open: boolean) => void` | Mobile drawer switch. |
| `isMobile` | `boolean` | Whether the viewport is mobile. Always `false` during SSR and on the first frame. |
| `toggleSidebar` | `() => void` | Toggles whatever is current: the drawer on mobile, the expanded state on desktop. |

## Three collapse modes

| `collapsible` | When collapsed | Pick it when |
|------|------|------|
| `offcanvas` (default) | Width goes to zero; the whole rail is gone | The content region needs the full width, as in an editor or a wide table. **Keep a `SidebarTrigger` in the content area**, or the sidebar can never be reopened. |
| `icon` | Shrinks to `--hl-sidebar-width-icon`, labels hidden | The common admin choice. Give every row a `tooltip`, otherwise the collapsed rail is a column of nameless icons. |
| `none` | Width unchanged | Desktop tools whose sidebar is always open. The state machine still flips (`state` changes), it just does not resize; mobile still switches to the drawer. |

## Example

```tsx
const [open, setOpen] = useState(readCookie("sidebar") !== "0");

<SidebarProvider open={open} onOpenChange={(next) => { setOpen(next); writeCookie("sidebar", next ? "1" : "0"); }}>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <WorkspaceSwitcher />
      <SidebarInput placeholder="Search" prefix={<Search className="size-4" />} />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <SidebarGroupAction aria-label="New project"><Plus className="size-4" /></SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu>
            {projects.map((p) => (
              <SidebarMenuItem key={p.id}>
                {/* render keeps it a real link: middle-click, copy link address, and screen-reader link semantics, plus client-side routing */}
                <SidebarMenuButton
                  isActive={p.id === current}
                  tooltip={p.name}
                  render={<Link to="/projects/$id" params={{ id: p.id }} />}
                >
                  <Folder />
                  <span>{p.name}</span>
                </SidebarMenuButton>
                {/* A sibling, not a child - a button inside a button is invalid HTML */}
                <SidebarMenuAction showOnHover aria-label={`More actions for ${p.name}`}>
                  <Ellipsis className="size-4" />
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter><UserCard /></SidebarFooter>
    <SidebarRail />
  </Sidebar>

  <SidebarInset>
    <header className="flex h-12 items-center gap-2 border-b border-border px-3">
      <SidebarTrigger />
      <Breadcrumb items={crumbs} />
    </header>
    <div className="flex-1 overflow-auto p-4">{children}</div>
  </SidebarInset>
</SidebarProvider>
```

## Pitfalls

- **Secondary actions must be siblings.** Put `SidebarMenuAction` and `SidebarMenuBadge` inside `SidebarMenuItem` next to `SidebarMenuButton`; they cover the right edge through absolute positioning. Nesting them inside the button produces `button > button`, which React reports during hydration and which hides the second control from screen readers.
- **Wrap labels in a `<span>` for icon mode.** Collapsing works through `[&>span:last-child]:hidden`. A bare text child such as `<Folder /> Projects` has no node to hide, so the text is clipped into a fragment instead.
- **Nothing inside an `offcanvas` sidebar is reachable once collapsed**, including `SidebarRail`. Keep another `SidebarTrigger` in the content area or the user can never reopen it.
- **Persistence is not built in.** `open` and `onOpenChange` are exposed so you can wire a cookie, localStorage, or a server-side preference. A cookie hardcoded in the library would fight SSR first paint, multi-tenant setups, and privacy policies.
- **Never randomize `SidebarMenuSkeleton.width`.** A random width is rolled once on the server and again on the client, which guarantees a hydration mismatch. Pass a deterministic list such as `["78%", "62%", "88%"]` if you want uneven bars.
- **`isMobile` is `false` during SSR and on the first frame.** It comes from `matchMedia` inside an effect, so the first tree is always the desktop shape; that is what keeps SSR and hydration identical. If a narrow viewport must render the drawer on first paint, detect it from the user agent on the server and drive the state yourself.
- **Change `tooltipSide` for a right-hand sidebar.** With `side="right"` the tooltip still points right by default and flies off screen; pass `tooltipSide="left"`.

### Depth: sidebar surface and inset

By default the sidebar shares `--color-surface` with [Card](../card/card.md) and [Popover](../popover/popover.md). **If your bridge layer maps `surface` and `bg` to the same color** (both pure white is the common light-mode case), the sidebar, the page background and the content area all end up the same color with only a 1px border between them — whereas a shadcn-lineage application sidebar usually carries one step of contrast there: **the navigation plane sits behind, the content sits in front** (#224).

Two independent escape hatches; use either or both:

```tsx
{/* 1) Recolor the sidebar only: one variable, no global token change, no className override */}
<SidebarProvider style={{ "--hl-sidebar-surface": "var(--color-muted)" } as CSSProperties}>

{/* 2) The inset shape: an 8px gutter around the sidebar, the content area as a rounded island */}
<Sidebar variant="inset" collapsible="icon">…</Sidebar>
<SidebarInset>…</SidebarInset>
```

- `--hl-sidebar-surface` **falls back to `--color-surface`**, so leaving it unset changes nothing. It only covers the sidebar (including the copy inside the mobile drawer) and touches no other component — which is exactly why editing `--color-surface` is the wrong lever: that one is the shared surface color of the whole library.
- `variant="inset"` requires `SidebarInset` to be the **next sibling** of `Sidebar` (same level, no `div` in between): the island styling reads the preceding sibling through `peer-data-*`. That is the same structural requirement as "Why in-flow rather than fixed" below, so correct markup already satisfies it.
- On mobile the sidebar becomes a drawer and leaves the flow, so `inset` does not apply there (same as shadcn).
- Under `inset` the sidebar draws **no divider** (the gutter already separates them), and with `collapsible="offcanvas"` that 8px gutter collapses to zero as well — otherwise a `width: 0` sidebar would still occupy 16px of padding and look like it never closed. That is also why this step cannot be reproduced with `className="p-2"` at the call site: collapsing would always leave a strip behind.

### Reduced motion is the library's job

Opening and closing the sidebar is a page-level container transform, so under `prefers-reduced-motion: reduce` **the component drops the width transition by itself** (#225). Consumers need to do nothing.

The width transition lives in an inline `style` (duration and easing come from the motion tokens; utility classes are avoided so that projects importing only `preset-core.css` still get the same curve), and an inline style outranks every ordinary CSS rule — overriding it takes `!important` plus a selector that guesses the library's internal DOM structure, which fails silently the moment that structure changes, and what fails is an accessibility preference with no error to show for it. So the component owns it: **if any component still moves under reduced motion, file it as a bug** rather than stacking `!important` on the consumer side.

When your own hand-rolled motion needs the same signal, use the exported hook instead of writing another `matchMedia`:

```tsx
import { usePrefersReducedMotion } from "@hulianui/ui";

const reduce = usePrefersReducedMotion();   // false during SSR and first paint, corrected right after hydration
```

### Why the shortcut yields

The built-in shortcut is `Cmd/Ctrl + B`. It never fires in four situations: `event.defaultPrevented` (someone already handled the key), inside `input` / `textarea` / `select`, on a `contenteditable` element, and **inside a descendant of a `contenteditable` element**.

The last one is the easy miss: when the caret sits on a `<strong>` in a rich-text editor the event `target` is that `<strong>`, not the editable host, so checking the target alone skips the whole editor. The user then presses `Cmd+B` to embolden a task title and the sidebar jumps instead. The decision is exported as the pure function `isEditableEventTarget` so it can be unit tested directly.

Pass `shortcutKey={false}` to drop the shortcut, or `shortcutKey="k"` to rebind it.

## Layout: in-flow rather than fixed

The comparable implementation in shadcn/ui lays out a `fixed` panel next to an equally wide spacer div. This component instead transitions its width in flow, because a `fixed` panel escapes any container that is not full screen — a documentation preview frame, a [Viewport](../viewport/viewport.md) device frame, a split workspace — and pins itself to the viewport. The in-flow approach matches [LayoutSider](../layout/layout.md) and [AdminLayout](../admin-layout/admin-layout.md) and needs no measurement.

The trade-off: `SidebarProvider` must be the horizontal flex container, and `Sidebar` and `SidebarInset` must be its direct children. An extra wrapper `div` between them breaks the flex relationship.

## Related
[NavMenu](../nav-menu/nav-menu.md) · [AdminLayout](../admin-layout/admin-layout.md) · [Layout](../layout/layout.md) · [Drawer](../drawer/drawer.md) · [Tooltip](../tooltip/tooltip.md) · [RouteTabs](../route-tabs/route-tabs.md)
