"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { AppLauncher } from "./app-launcher";
import type { AppLauncherItem } from "./app-launcher.types";

// 图标一律本地生成（渐变方块 + 字形）：文档站门禁禁远程资源，也免得示例依赖外网可用性。
function Tile({
  from,
  to,
  glyph,
  dark,
}: {
  from: string;
  to: string;
  glyph: string;
  dark?: boolean;
}) {
  return (
    <span
      className={`grid size-full place-items-center text-2xl font-semibold ${
        dark ? "text-white" : "text-foreground"
      }`}
      style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
    >
      {glyph}
    </span>
  );
}

const apps: AppLauncherItem[] = [
  {
    id: "ghostty",
    label: "Ghostty",
    category: "dev",
    section: "recent",
    keywords: ["terminal", "zhongduan"],
    icon: <Tile from="#4b5563" to="#111827" glyph="👻" dark />,
  },
  {
    id: "chrome",
    label: "Google Chrome",
    category: "dev",
    section: "recent",
    keywords: ["browser"],
    icon: <Tile from="#ffffff" to="#e5e7eb" glyph="🌐" />,
  },
  {
    id: "vscode",
    label: "Visual Studio Code",
    category: "dev",
    section: "recent",
    keywords: ["vsc", "editor"],
    icon: <Tile from="#e0f2fe" to="#bae6fd" glyph="🧩" />,
  },
  {
    id: "navicat",
    label: "Navicat for MySQL",
    category: "dev",
    section: "recent",
    keywords: ["db", "shujuku"],
    icon: <Tile from="#dcfce7" to="#86efac" glyph="🗄️" />,
  },

  {
    id: "wechat",
    label: "微信",
    category: "social",
    keywords: ["weixin", "wx"],
    icon: <Tile from="#22c55e" to="#15803d" glyph="💬" dark />,
  },
  {
    id: "qq",
    label: "QQ",
    category: "social",
    keywords: ["penguin"],
    icon: <Tile from="#ffffff" to="#e5e7eb" glyph="🐧" />,
  },
  {
    id: "mail",
    label: "邮件",
    category: "social",
    keywords: ["mail", "youjian"],
    badge: (
      <span className="grid size-4 place-items-center rounded-full bg-danger text-[10px] font-semibold text-danger-foreground">
        9
      </span>
    ),
    icon: <Tile from="#60a5fa" to="#2563eb" glyph="✉️" dark />,
  },

  {
    id: "notes",
    label: "备忘录",
    category: "tool",
    keywords: ["notes", "beiwanglu"],
    icon: <Tile from="#fef9c3" to="#fde68a" glyph="📝" />,
  },
  {
    id: "calc",
    label: "计算器",
    category: "tool",
    keywords: ["calculator", "jisuanqi"],
    icon: <Tile from="#e5e7eb" to="#9ca3af" glyph="🧮" />,
  },
  {
    id: "clock",
    label: "时钟",
    category: "tool",
    keywords: ["clock", "shizhong"],
    icon: <Tile from="#ffffff" to="#d1d5db" glyph="🕘" />,
  },
  {
    id: "maps",
    label: "地图",
    category: "tool",
    keywords: ["maps", "ditu"],
    icon: <Tile from="#bbf7d0" to="#4ade80" glyph="🗺️" />,
  },
  {
    id: "netdisk",
    label: "百度网盘",
    category: "tool",
    keywords: ["baidu", "wangpan"],
    icon: <Tile from="#dbeafe" to="#93c5fd" glyph="☁️" />,
  },

  {
    id: "stocks",
    label: "股市",
    category: "finance",
    keywords: ["stocks", "gushi"],
    icon: <Tile from="#111827" to="#374151" glyph="📈" dark />,
  },
  {
    id: "sheets",
    label: "表格",
    category: "finance",
    keywords: ["sheets", "biaoge"],
    icon: <Tile from="#34d399" to="#059669" glyph="📊" dark />,
  },
  {
    id: "invoice",
    label: "发票助手",
    category: "finance",
    keywords: ["fapiao"],
    icon: <Tile from="#fed7aa" to="#fb923c" glyph="🧾" />,
  },

  {
    id: "books",
    label: "图书",
    category: "read",
    keywords: ["books", "tushu"],
    icon: <Tile from="#fde68a" to="#f59e0b" glyph="📚" />,
  },
  {
    id: "podcast",
    label: "播客",
    category: "read",
    keywords: ["podcast", "boke"],
    icon: <Tile from="#c084fc" to="#7c3aed" glyph="🎙️" dark />,
  },
  {
    id: "news",
    label: "新闻",
    category: "read",
    keywords: ["news", "xinwen"],
    icon: <Tile from="#fecaca" to="#ef4444" glyph="📰" dark />,
  },
];

const categories = [
  { key: "dev", label: "开发者工具" },
  { key: "tool", label: "工具" },
  { key: "social", label: "社交" },
  { key: "finance", label: "效率与财务" },
  { key: "read", label: "信息与阅读" },
];

