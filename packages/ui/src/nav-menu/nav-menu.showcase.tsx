"use client";
import { useState } from "react";
import { LayoutDashboard, Users, Settings, FileText, BarChart3, ShieldCheck, Trash2 } from "lucide-react";
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

// 行尾操作（actions 槽）演示用删除按钮：hover/聚焦才显，用 NavMenu 暴露的 group-hover/nav-row 钩子。
function DeleteAction({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={`删除：${label}`}
      onClick={(e) => e.stopPropagation()}
      className="invisible rounded p-0.5 text-muted opacity-0 transition-opacity hover:text-danger group-hover/nav-row:visible group-hover/nav-row:opacity-100 focus-visible:visible focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}

// 仿 ChatGPT/DeepSeek 会话列表：分时间组 + 每行尾部 hover 显删除（删除按钮渲在行按钮外，无嵌套）。
const CONVO_ITEMS: NavMenuNode[] = [
  {
    type: "group",
    key: "today",
    label: "今天",
    children: [
      { key: "c1", label: "瑚琏组件库怎么接入", actions: <DeleteAction label="瑚琏组件库怎么接入" /> },
      { key: "c2", label: "帮我润色一封周报", actions: <DeleteAction label="帮我润色一封周报" /> },
    ],
  },
  {
    type: "group",
    key: "yesterday",
    label: "昨天",
    children: [
      { key: "c3", label: "解释 React Server Components", actions: <DeleteAction label="解释 RSC" /> },
    ],
  },
];

function ConvoDemo() {
  const [sel, setSel] = useState<string[]>(["c1"]);
  return (
    <div className="w-60 rounded-[var(--radius)] border border-border bg-surface p-2">
      <NavMenu items={CONVO_ITEMS} selectedKeys={sel} onSelect={(k) => setSel([k])} />
    </div>
  );
}

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
  examples: [
    {
      title: "基础用法",
      description: "inline 模式下子菜单内联手风琴展开，非受控用 defaultSelectedKeys 设初始选中。",
      code: `<NavMenu
  items={items}
  mode="inline"
  defaultSelectedKeys={["dashboard"]}
/>`,
      render: () => (
        <div className="rounded-[var(--radius)] border border-border bg-surface p-2">
          <NavMenu items={ITEMS} mode="inline" defaultSelectedKeys={["dashboard"]} />
        </div>
      ),
    },
    {
      title: "默认展开子菜单",
      description: "defaultOpenKeys 指定初始展开的父项，配合子项选中定位当前页。",
      code: `<NavMenu
  items={items}
  mode="inline"
  defaultOpenKeys={["users"]}
  defaultSelectedKeys={["users-roles"]}
/>`,
      render: () => (
        <div className="rounded-[var(--radius)] border border-border bg-surface p-2">
          <NavMenu
            items={ITEMS}
            mode="inline"
            defaultOpenKeys={["users"]}
            defaultSelectedKeys={["users-roles"]}
          />
        </div>
      ),
    },
    {
      title: "行尾操作",
      description: "actions 槽渲染在行按钮之外（绝对覆盖右侧），可用 group-hover/nav-row 做 hover 才显。",
      code: `const items = [
  {
    type: "group",
    key: "today",
    label: "今天",
    children: [
      { key: "c1", label: "瑚琏组件库怎么接入", actions: <DeleteAction /> },
      { key: "c2", label: "帮我润色一封周报", actions: <DeleteAction /> },
    ],
  },
];

<NavMenu items={items} defaultSelectedKeys={["c1"]} />`,
      render: () => (
        <div className="w-60 rounded-[var(--radius)] border border-border bg-surface p-2">
          <NavMenu items={CONVO_ITEMS} defaultSelectedKeys={["c1"]} />
        </div>
      ),
    },
    {
      title: "收起态（图标轨）",
      description: "collapsed 模式收起为图标轨，hover / 聚焦时飞出子菜单。",
      code: `<NavMenu
  items={items}
  mode="collapsed"
  defaultSelectedKeys={["dashboard"]}
/>`,
      render: () => (
        <div className="rounded-[var(--radius)] border border-border bg-surface p-2">
          <NavMenu items={ITEMS} mode="collapsed" defaultSelectedKeys={["dashboard"]} />
        </div>
      ),
    },
  ],
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
    {
      name: "inline · 行尾操作 actions（hover 显删除 · 会话列表）",
      render: () => <ConvoDemo />,
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
