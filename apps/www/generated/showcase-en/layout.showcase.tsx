"use client";
import { useState } from "react";
import { Gauge, LayoutGrid, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../../../packages/ui/src/lib/cn";
import { NavMenu } from "../../../../packages/ui/src/nav-menu/nav-menu";
import type { NavMenuNode } from "../../../../packages/ui/src/nav-menu/nav-menu.types";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Layout } from "../../../../packages/ui/src/layout/layout";
const menu: NavMenuNode[] = [
    { key: "dashboard", label: "Dashboard", icon: <Gauge /> },
    { key: "apps", label: "Workbench", icon: <LayoutGrid /> },
    { key: "users", label: "User Management", icon: <Users /> },
    { key: "settings", label: "System Settings", icon: <Settings /> },
];
function DemoSider({ collapsed: collapsedProp, collapsible = true, defaultCollapsed, collapsedWidth, width, breakpoint, }: {
    collapsed?: boolean;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    collapsedWidth?: number;
    width?: number;
    breakpoint?: "md";
}) {
    const [internal, setInternal] = useState(defaultCollapsed ?? false);
    const collapsed = collapsedProp ?? internal;
    return (<Layout.Sider collapsible={collapsible} collapsed={collapsed} collapsedWidth={collapsedWidth} width={width} breakpoint={breakpoint} onCollapse={(c) => setInternal(c)}>
      <div className={cn("flex h-[var(--hl-layout-header-h)] shrink-0 items-center font-semibold text-primary", collapsed ? "justify-center" : "px-4")}>
        {collapsed ? "Hu" : "Hulian Console"}
      </div>
      <NavMenu items={menu} mode={collapsed ? "collapsed" : "inline"} selectedKeys={["dashboard"]} className={collapsed ? "mx-auto py-2" : "w-full p-2"}/>
    </Layout.Sider>);
}
function FillerContent() {
    return (<div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Page content</h2>
      {Array.from({ length: 8 }, (_, i) => (<p key={i} className="text-sm text-muted">
          No. {i + 1} Segment occupancy content - Content area flex-auto is full and scrolls independently, Header can reach the top, and Footer can sink to the bottom.
        </p>))}
    </div>);
}
function Frame({ children }: {
    children: ReactNode;
}) {
    return (<div className="h-[360px] w-full max-w-3xl overflow-hidden rounded-[var(--radius)] border border-border">
      {children}
    </div>);
}
function ClassicShell({ collapsed, collapsible = true, defaultCollapsed, collapsedWidth, breakpoint, }: {
    collapsed?: boolean;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    collapsedWidth?: number;
    breakpoint?: "md";
}) {
    return (<Layout className="h-full" hasSider>
      <DemoSider collapsible={collapsible} collapsed={collapsed} defaultCollapsed={defaultCollapsed} collapsedWidth={collapsedWidth} breakpoint={breakpoint}/>
      <Layout>
        <Layout.Header sticky>
          <span className="font-medium text-foreground">Middle and backend shell</span>
          <span className="ml-auto text-sm text-muted">user@hulian</span>
        </Layout.Header>
        <Layout.Content>
          <FillerContent />
        </Layout.Content>
        <Layout.Footer>Hulian Layout · © 2026</Layout.Footer>
      </Layout>
    </Layout>);
}
export const layoutShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Classic middle and backend shell",
            description: "Left Sider + Right Header / Content / Footer, automatic horizontal layout when including sidebar.",
            code: `const [collapsed, setCollapsed] = useState(false)

<Layout className="h-full" hasSider>
  <Layout.Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
    <div className={cn(
      "flex h-[var(--hl-layout-header-h)] items-center font-semibold",
      collapsed ? "justify-center" : "px-4",
    )}>
      {collapsed ? "H" : "Hulian Console"}
    </div>
    <NavMenu items={items} mode={collapsed ? "collapsed" : "inline"} selectedKeys={["dashboard"]} />
  </Layout.Sider>
  <Layout>
    <Layout.Header sticky>
      <span className="font-medium">Middle and backend shell</span>
      <span className="ml-auto text-sm text-muted">user@hulian</span>
    </Layout.Header>
    <Layout.Content>{/* Page content */}</Layout.Content>
    <Layout.Footer>Hulian Layout \u00B7 \u00A9 2026</Layout.Footer>
  </Layout>
</Layout>`,
            render: () => (<Frame>
          <Layout className="h-full" hasSider>
            <DemoSider />
            <Layout>
              <Layout.Header sticky>
                <span className="font-medium text-foreground">Middle and backend shell</span>
                <span className="ml-auto text-sm text-muted">user@hulian</span>
              </Layout.Header>
              <Layout.Content>
                <FillerContent />
              </Layout.Content>
              <Layout.Footer>Hulian Layout · © 2026</Layout.Footer>
            </Layout>
          </Layout>
        </Frame>),
        },
        {
            title: "The header of the banner is at the top",
            description: "Header spans the full width, and is divided into Sider + Content below. The outermost layer is a vertical layout.",
            code: `<Layout className="h-full">
  <Layout.Header>
    <span className="font-medium">Bar header</span>
  </Layout.Header>
  <Layout>
    <Layout.Sider collapsible>
      <NavMenu items={items} />
    </Layout.Sider>
    <Layout.Content>{/* Page content */}</Layout.Content>
  </Layout>
  <Layout.Footer>Bottom bar \u00B7 \u00A9 2026</Layout.Footer>
</Layout>`,
            render: () => (<Frame>
          <Layout className="h-full">
            <Layout.Header>
              <span className="font-medium text-foreground">Header of banner</span>
            </Layout.Header>
            <Layout hasSider>
              <DemoSider />
              <Layout.Content>
                <FillerContent />
              </Layout.Content>
            </Layout>
            <Layout.Footer>Bottom bar · © 2026</Layout.Footer>
          </Layout>
        </Frame>),
        },
        {
            title: "Close the sidebar by default",
            description: "defaultCollapsed makes the sidebar initially retracted, and NavMenu switches to the collapsed icon track.",
            code: `<Layout.Sider collapsible defaultCollapsed>
  <NavMenu items={items} mode="collapsed" />
</Layout.Sider>`,
            render: () => (<Frame>
          <Layout className="h-full" hasSider>
            <DemoSider defaultCollapsed/>
            <Layout>
              <Layout.Header sticky>
                <span className="font-medium text-foreground">Collapse</span>
              </Layout.Header>
              <Layout.Content>
                <FillerContent />
              </Layout.Content>
              <Layout.Footer>Hulian Layout · © 2026</Layout.Footer>
            </Layout>
          </Layout>
        </Frame>),
        },
    ],
    controls: [
        { prop: "collapsed", type: "boolean", defaultValue: false, label: "Collapse sidebar" },
    ],
    states: [
        {
            name: "Classic middle and backstage (left Sider + Header/Content/Footer, foldable)",
            render: () => (<Frame>
          <ClassicShell />
        </Frame>),
        },
        {
            name: "Header The banner is on top (Header / [Sider + Content] / Footer)",
            render: () => (<Frame>
          <Layout className="h-full">
            <Layout.Header>
              <span className="font-medium text-foreground">Header of banner</span>
            </Layout.Header>
            <Layout hasSider>
              <DemoSider width={200}/>
              <Layout.Content>
                <FillerContent />
              </Layout.Content>
            </Layout>
            <Layout.Footer>Bottom bar · © 2026</Layout.Footer>
          </Layout>
        </Frame>),
        },
        {
            name: "Default collapsed + Customized collapsedWidth(56)",
            render: () => (<Frame>
          <ClassicShell defaultCollapsed collapsedWidth={56}/>
        </Frame>),
        },
        {
            name: "Responsive breakpoint (md): Narrow screen automatically retracts",
            render: () => (<Frame>
          <ClassicShell breakpoint="md"/>
        </Frame>),
        },
    ],
    renderWithProps: (p) => (<Frame>
      <ClassicShell collapsed={Boolean(p.collapsed)}/>
    </Frame>),
    toCode: (p) => `<Layout>
  <Layout.Sider collapsible${p.collapsed ? " collapsed" : ""}>
    {/* dogfood NavMenu: Automatically cut the icon track in the collapsed state */}
    <NavMenu items={items} mode={${p.collapsed ? "\"collapsed\"" : "\"inline\""}} />
  </Layout.Sider>
  <Layout>
    <Layout.Header sticky>Top Bar</Layout.Header>
    <Layout.Content>Content</Layout.Content>
    <Layout.Footer>Bottom bar</Layout.Footer>
  </Layout>
</Layout>`,
};
