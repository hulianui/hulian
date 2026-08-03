"use client";
import { useState } from "react";
import { Bell, Boxes, LayoutDashboard, Settings, ShoppingCart, Users } from "lucide-react";
import { Avatar } from "../../../../packages/ui/src/avatar";
import { Badge } from "../../../../packages/ui/src/badge";
import type { NavMenuNode } from "../../../../packages/ui/src/nav-menu/nav-menu.types";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AdminLayout } from "../../../../packages/ui/src/admin-layout/admin-layout";
const menu: NavMenuNode[] = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-4"/> },
    {
        type: "group",
        key: "g-biz",
        label: "Business Management",
        children: [
            { key: "orders", label: "Order Management", icon: <ShoppingCart className="size-4"/> },
            { key: "products", label: "Product Management", icon: <Boxes className="size-4"/> },
        ],
    },
    {
        key: "users",
        label: "User Center",
        icon: <Users className="size-4"/>,
        children: [
            { key: "user-list", label: "User List" },
            { key: "user-roles", label: "Role permissions" },
        ],
    },
    { key: "settings", label: "System Settings", icon: <Settings className="size-4"/> },
];
const LABEL: Record<string, string> = {
    dashboard: "Dashboard",
    orders: "Order Management",
    products: "Product Management",
    "user-list": "User List",
    "user-roles": "Role permissions",
    settings: "System Settings",
};
function Page({ k }: {
    k: string;
}) {
    return (<div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-foreground">{LABEL[k] ?? k}</h2>
      <p className="text-sm text-muted">
        This is "{LABEL[k] ?? k}" page content. Click the menu on the left to open a new tab. The tab above can be switched/closed to experience the middle and backend keep-alive navigation.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (<div key={i} className="rounded-[var(--radius)] border border-border bg-surface p-4">
            <div className="text-xs text-muted">Indicators {i + 1}</div>
            <div className="mt-1 text-xl font-semibold text-foreground">{((i + 1) * 1234).toLocaleString()}</div>
          </div>))}
      </div>
    </div>);
}
function Demo() {
    const [active, setActive] = useState("dashboard");
    return (<div className="h-[560px] w-full overflow-hidden rounded-[var(--radius)] border border-border">
      <AdminLayout fitViewport={false} menuItems={menu} logo={<span className="text-base font-bold text-primary">Hulian Admin</span>} logoCollapsed={<span className="text-base font-bold text-primary">Hu</span>} defaultActiveKey="dashboard" defaultSelectedKey="dashboard" defaultOpenKeys={["users"]} onTabChange={setActive} breadcrumb={<span className="text-sm text-muted">Home / {LABEL[active] ?? active}</span>} headerExtra={<>
            <Badge count={3} size="sm">
              <Bell className="size-5 text-muted"/>
            </Badge>
            <Avatar fallback="Hu"/>
          </>}>
        <Page k={active}/>
      </AdminLayout>
    </div>);
}
function StaticPage({ k }: {
    k: string;
}) {
    return <Page k={k}/>;
}
export const adminLayoutShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic skeleton",
            description: "Sidebar brand + NavMenu + top bar + multiple tabs + content area; click the menu to automatically open tabs (uncontrolled).",
            code: `<AdminLayout
  menuItems={menu}
  logo={<span className="font-bold text-primary">Hulian Admin</span>}
  defaultActiveKey="dashboard"
  defaultSelectedKey="dashboard"
  breadcrumb={<span className="text-sm text-muted">Home/Dashboard</span>}
  headerExtra={<Avatar fallback="Hu" />}
>
  <Dashboard />
</AdminLayout>`,
            render: () => (<div className="h-[480px] w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <AdminLayout fitViewport={false} menuItems={menu} logo={<span className="text-base font-bold text-primary">Hulian Admin</span>} logoCollapsed={<span className="text-base font-bold text-primary">Hu</span>} defaultActiveKey="dashboard" defaultSelectedKey="dashboard" defaultOpenKeys={["users"]} breadcrumb={<span className="text-sm text-muted">Home / Dashboard</span>} headerExtra={<>
                <Badge count={3} size="sm">
                  <Bell className="size-5 text-muted"/>
                </Badge>
                <Avatar fallback="Hu"/>
              </>}>
            <StaticPage k="dashboard"/>
          </AdminLayout>
        </div>),
        },
        {
            title: "Close the sidebar by default",
            description: "defaultCollapsed Let the sidebar initially collapse into an icon track, and click the top bar burger to expand it.",
            code: `<AdminLayout
  menuItems={menu}
  logo={<Logo />}
  logoCollapsed={<span>hu</span>}
  defaultCollapsed
  defaultActiveKey="dashboard"
>
  <Dashboard />
</AdminLayout>`,
            render: () => (<div className="h-[480px] w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <AdminLayout fitViewport={false} menuItems={menu} logo={<span className="text-base font-bold text-primary">Hulian Admin</span>} logoCollapsed={<span className="text-base font-bold text-primary">Hu</span>} defaultCollapsed defaultActiveKey="dashboard" defaultSelectedKey="dashboard" breadcrumb={<span className="text-sm text-muted">Home / Dashboard</span>} headerExtra={<Avatar fallback="Hu"/>}>
            <StaticPage k="dashboard"/>
          </AdminLayout>
        </div>),
        },
        {
            title: "Hide multiple tabs",
            description: "showTabs={false} Close the tab bar and reduce it to a single page of content (suitable for a minimalist console).",
            code: `<AdminLayout
  menuItems={menu}
  logo={<Logo />}
  showTabs={false}
  defaultSelectedKey="dashboard"
>
  <Dashboard />
</AdminLayout>`,
            render: () => (<div className="h-[480px] w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <AdminLayout fitViewport={false} menuItems={menu} logo={<span className="text-base font-bold text-primary">Hulian Admin</span>} logoCollapsed={<span className="text-base font-bold text-primary">Hu</span>} showTabs={false} defaultSelectedKey="dashboard" defaultOpenKeys={["users"]} breadcrumb={<span className="text-sm text-muted">Home / Dashboard</span>} headerExtra={<Avatar fallback="Hu"/>}>
            <StaticPage k="dashboard"/>
          </AdminLayout>
        </div>),
        },
    ],
    controls: [],
    states: [{ name: "Middle and backend skeleton \u00B7 Multi-tab navigation", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<AdminLayout
  menuItems={menu}
  logo={<Logo />}
  defaultActiveKey="dashboard"
  onTabChange={setActive}
  breadcrumb={<Breadcrumb />}
  headerExtra={<UserMenu />}
>
  {pageByKey[active]}
</AdminLayout>`,
};
