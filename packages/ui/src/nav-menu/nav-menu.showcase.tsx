"use client";
import { useState } from "react";
import { LayoutDashboard, Users, Settings, FileText, BarChart3, ShieldCheck } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { NavMenu } from "./nav-menu";
import type { NavMenuNode } from "./nav-menu.types";

const ITEMS: NavMenuNode[] = [
  { key: "dashboard", label: "仪表盘", icon: <LayoutDashboard />, href: "#dashboard" },
  {
    type: "group",
    key: "g-manage",
    label: "运营管理",
    children: [
      {
        key: "users",
        label: "用户",
        icon: <Users />,
        children: [
          { key: "users-list", label: "用户列表", href: "#users-list" },
          { key: "users-roles", label: "角色权限", href: "#users-roles" },
          { key: "users-audit", label: "操作审计", href: "#users-audit" },
        ],
      },
      {
        key: "content",
        label: "内容",
        icon: <FileText />,
        children: [
          { key: "content-posts", label: "文章", href: "#content-posts" },
          { key: "content-comments", label: "评论", href: "#content-comments", disabled: true },
        ],
      },
      { key: "analytics", label: "数据分析", icon: <BarChart3 />, href: "#analytics" },
    ],
  },
  {
    type: "group",
    key: "g-system",
    label: "系统",
    children: [
      { key: "security", label: "安全中心", icon: <ShieldCheck />, href: "#security" },
      { key: "settings", label: "设置", icon: <Settings />, href: "#settings", disabled: true },
    ],
  },
];

function Demo(props: {
  mode?: "inline" | "collapsed";
  defaultOpenKeys?: string[];
  defaultSelectedKeys?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(props.defaultSelectedKeys ?? ["dashboard"]);
  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface p-2">
      <NavMenu
        items={ITEMS}
        mode={props.mode}
        selectedKeys={selected}
        defaultOpenKeys={props.defaultOpenKeys}
        onSelect={(key) => setSelected([key])}
      />
    </div>
  );
}

export const navMenuShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "mode",
      type: "select",
      options: ["inline", "collapsed"],
      defaultValue: "inline",
      label: "mode（展开/收起）",
    },
  ],
  states: [
    { name: "inline（默认收起子菜单）", render: () => <Demo mode="inline" /> },
    {
      name: "inline · 展开 + 子项选中",
      render: () => (
        <Demo mode="inline" defaultOpenKeys={["users"]} defaultSelectedKeys={["users-roles"]} />
      ),
    },
    { name: "collapsed（图标轨 · 悬浮飞出）", render: () => <Demo mode="collapsed" /> },
  ],
  renderWithProps: (p) => (
    <Demo
      mode={p.mode as "inline" | "collapsed"}
      defaultOpenKeys={["users"]}
      defaultSelectedKeys={["users-roles"]}
    />
  ),
  toCode: (p) =>
    `<NavMenu\n  mode="${(p.mode as string) ?? "inline"}"\n  items={items}\n  defaultOpenKeys={["users"]}\n  selectedKeys={selected}\n  onSelect={(key) => setSelected([key])}\n/>`,
};
