"use client";
import { useState, type CSSProperties } from "react";
import { Calendar, ChevronRight, Ellipsis, File, Folder, Gauge, Search, Wrench } from "../../../../packages/ui/src/_icons";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar, } from "../../../../packages/ui/src/sidebar/sidebar";
import type { SidebarCollapsible, SidebarVariant } from "../../../../packages/ui/src/sidebar/sidebar.types";
const NAV = [
    { key: "overview", label: "Workbench", icon: Gauge },
    { key: "projects", label: "Project", icon: Folder },
    { key: "files", label: "File", icon: File, badge: "12" },
    { key: "schedule", label: "Schedule", icon: Calendar },
];
function StateReadout() {
    const { state, open, isMobile } = useSidebar();
    return (<p className="text-sm text-muted-foreground">
      state: <code className="text-foreground">{state}</code> · open:
      <code className="text-foreground">{String(open)}</code> · isMobile:
      <code className="text-foreground">{String(isMobile)}</code>
    </p>);
}
function Shell({ collapsible = "icon", variant = "sidebar", sidebarSurface, }: {
    collapsible?: SidebarCollapsible;
    variant?: SidebarVariant;
    sidebarSurface?: string;
}) {
    const [active, setActive] = useState("projects");
    const [subOpen, setSubOpen] = useState(true);
    return (<SidebarProvider fitViewport={false} className="h-[420px] overflow-hidden rounded-[var(--radius)] border border-border" style={sidebarSurface ? ({ "--hl-sidebar-surface": sidebarSurface } as CSSProperties) : undefined}>
      <Sidebar collapsible={collapsible} variant={variant}>
        <SidebarHeader>
          <div className="flex h-8 items-center gap-2 px-1">
            <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-xs font-bold text-primary-foreground">
              Hu
            </span>
            <span className="truncate text-sm font-semibold group-data-[collapsible=icon]/sidebar:hidden">
              Hulian workspace
            </span>
          </div>
          <div className="group-data-[collapsible=icon]/sidebar:hidden">
            <SidebarInput placeholder="Search…" prefix={<Search className="size-4"/>}/>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupAction aria-label="New">
              <span aria-hidden>+</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map((item) => (<SidebarMenuItem key={item.key}>
                    <SidebarMenuButton isActive={active === item.key} tooltip={item.label} onClick={() => setActive(item.key)}>
                      <item.icon aria-hidden/>
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.badge ? (<SidebarMenuBadge>{item.badge}</SidebarMenuBadge>) : (<SidebarMenuAction showOnHover aria-label={`More actions: ${item.label}`}>
                        <Ellipsis className="size-4" aria-hidden/>
                      </SidebarMenuAction>)}
                    {item.key === "projects" && subOpen ? (<SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton isActive>
                            <span>Hulian component library</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>
                            <span>Docs site redesign</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>) : null}
                  </SidebarMenuItem>))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings" onClick={() => setSubOpen((v) => !v)}>
                <Wrench aria-hidden/>
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <span className="text-sm font-medium">
            {NAV.find((n) => n.key === active)?.label ?? "Workbench"}
          </span>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-4">
          <StateReadout />
          <p className="text-sm text-muted-foreground">
            <kbd className="rounded-sm border border-border px-1">⌘/Ctrl</kbd>
            <kbd className="ml-1 rounded-sm border border-border px-1">B</kbd>
            <span className="ml-1">toggles the sidebar. The same combination pressed inside the field below does nothing.</span>
          </p>
          <input className="h-8 w-56 rounded-[var(--radius)] border border-border bg-bg px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Type here and try Cmd+B"/>
        </div>
      </SidebarInset>
    </SidebarProvider>);
}
function LoadingShell() {
    return (<SidebarProvider fitViewport={false} className="h-[280px] overflow-hidden rounded-[var(--radius)] border border-border">
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {["78%", "62%", "88%", "54%"].map((width) => (<SidebarMenuItem key={width}>
                    <SidebarMenuSkeleton width={width}/>
                  </SidebarMenuItem>))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 text-sm text-muted-foreground">Loading navigation…</div>
      </SidebarInset>
    </SidebarProvider>);
}
function ControlledShell() {
    const [open, setOpen] = useState(true);
    return (<div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Controlled, currently <code className="text-foreground">{open ? "expanded" : "collapsed"}</code>
        (persistence is wired by the consumer through a cookie or localStorage; the library writes none)
      </p>
      <SidebarProvider open={open} onOpenChange={setOpen} fitViewport={false} className="h-[220px] overflow-hidden rounded-[var(--radius)] border border-border">
        <Sidebar collapsible="offcanvas">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <Gauge aria-hidden/>
                      <span>Workbench</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <ChevronRight aria-hidden/>
                      <span>More</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="flex items-center gap-2 p-3">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">In offcanvas mode this is the only way to reopen it</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>);
}
export const sidebarShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage (icon collapse mode)",
            description: "SidebarProvider owns the state machine, Sidebar is the shell, and SidebarInset is the sibling content region. Collapsed rows fall back to icons with a Tooltip for the label.",
            code: `<SidebarProvider>
  <Sidebar collapsible="icon">
    <SidebarHeader>{/* brand / workspace switcher */}</SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive tooltip="Workbench">
                <Gauge />
                <span>Workbench</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
  <SidebarInset>
    <SidebarTrigger />
  </SidebarInset>
</SidebarProvider>`,
            render: () => <Shell collapsible="icon"/>,
        },
        {
            title: "Controlled offcanvas mode",
            description: "Collapsing in offcanvas mode takes the whole rail away, so keep a SidebarTrigger in the content area. open / onOpenChange belong to the consumer, and so does persistence.",
            code: `const [open, setOpen] = useState(true);

<SidebarProvider open={open} onOpenChange={setOpen}>
  <Sidebar collapsible="offcanvas">{/* \u2026 */}</Sidebar>
  <SidebarInset>
    <SidebarTrigger />
  </SidebarInset>
</SidebarProvider>`,
            render: () => <ControlledShell />,
        },
        {
            title: "Loading state",
            description: "SidebarMenuSkeleton takes a deterministic width instead of a random one, so SSR and hydration agree.",
            code: `<SidebarMenu>
  {["78%", "62%", "88%", "54%"].map((width) => (
    <SidebarMenuItem key={width}>
      <SidebarMenuSkeleton width={width} />
    </SidebarMenuItem>
  ))}
</SidebarMenu>`,
            render: () => <LoadingShell />,
        },
        {
            title: "Inline secondary action",
            description: "SidebarMenuAction is a sibling of SidebarMenuButton rather than a child, because a button inside a button is invalid HTML. showOnHover reveals it on hover only.",
            code: `<SidebarMenuItem>
  <SidebarMenuButton>
    <Folder />
    <span>Projects</span>
  </SidebarMenuButton>
  <SidebarMenuAction showOnHover aria-label="More actions">
    <Ellipsis className="size-4" />
  </SidebarMenuAction>
</SidebarMenuItem>`,
            render: () => <Shell collapsible="none"/>,
        },
        {
            title: "Depth: the inset shape and the sidebar surface",
            description: "In light mode surface and bg are often the same color, leaving the sidebar, the page background and the content area separated by nothing but a 1px border. inset turns the content area into a floating island and gives the sidebar an 8px gutter, while --hl-sidebar-surface recolors only the sidebar (omit it and you get surface, with no need to touch the global token). Collapsing an offcanvas sidebar drops that 8px gutter as well.",
            code: `<SidebarProvider style={{ "--hl-sidebar-surface": "var(--color-muted)" }}>
  <Sidebar variant="inset" collapsible="icon">\u2026</Sidebar>
  <SidebarInset>\u2026</SidebarInset>
</SidebarProvider>`,
            render: () => <Shell collapsible="icon" variant="inset" sidebarSurface="var(--color-muted)"/>,
        },
    ],
    controls: [
        {
            prop: "collapsible",
            type: "select",
            options: ["offcanvas", "icon", "none"],
            defaultValue: "icon",
        },
        {
            prop: "variant",
            type: "select",
            options: ["sidebar", "inset"],
            defaultValue: "sidebar",
        },
    ],
    states: [
        { name: "Collapsible set to icon", render: () => <Shell collapsible="icon"/> },
        { name: "Controlled offcanvas", render: () => <ControlledShell /> },
        { name: "Loading state", render: () => <LoadingShell /> },
    ],
    renderWithProps: (props) => (<Shell collapsible={(props.collapsible as SidebarCollapsible) ?? "icon"} variant={(props.variant as SidebarVariant) ?? "sidebar"}/>),
    toCode: (props) => `<SidebarProvider>
  <Sidebar collapsible="${props.collapsible ?? "icon"}" variant="${props.variant ?? "sidebar"}">\u2026</Sidebar>
  <SidebarInset>\u2026</SidebarInset>
</SidebarProvider>`,
};
