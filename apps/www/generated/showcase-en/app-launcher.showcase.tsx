"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AppLauncher } from "../../../../packages/ui/src/app-launcher/app-launcher";
import type { AppLauncherItem } from "../../../../packages/ui/src/app-launcher/app-launcher.types";
function Tile({ from, to, glyph, dark, }: {
    from: string;
    to: string;
    glyph: string;
    dark?: boolean;
}) {
    return (<span className={`grid size-full place-items-center text-2xl font-semibold ${dark ? "text-white" : "text-foreground"}`} style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}>
      {glyph}
    </span>);
}
const apps: AppLauncherItem[] = [
    {
        id: "ghostty",
        label: "Ghostty",
        category: "dev",
        section: "recent",
        keywords: ["terminal", "zhongduan"],
        icon: <Tile from="#4b5563" to="#111827" glyph="👻" dark/>,
    },
    {
        id: "chrome",
        label: "Google Chrome",
        category: "dev",
        section: "recent",
        keywords: ["browser"],
        icon: <Tile from="#ffffff" to="#e5e7eb" glyph="🌐"/>,
    },
    {
        id: "vscode",
        label: "Visual Studio Code",
        category: "dev",
        section: "recent",
        keywords: ["vsc", "editor"],
        icon: <Tile from="#e0f2fe" to="#bae6fd" glyph="🧩"/>,
    },
    {
        id: "navicat",
        label: "Navicat for MySQL",
        category: "dev",
        section: "recent",
        keywords: ["db", "shujuku"],
        icon: <Tile from="#dcfce7" to="#86efac" glyph="🗄️"/>,
    },
    {
        id: "wechat",
        label: "WeChat",
        category: "social",
        keywords: ["weixin", "wx"],
        icon: <Tile from="#22c55e" to="#15803d" glyph="💬" dark/>,
    },
    {
        id: "qq",
        label: "QQ",
        category: "social",
        keywords: ["penguin"],
        icon: <Tile from="#ffffff" to="#e5e7eb" glyph="🐧"/>,
    },
    {
        id: "mail",
        label: "Email",
        category: "social",
        keywords: ["mail", "youjian"],
        badge: (<span className="grid size-4 place-items-center rounded-full bg-danger text-[10px] font-semibold text-danger-foreground">
        9
      </span>),
        icon: <Tile from="#60a5fa" to="#2563eb" glyph="✉️" dark/>,
    },
    {
        id: "notes",
        label: "Memo",
        category: "tool",
        keywords: ["notes", "beiwanglu"],
        icon: <Tile from="#fef9c3" to="#fde68a" glyph="📝"/>,
    },
    {
        id: "calc",
        label: "Calculator",
        category: "tool",
        keywords: ["calculator", "jisuanqi"],
        icon: <Tile from="#e5e7eb" to="#9ca3af" glyph="🧮"/>,
    },
    {
        id: "clock",
        label: "Clock",
        category: "tool",
        keywords: ["clock", "shizhong"],
        icon: <Tile from="#ffffff" to="#d1d5db" glyph="🕘"/>,
    },
    {
        id: "maps",
        label: "Map",
        category: "tool",
        keywords: ["maps", "ditu"],
        icon: <Tile from="#bbf7d0" to="#4ade80" glyph="🗺️"/>,
    },
    {
        id: "netdisk",
        label: "Baidu Netdisk",
        category: "tool",
        keywords: ["baidu", "wangpan"],
        icon: <Tile from="#dbeafe" to="#93c5fd" glyph="☁️"/>,
    },
    {
        id: "stocks",
        label: "Stock Market",
        category: "finance",
        keywords: ["stocks", "gushi"],
        icon: <Tile from="#111827" to="#374151" glyph="📈" dark/>,
    },
    {
        id: "sheets",
        label: "Form",
        category: "finance",
        keywords: ["sheets", "biaoge"],
        icon: <Tile from="#34d399" to="#059669" glyph="📊" dark/>,
    },
    {
        id: "invoice",
        label: "Invoice Assistant",
        category: "finance",
        keywords: ["fapiao"],
        icon: <Tile from="#fed7aa" to="#fb923c" glyph="🧾"/>,
    },
    {
        id: "books",
        label: "Books",
        category: "read",
        keywords: ["books", "tushu"],
        icon: <Tile from="#fde68a" to="#f59e0b" glyph="📚"/>,
    },
    {
        id: "podcast",
        label: "Podcast",
        category: "read",
        keywords: ["podcast", "boke"],
        icon: <Tile from="#c084fc" to="#7c3aed" glyph="🎙️" dark/>,
    },
    {
        id: "news",
        label: "News",
        category: "read",
        keywords: ["news", "xinwen"],
        icon: <Tile from="#fecaca" to="#ef4444" glyph="📰" dark/>,
    },
];
const categories = [
    { key: "dev", label: "Developer Tools" },
    { key: "tool", label: "Tools" },
    { key: "social", label: "Social" },
    { key: "finance", label: "Efficiency and Finance" },
    { key: "read", label: "Information and Reading" },
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
      <p className="text-xs text-muted">External search terms:{q ? `"${q}"
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
              </span>} actions={<span className="px-2 text-lg leading-none text-muted">···</span>} className="h-[28rem]"/>
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
    { id: "mail", label: "Mail", icon: <MailIcon />, badge: <Dot>9</Dot> },
    { id: "docs", label: "Documentation", icon: <DocIcon />, href: "/docs" },
    { id: "old", label: "Offline", icon: <OldIcon />, disabled: true },
  ]}
  searchable={false}
  columns={3}
/>`,
            render: () => (<AppLauncher searchable={false} columns={3} className="max-w-xs" items={[
                    apps.find((a) => a.id === "mail")!,
                    {
                        id: "docs",
                        label: "Documentation",
                        icon: <Tile from="#e0e7ff" to="#a5b4fc" glyph="📄"/>,
                        href: "https://example.com/#docs",
                    },
                    {
                        id: "old",
                        label: "is offline",
                        icon: <Tile from="#e5e7eb" to="#9ca3af" glyph="🚫"/>,
                        disabled: true,
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
