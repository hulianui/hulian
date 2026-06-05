"use client";
import { useState } from "react";
import { Bell, Boxes, LayoutDashboard, Settings, ShoppingCart, Users } from "lucide-react";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import type { NavMenuNode } from "../nav-menu/nav-menu.types";
import type { ShowcaseSpec } from "../showcase/types";
import { AdminLayout } from "./admin-layout";

const menu: NavMenuNode[] = [
  { key: "dashboard", label: "仪表盘", icon: <LayoutDashboard className="size-4" /> },
  {
    type: "group",
    key: "g-biz",
    label: "业务管理",
    children: [
      { key: "orders", label: "订单管理", icon: <ShoppingCart className="size-4" /> },
      { key: "products", label: "商品管理", icon: <Boxes className="size-4" /> },
    ],
  },
  {
    key: "users",
    label: "用户中心",
    icon: <Users className="size-4" />,
    children: [
      { key: "user-list", label: "用户列表" },
      { key: "user-roles", label: "角色权限" },
    ],
  },
  { key: "settings", label: "系统设置", icon: <Settings className="size-4" /> },
];

const LABEL: Record<string, string> = {
  dashboard: "仪表盘",
  orders: "订单管理",
  products: "商品管理",
  "user-list": "用户列表",
  "user-roles": "角色权限",
  settings: "系统设置",
};

function Page({ k }: { k: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-foreground">{LABEL[k] ?? k}</h2>
      <p className="text-sm text-muted">
        这是「{LABEL[k] ?? k}」页面内容。点击左侧菜单打开新页签，上方页签可切换 / 关闭，体验中后台 keep-alive 导航。
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="rounded-[var(--radius)] border border-border bg-surface p-4">
            <div className="text-xs text-muted">指标 {i + 1}</div>
            <div className="mt-1 text-xl font-semibold text-foreground">{((i + 1) * 1234).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Demo() {
  const [active, setActive] = useState("dashboard");
  return (
    <div className="h-[560px] w-full overflow-hidden rounded-[var(--radius)] border border-border">
      <AdminLayout
        menuItems={menu}
        logo={<span className="text-base font-bold text-primary">瑚琏 Admin</span>}
        logoCollapsed={<span className="text-base font-bold text-primary">瑚</span>}
        defaultActiveKey="dashboard"
        defaultSelectedKey="dashboard"
        defaultOpenKeys={["users"]}
        onTabChange={setActive}
        breadcrumb={<span className="text-sm text-muted">首页 / {LABEL[active] ?? active}</span>}
        headerExtra={
          <>
            <Badge count={3} size="sm">
              <Bell className="size-5 text-muted" />
            </Badge>
            <Avatar fallback="瑚" />
          </>
        }
      >
        <Page k={active} />
      </AdminLayout>
    </div>
  );
}

export const adminLayoutShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "中后台骨架 · 多页签导航", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<AdminLayout
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