/** 演示毛玻璃需要身后有底图，否则看不出「玻璃」。 */
function Desk({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full rounded-[var(--radius)] p-6"
      style={{
        background:
          "radial-gradient(120% 120% at 20% 10%, color-mix(in oklch, var(--color-primary) 55%, transparent), transparent 60%), radial-gradient(100% 100% at 85% 80%, color-mix(in oklch, var(--color-chart-4) 55%, transparent), transparent 55%), var(--color-surface-hover)",
      }}
    >
      {children}
    </div>
  );
}

function Controlled() {
  const [q, setQ] = useState("");
  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-xs text-muted">外部搜索词：{q ? `「${q}」` : "（空）"}</p>
      <AppLauncher
        items={apps}
        categories={categories}
        title="应用程序"
        search={q}
        onSearchChange={setQ}
        columns={6}
        className="h-[26rem]"
      />
    </div>
  );
}

export const appLauncherShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "毛玻璃面板 + 搜索（标题即 placeholder）+ 分类胶囊 + 图标网格；方向键可在网格里漫游。",
      code: `<AppLauncher
  items={apps}                     // [{ id, label, icon, category, section }]
  categories={categories}
  title="应用程序"
  logo={<Logo />}
  actions={<IconButton>···</IconButton>}
  className="h-[28rem]"
/>`,
      render: () => (
        <Desk>
          <AppLauncher
            items={apps}
            categories={categories}
            title="应用程序"
            logo={
              <span className="grid size-7 place-items-center rounded-[var(--radius)] bg-foreground/10 text-sm">
                瑚
              </span>
            }
            actions={<span className="px-2 text-lg leading-none text-muted">···</span>}
            className="h-[28rem]"
          />
        </Desk>
      ),
    },
    {
      title: "分节 · 列数 · 实底皮肤",
      description:
        '连续同 section 的项归一组、组间自动分隔线；columns 调列数；variant="solid" 用在无底图处。',
      code: `<AppLauncher
  items={apps}          // 前 4 项 section="recent" → 自成一组
  columns={4}
  variant="solid"
  searchable={false}
  title="工作台"
/>`,
      render: () => (
        <AppLauncher
          items={apps.slice(0, 10)}
          columns={4}
          variant="solid"
          searchable={false}
          title="工作台"
          className="max-w-md"
        />
      ),
    },
    {
      title: "受控搜索",
      description: "search + onSearchChange 交给外部：搜索词可与路由 query、其它面板共享同一真源。",
      code: `const [q, setQ] = useState("")

<AppLauncher items={apps} search={q} onSearchChange={setQ} title="应用程序" />`,
      render: () => <Controlled />,
    },
    {
      title: "角标 · 链接项 · 停用项",
      description: "badge 挂图标角上；href 让条目成 <a>；disabled 不可点也不进 tab 顺序。",
      code: `<AppLauncher
  items={[
    { id: "mail", label: "邮件", icon: <MailIcon />, badge: <Dot>9</Dot> },
    { id: "docs", label: "文档", icon: <DocIcon />, href: "/docs" },
    { id: "old", label: "已下线", icon: <OldIcon />, disabled: true },
  ]}
  searchable={false}
  columns={3}
/>`,
      render: () => (
        <AppLauncher
          searchable={false}
          columns={3}
          className="max-w-xs"
          items={[
            apps.find((a) => a.id === "mail")!,
            {
              id: "docs",
              label: "文档",
              icon: <Tile from="#e0e7ff" to="#a5b4fc" glyph="📄" />,
              href: "https://example.com/#docs",
            },
            {
              id: "old",
              label: "已下线",
              icon: <Tile from="#e5e7eb" to="#9ca3af" glyph="🚫" />,
              disabled: true,
            },
          ]}
        />
      ),
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
      name: "默认（毛玻璃 · 搜索 · 分类）",
      render: () => (
        <Desk>
          <AppLauncher
            items={apps}
            categories={categories}
            title="应用程序"
            className="h-[28rem]"
          />
        </Desk>
      ),
    },
    {
      name: "分节 · 4 列 · 实底",
      render: () => (
        <AppLauncher
          items={apps.slice(0, 10)}
          columns={4}
          variant="solid"
          searchable={false}
          title="工作台"
          className="max-w-md"
        />
      ),
    },
    { name: "受控搜索", render: () => <Controlled /> },
    {
      name: "空结果",
      render: () => (
        <AppLauncher
          items={apps}
          search="不存在的应用"
          title="应用程序"
          variant="solid"
          className="max-w-md"
        />
      ),
    },
  ],
  renderWithProps: (p) => (
    <Desk>
      <AppLauncher
        items={apps}
        categories={categories}
        title="应用程序"
        variant={(p.variant as "glass" | "solid") ?? "glass"}
        columns={Number(p.columns ?? 6)}
        iconSize={Number(p.iconSize ?? 64)}
        searchable={p.searchable !== false}
        className="h-[24rem]"
      />
    </Desk>
  ),
  toCode: (p) =>
    `<AppLauncher\n  items={apps}\n  categories={categories}\n  title="应用程序"\n  columns={${
      p.columns ?? 6
    }}${p.variant === "solid" ? '\n  variant="solid"' : ""}${
      p.iconSize && Number(p.iconSize) !== 64 ? `\n  iconSize={${p.iconSize}}` : ""
    }${p.searchable === false ? "\n  searchable={false}" : ""}\n/>`,
};
