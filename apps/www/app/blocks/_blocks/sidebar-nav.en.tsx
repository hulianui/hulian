"use client";
import { useState } from "react";
import { Avatar, Badge, Button } from "@hulianui/ui";
import { BarChart3, Bell, ChevronsLeft, ChevronsRight, CreditCard, FileText, LayoutDashboard, Settings, ShieldCheck, Users, } from "lucide-react";
const GROUPS = [
    {
        title: "Overview",
        items: [
            { key: "dashboard", label: "Workspace", icon: LayoutDashboard },
            { key: "analytics", label: "Data analysis", icon: BarChart3 },
        ],
    },
    {
        title: "business",
        items: [
            { key: "customers", label: "Customer management", icon: Users, count: 12 },
            { key: "billing", label: "Billing", icon: CreditCard },
            { key: "docs", label: "Documentation", icon: FileText },
            { key: "alerts", label: "Alert notifications", icon: Bell, count: 5 },
        ],
    },
    {
        title: "system",
        items: [
            { key: "security", label: "Security and compliance", icon: ShieldCheck },
            { key: "settings", label: "System settings", icon: Settings },
        ],
    },
] as const;
export function SidebarNavBlock() {
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("customers");
    return (<div className="flex h-[560px] overflow-hidden rounded-[var(--radius)] border border-border bg-bg">
      <aside className="flex flex-col border-r border-border bg-surface transition-[width] duration-200" style={{ width: collapsed ? 56 : 220 }}>

        <div className="flex h-14 items-center gap-2 border-b border-border px-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-[var(--radius)] text-sm font-bold text-primary-foreground" style={{
            backgroundImage: "linear-gradient(135deg, var(--color-primary), var(--color-chart-2))",
        }} aria-hidden>
            Han
          </div>
          {!collapsed && (<span className="flex-1 truncate text-sm font-semibold text-foreground">
              HanCloud console
            </span>)}
          <Button variant="ghost" size="iconSm" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="shrink-0">
            {collapsed ? (<ChevronsRight className="size-4"/>) : (<ChevronsLeft className="size-4"/>)}
          </Button>
        </div>


        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {GROUPS.map((group) => (<div key={group.title} className="mb-3 last:mb-0">
              {!collapsed && (<div className="px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {group.title}
                </div>)}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                const isActive = active === item.key;
                const count = "count" in item ? item.count : undefined;
                return (<li key={item.key}>
                      <button type="button" onClick={() => setActive(item.key)} title={collapsed ? item.label : undefined} className={[
                        "flex w-full items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm font-medium transition-colors",
                        collapsed ? "justify-center" : "",
                        isActive
                            ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                    ].join(" ")}>

                        {collapsed && count ? (<Badge dot tone="danger" offset={[2, -2]}>
                            <item.icon className="size-[18px] shrink-0"/>
                          </Badge>) : (<item.icon className="size-[18px] shrink-0"/>)}
                        {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
                        {!collapsed && count ? (<Badge count={count} tone={item.key === "alerts" ? "danger" : "neutral"} size="sm"/>) : null}
                      </button>
                    </li>);
            })}
              </ul>
            </div>))}
        </nav>


        <div className="border-t border-border p-2">
          <div className={[
            "flex items-center gap-2 rounded-[var(--radius)] p-1.5 hover:bg-surface-hover",
            collapsed ? "justify-center" : "",
        ].join(" ")}>
            <Avatar fallback="Lin" size="sm"/>
            {!collapsed && (<>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">Lin Wanqing</div>
                  <div className="truncate text-xs text-muted-foreground">Administrator</div>
                </div>
                <Button variant="ghost" size="iconSm" aria-label="Account settings" className="shrink-0">
                  <Settings className="size-4"/>
                </Button>
              </>)}
          </div>
        </div>
      </aside>


      <div className="hidden flex-1 items-center justify-center p-8 text-sm text-muted-foreground sm:flex">
        Main content area
      </div>
    </div>);
}
