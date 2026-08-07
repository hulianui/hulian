"use client";
import { useState } from "react";
import { LayoutDashboard, Users, Settings, FileText, BarChart3, ShieldCheck, Trash2, } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { NavMenu } from "../../../../packages/ui/src/nav-menu/nav-menu";
import type { NavMenuNode } from "../../../../packages/ui/src/nav-menu/nav-menu.types";
const ITEMS: NavMenuNode[] = [
    {
        key: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard />,
        href: "#",
    },
    {
        type: "group",
        key: "g-manage",
        label: "Operation Management",
        children: [
            {
                key: "users",
                label: "User",
                icon: <Users />,
                children: [
                    { key: "users-list", label: "User List", href: "#" },
                    { key: "users-roles", label: "Role permissions", href: "#" },
                    { key: "users-audit", label: "Operational Audit", href: "#" },
                ],
            },
            {
                key: "content",
                label: "Contents",
                icon: <FileText />,
                children: [
                    { key: "content-posts", label: "Article", href: "#" },
                    {
                        key: "content-comments",
                        label: "Comments",
                        href: "#",
                        disabled: true,
                    },
                ],
            },
            {
                key: "analytics",
                label: "Data Analysis",
                icon: <BarChart3 />,
                href: "#",
            },
        ],
    },
    {
        type: "group",
        key: "g-system",
        label: "System",
        children: [
            {
                key: "security",
                label: "Security Center",
                icon: <ShieldCheck />,
                href: "#",
            },
            {
                key: "settings",
                label: "Settings",
                icon: <Settings />,
                href: "#",
                disabled: true,
            },
        ],
    },
];
const DEEP_ITEMS: NavMenuNode[] = [
    {
        key: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard />,
        href: "#",
    },
    {
        key: "sys",
        label: "System Management",
        icon: <Settings />,
        children: [
            {
                key: "sys-user",
                label: "Users and Permissions",
                children: [
                    {
                        key: "sys-user-role",
                        label: "Role",
                        children: [
                            {
                                key: "sys-user-role-list",
                                label: "Character List",
                                href: "#",
                            },
                            {
                                key: "sys-user-role-perm",
                                label: "Permission allocation",
                                href: "#",
                            },
                        ],
                    },
                    { key: "sys-user-list", label: "User List", href: "#" },
                ],
            },
            {
                key: "sys-log",
                label: "Log",
                children: [
                    { key: "sys-log-login", label: "Login log", href: "#" },
                    { key: "sys-log-error", label: "Error log", href: "#" },
                ],
            },
        ],
    },
    {
        key: "security",
        label: "Security Center",
        icon: <ShieldCheck />,
        href: "#",
    },
];
function DeleteAction({ label }: {
    label: string;
}) {
    return (<button type="button" aria-label={`Delete:${label}`} onClick={(e) => e.stopPropagation()} className="invisible rounded p-0.5 text-muted opacity-0 transition-opacity hover:text-danger group-hover/nav-row:visible group-hover/nav-row:opacity-100 focus-visible:visible focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
      <Trash2 className="size-3.5"/>
    </button>);
}
const CONVO_ITEMS: NavMenuNode[] = [
    {
        type: "group",
        key: "today",
        label: "Today",
        children: [
            {
                key: "c1",
                label: "How to access Hulian component library",
                actions: <DeleteAction label="How to access Hulian component library"/>,
            },
            { key: "c2", label: "Help me polish a weekly report", actions: <DeleteAction label="Help me polish a weekly report"/> },
        ],
    },
    {
        type: "group",
        key: "yesterday",
        label: "Yesterday",
        children: [
            {
                key: "c3",
                label: "Explanation React Server Components",
                actions: <DeleteAction label="Explanation RSC"/>,
            },
        ],
    },
];
function ConvoDemo() {
    const [sel, setSel] = useState<string[]>(["c1"]);
    return (<div className="w-60 rounded-[var(--radius)] border border-border bg-surface p-2">
      <NavMenu items={CONVO_ITEMS} selectedKeys={sel} onSelect={(k) => setSel([k])}/>
    </div>);
}
function Demo(props: {
    mode?: "inline" | "collapsed";
    defaultOpenKeys?: string[];
    defaultSelectedKeys?: string[];
}) {
    const [selected, setSelected] = useState<string[]>(props.defaultSelectedKeys ?? ["dashboard"]);
    return (<div className="rounded-[var(--radius)] border border-border bg-surface p-2">
      <NavMenu items={ITEMS} mode={props.mode} selectedKeys={selected} defaultOpenKeys={props.defaultOpenKeys} onSelect={(key) => setSelected([key])}/>
    </div>);
}
export const navMenuShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "In inline mode, the accordion in the submenu is expanded, and for uncontrolled use, defaultSelectedKeys is initially selected.",
            code: `<NavMenu
  items={items}
  mode="inline"
  defaultSelectedKeys={["dashboard"]}
/>`,
            render: () => (<div className="rounded-[var(--radius)] border border-border bg-surface p-2">
          <NavMenu items={ITEMS} mode="inline" defaultSelectedKeys={["dashboard"]}/>
        </div>),
        },
        {
            title: "Site main navigation semantics (semantics=\"list\")",
            description: "The default tree file is added to the line with role=treeitem, which will override the implicit link role of <a> - even the main navigation in the screen reading \"List all links on the page\" cannot be listed. The list file does not write role: <a> is link, <button> is button, and the keyboard returns to Tab item-by-item + native activation. The skin is exactly the same, only the accessibility tree has been changed. The file tree/outline tree is left at the default tree file.",
            code: `<NavMenu
  items={items}
  semantics="list"
  defaultSelectedKeys={["dashboard"]}
/>`,
            render: () => (<div className="rounded-[var(--radius)] border border-border bg-surface p-2">
          <NavMenu items={ITEMS} semantics="list" defaultSelectedKeys={["dashboard"]}/>
        </div>),
        },
        {
            title: "Expand submenu by default",
            description: "defaultOpenKeys Specifies the parent item for initial expansion, and selects and locates the current page in conjunction with the child item.",
            code: `<NavMenu
  items={items}
  mode="inline"
  defaultOpenKeys={["users"]}
  defaultSelectedKeys={["users-roles"]}
/>`,
            render: () => (<div className="rounded-[var(--radius)] border border-border bg-surface p-2">
          <NavMenu items={ITEMS} mode="inline" defaultOpenKeys={["users"]} defaultSelectedKeys={["users-roles"]}/>
        </div>),
        },
        {
            title: "End of line operation",
            description: "The actions slot is rendered outside the row button (absolutely covering the right side), and can be displayed using group-hover/nav-row instead of hover.",
            code: `const items = [
  {
    type: "group",
    key: "today",
    label: "Today",
    children: [
      { key: "c1", label: "How to access the Hulian component library", actions: <DeleteAction /> },
      { key: "c2", label: "Help me polish a weekly report", actions: <DeleteAction /> },
    ],
  },
];

<NavMenu items={items} defaultSelectedKeys={["c1"]} />`,
            render: () => (<div className="w-60 rounded-[var(--radius)] border border-border bg-surface p-2">
          <NavMenu items={CONVO_ITEMS} defaultSelectedKeys={["c1"]}/>
        </div>),
        },
        {
            title: "Collapsed state (icon track)",
            description: "collapsed mode collapses into an icon track, hover / submenu pops up when focused.",
            code: `<NavMenu
  items={items}
  mode="collapsed"
  defaultSelectedKeys={["dashboard"]}
/>`,
            render: () => (<div className="rounded-[var(--radius)] border border-border bg-surface p-2">
          <NavMenu items={ITEMS} mode="collapsed" defaultSelectedKeys={["dashboard"]}/>
        </div>),
        },
        {
            title: "Collapse \u00B7 Multi-level cascade",
            description: "The fly-out layer of collapsed supports infinite levels like inline: sub-layers are cascaded to the right step by step. Keyboard \u2192 enters the sub-layer, \u2190 / Esc returns to the parent layer, \u2191\u2193 moves between brothers on the same layer.",
            code: `const items = [
  {
    key: "sys",
    label: "System Management",
    icon: <Settings />,
    children: [
      {
        key: "sys-user",
        label: "Users and Permissions",
        children: [
          {
            key: "sys-user-role",
            label: "Character",
            children: [
              { key: "sys-user-role-list", label: "Character List", href: "#" },
              { key: "sys-user-role-perm", label: "Permission allocation", href: "#" },
            ],
          },
        ],
      },
    ],
  },
];

<NavMenu items={items} mode="collapsed" defaultSelectedKeys={["sys-user-role-perm"]} />`,
            render: () => (<div className="rounded-[var(--radius)] border border-border bg-surface p-2">
          <NavMenu items={DEEP_ITEMS} mode="collapsed" defaultSelectedKeys={["sys-user-role-perm"]}/>
        </div>),
        },
    ],
    controls: [
        {
            prop: "mode",
            type: "select",
            options: ["inline", "collapsed"],
            defaultValue: "inline",
            label: "mode (expand/collapse)",
        },
    ],
    states: [
        { name: "inline (default collapse submenu)", render: () => <Demo mode="inline"/> },
        {
            name: "inline \u00B7 Expand + Select sub-items",
            render: () => (<Demo mode="inline" defaultOpenKeys={["users"]} defaultSelectedKeys={["users-roles"]}/>),
        },
        {
            name: "inline \u00B7 End of line operation actions (hover explicit delete \u00B7 Session list)",
            render: () => <ConvoDemo />,
        },
        { name: "collapsed (icon track\u00B7floating out)", render: () => <Demo mode="collapsed"/> },
        {
            name: "collapsed \u00B7 Multi-level cascading fly-out (level four)",
            render: () => (<div className="rounded-[var(--radius)] border border-border bg-surface p-2">
          <NavMenu items={DEEP_ITEMS} mode="collapsed" defaultSelectedKeys={["sys-user-role-perm"]}/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<Demo mode={p.mode as "inline" | "collapsed"} defaultOpenKeys={["users"]} defaultSelectedKeys={["users-roles"]}/>),
    toCode: (p) => `<NavMenu
  mode="${(p.mode as string) ?? "inline"}"
  items={items}
  defaultOpenKeys={["users"]}
  selectedKeys={selected}
  onSelect={(key) => setSelected([key])}
/>`,
};
