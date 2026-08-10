"use client";
import { useState } from "react";
import { Activity, BarChart3, Ban, Braces, CalendarDays, ClipboardCheck, Database, FileSearch, GitBranch, Inbox, KanbanSquare, KeyRound, Rocket, ScrollText, Settings, ShieldCheck, SlidersHorizontal, TerminalSquare, Users, } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AppLauncher } from "../../../../packages/ui/src/app-launcher/app-launcher";
import type { AppLauncherItem } from "../../../../packages/ui/src/app-launcher/app-launcher.types";
function Tile({ tone, icon }: {
    tone: string;
    icon: React.ReactNode;
}) {
    return (<span className="grid size-full place-items-center text-white [&_svg]:size-7" style={{
            background: `linear-gradient(145deg, ${tone}, color-mix(in oklab, ${tone} 55%, black))`,
        }}>
      {icon}
    </span>);
}
const C1 = "var(--color-chart-1)";
const C2 = "var(--color-chart-2)";
const C3 = "var(--color-chart-3)";
const C4 = "var(--color-chart-4)";
const C5 = "var(--color-chart-5)";
const C6 = "var(--color-chart-6)";
const apps: AppLauncherItem[] = [
    {
        id: "tickets",
        label: "Tickets",
        category: "work",
        section: "recent",
        keywords: ["gongdan", "ticket", "ticket"],
        badge: (<span className="grid size-4 place-items-center rounded-full bg-danger text-[10px] font-semibold text-danger-foreground">
        9
      </span>),
        icon: <Tile tone={C1} icon={<Inbox />}/>,
    },
    {
        id: "approvals",
        label: "Approvals",
        category: "work",
        section: "recent",
        keywords: ["shenpi", "approval", "approval"],
        icon: <Tile tone={C2} icon={<ClipboardCheck />}/>,
    },
    {
        id: "board",
        label: "Task board",
        category: "work",
        section: "recent",
        keywords: ["renwu", "kanban", "Task"],
        icon: <Tile tone={C4} icon={<KanbanSquare />}/>,
    },
    {
        id: "schedule",
        label: "Schedule",
        category: "work",
        section: "recent",
        keywords: ["paiban", "schedule", "Schedule"],
        icon: <Tile tone={C3} icon={<CalendarDays />}/>,
    },
    {
        id: "reports",
        label: "Reports",
        category: "data",
        keywords: ["baobiao", "report", "report"],
        icon: <Tile tone={C1} icon={<BarChart3 />}/>,
    },
    {
        id: "dashboards",
        label: "Dashboards",
        category: "data",
        keywords: ["jiankong", "monitor", "monitor"],
        icon: <Tile tone={C5} icon={<Activity />}/>,
    },
    {
        id: "datasource",
        label: "Data sources",
        category: "data",
        keywords: ["shujuyuan", "database", "Data sources"],
        icon: <Tile tone={C2} icon={<Database />}/>,
    },
    {
        id: "logs",
        label: "Log search",
        category: "data",
        keywords: ["rizhi", "log", "Log"],
        icon: <Tile tone={C6} icon={<ScrollText />}/>,
    },
    {
        id: "members",
        label: "Members and roles",
        category: "system",
        keywords: ["chengyuan", "member", "Member"],
        icon: <Tile tone={C4} icon={<Users />}/>,
    },
    {
        id: "permissions",
        label: "Permissions",
        category: "system",
        keywords: ["quanxian", "permission", "permission"],
        icon: <Tile tone={C1} icon={<ShieldCheck />}/>,
    },
    {
        id: "keys",
        label: "API keys",
        category: "system",
        keywords: ["miyao", "key", "key"],
        icon: <Tile tone={C3} icon={<KeyRound />}/>,
    },
    {
        id: "audit",
        label: "Operational Audit",
        category: "system",
        keywords: ["shenji", "audit", "audit"],
        icon: <Tile tone={C5} icon={<FileSearch />}/>,
    },
    {
        id: "settings",
        label: "System Settings",
        category: "system",
        keywords: ["shezhi", "setting", "Settings"],
        icon: <Tile tone={C6} icon={<Settings />}/>,
    },
    {
        id: "repo",
        label: "Repositories",
        category: "dev",
        keywords: ["cangku", "repo", "repo"],
        icon: <Tile tone={C2} icon={<GitBranch />}/>,
    },
    {
        id: "pipeline",
        label: "Pipelines",
        category: "dev",
        keywords: ["liushuixian", "pipeline", "ci"],
        icon: <Tile tone={C4} icon={<Rocket />}/>,
    },
    {
        id: "api",
        label: "API docs",
        category: "dev",
        keywords: ["jiekou", "api", "api"],
        icon: <Tile tone={C1} icon={<Braces />}/>,
    },
    {
        id: "env",
        label: "Environment",
        category: "dev",
        keywords: ["huanjing", "env", "env"],
        icon: <Tile tone={C3} icon={<SlidersHorizontal />}/>,
    },
    {
        id: "terminal",
        label: "Web terminal",
        category: "dev",
        keywords: ["zhongduan", "terminal", "terminal"],
        icon: <Tile tone={C6} icon={<TerminalSquare />}/>,
    },
];
const categories = [
    { key: "work", label: "Daily work" },
    { key: "data", label: "Data and analytics" },
    { key: "system", label: "System Management" },
    { key: "dev", label: "Engineering" },
];
function Desk({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="w-full rounded-[var(--radius)] p-6" style={{
            background: "radial-gradient(120% 120% at 20% 10%, color-mix(in oklch, var(--color-primary) 55%, transparent), transparent 60%), radial-gradient(100% 100% at 85% 80%, color-mix(in oklch, var(--color-chart-4) 55%, transparent), transparent 55%), var(--color-surface-hover)",
        }}>
      {children}
    </div>);
}
function Controlled() {
    const [q, setQ] = useState("");
    return (<div className="flex w-full flex-col gap-2">
      <p className="text-xs text-muted-foreground">External search terms:{q ? `"${q}"
Edit button for` : "(empty)"}</p>
      <AppLauncher items={apps} categories={categories} title="Application" search={q} onSearchChange={setQ} columns={6} className="h-[26rem]"/>
    </div>);
}
export const appLauncherShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Frosted glass panel + search (title is placeholder) + classification capsule + icon grid; arrow keys can roam in the grid.",
            code: `<AppLauncher
  items={apps}                     // [{ id, label, icon, category, section }]
  categories={categories}
  title="Application"
  logo={<Logo />}
  actions={<IconButton>\u00B7\u00B7\u00B7</IconButton>}
  className="h-[28rem]"
/>`,
            render: () => (<Desk>
          <AppLauncher items={apps} categories={categories} title="Application" logo={<span className="grid size-7 place-items-center rounded-[var(--radius)] bg-foreground/10 text-sm">
                Hu
              </span>} actions={<span className="px-2 text-lg leading-none text-muted-foreground">···</span>} className="h-[28rem]"/>
        </Desk>),
        },
        {
            title: "Section \u00B7 Number of columns \u00B7 Solid skin",
            description: "Continuous items with the same section are grouped into one group, with automatic dividing lines between groups; columns adjusts the number of columns; variant=\"solid\" is used where there is no base map.",
            code: `<AppLauncher
  items={apps} // The first 4 items section="recent" \u2192 a group of their own
  columns={4}
  variant="solid"
  searchable={false}
  title="Workbench"
/>`,
            render: () => (<AppLauncher items={apps.slice(0, 10)} columns={4} variant="solid" searchable={false} title="Workbench" className="max-w-md"/>),
        },
        {
            title: "Controlled Search",
            description: "search + onSearchChange Handed to the outside: The search term can share the same true source with the route query and other panels.",
            code: `const [q, setQ] = useState("")

<AppLauncher items={apps} search={q} onSearchChange={setQ} title="Application" />`,
            render: () => <Controlled />,
        },
        {
            title: "Tag \u00B7 Linked items \u00B7 Disabled items",
            description: "badge in the corner of the hanging icon; href makes the entry <a>; disabled cannot be clicked or entered in the tab sequence.",
            code: `<AppLauncher
  items={[
    { id: "tickets", label: "Tickets", icon: <Tile icon={<Inbox />} />, badge: <Dot>9</Dot> },
    { id: "docs", label: "API docs", icon: <Tile icon={<Braces />} />, href: "#" },
    { id: "old", label: "Retired", icon: <Tile icon={<Ban />} />, disabled: true },
  ]}
  searchable={false}
  columns={3}
/>`,
            render: () => (<AppLauncher searchable={false} columns={3} className="max-w-xs" items={[
                    apps.find((a) => a.id === "tickets")!,
                    {
                        id: "docs",
                        label: "API docs",
                        icon: <Tile tone={C1} icon={<Braces />}/>,
                        href: "#",
                    },
                    {
                        id: "old",
                        label: "is offline",
                        icon: <Tile tone={C6} icon={<Ban />}/>,
                        disabled: true,
                    },
                ]}/>),
        },
        {
            title: "Custom icons: icon accepts any ReactNode",
            description: "The examples above use line icons because an internal application centre has semantics they can express. For a real third-party App launcher, pass a brand bitmap or custom SVG through icon \u2014 those belong to the caller, not to a general-purpose icon set.",
            code: `<AppLauncher
  items={[
    { id: "brand", label: "In-house app", icon: <img src="/logo.png" alt="" className="size-full object-cover" /> },
    { id: "svg", label: "Custom SVG", icon: <MyBrandMark className="size-full" /> },
  ]}
  searchable={false}
  columns={3}
/>`,
            render: () => (<AppLauncher searchable={false} columns={3} className="max-w-xs" items={[
                    {
                        id: "brand",
                        label: "In-house app",
                        icon: (<svg viewBox="0 0 64 64" className="size-full" aria-hidden>
                  <rect width="64" height="64" fill="var(--color-chart-4)"/>
                  <circle cx="32" cy="26" r="12" fill="var(--color-chart-3)"/>
                  <rect x="12" y="42" width="40" height="10" rx="5" fill="var(--color-bg)"/>
                </svg>),
                    },
                    {
                        id: "svg",
                        label: "Custom SVG",
                        icon: (<svg viewBox="0 0 64 64" className="size-full" aria-hidden>
                  <rect width="64" height="64" fill="var(--color-chart-1)"/>
                  <path d="M18 40 L32 18 L46 40 Z" fill="var(--color-bg)"/>
                </svg>),
                    },
                    {
                        id: "mono",
                        label: "Glyph icon",
                        icon: (<span className="grid size-full place-items-center bg-foreground text-2xl font-semibold text-bg">
                  Hu
                </span>),
                    },
                ]}/>),
        },
    ],
    controls: [
        { prop: "variant", type: "select", options: ["glass", "solid"], defaultValue: "glass" },
        { prop: "columns", type: "number", defaultValue: 6 },
        { prop: "iconSize", type: "number", defaultValue: 64 },
        { prop: "searchable", type: "boolean", defaultValue: true },
    ],
    states: [
        {
            name: "Default (frosted glass \u00B7 Search \u00B7 Classification)",
            render: () => (<Desk>
          <AppLauncher items={apps} categories={categories} title="Application" className="h-[28rem]"/>
        </Desk>),
        },
        {
            name: "Sectional \u00B7 4 columns \u00B7 Solid bottom",
            render: () => (<AppLauncher items={apps.slice(0, 10)} columns={4} variant="solid" searchable={false} title="Workbench" className="max-w-md"/>),
        },
        { name: "Controlled Search", render: () => <Controlled /> },
        {
            name: "Empty result",
            render: () => (<AppLauncher items={apps} search="Non-existent application" title="Application" variant="solid" className="max-w-md"/>),
        },
    ],
    renderWithProps: (p) => (<Desk>
      <AppLauncher items={apps} categories={categories} title="Application" variant={(p.variant as "glass" | "solid") ?? "glass"} columns={Number(p.columns ?? 6)} iconSize={Number(p.iconSize ?? 64)} searchable={p.searchable !== false} className="h-[24rem]"/>
    </Desk>),
    toCode: (p) => `<AppLauncher
  items={apps}
  categories={categories}
  title="Application"
  columns={${p.columns ?? 6}}${p.variant === "solid" ? "\n  variant=\"solid\"" : ""}${p.iconSize && Number(p.iconSize) !== 64 ? `
  iconSize={${p.iconSize}}` : ""}${p.searchable === false ? "\n  searchable={false}" : ""}
/>`,
};
