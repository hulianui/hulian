"use client";
import { useState } from "react";
import {
  Activity,
  BarChart3,
  Ban,
  Braces,
  CalendarDays,
  ClipboardCheck,
  Database,
  FileSearch,
  GitBranch,
  Inbox,
  KanbanSquare,
  KeyRound,
  Rocket,
  ScrollText,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  TerminalSquare,
  Users,
} from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { AppLauncher } from "./app-launcher";
import type { AppLauncherItem } from "./app-launcher.types";

// 图标一律本地生成（token 渐变方块 + lucide 线性图标）：文档站门禁禁远程资源，也免得示例依赖外网。
//
// 这里刻意演示的是**中后台系统的应用中心**，不是 macOS 启动台里的第三方 App。
// 后者的题材天然需要品牌位图（微信 / Chrome / VSCode），示例只能拿 emoji 凑 —— 而 emoji 的
// 渲染不由我们控制（macOS 立体拟物 / Windows 扁平 / Linux 各不相同）、颜色是字体内嵌的、
// 完全不吃主题；底色也只能写裸十六进制，绕开整套 token 体系。showcase 是消费方照抄的地方，
// 这两样都会被一路复制出去（#130）。
//
// 换成工单 / 报表 / 审批 / 日志这类语义，正好能用库内线性图标表达，也才是 AppLauncher
// 真正的使用场景。真要放第三方 App 的品牌位图，见最后一个示例：icon 接受任意 ReactNode。
function Tile({ tone, icon }: { tone: string; icon: React.ReactNode }) {
  return (
    <span
      className="grid size-full place-items-center text-white [&_svg]:size-7"
      style={{
        background: `linear-gradient(145deg, ${tone}, color-mix(in oklab, ${tone} 55%, black))`,
      }}
    >
      {icon}
    </span>
  );
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
    label: "工单中心",
    category: "work",
    section: "recent",
    keywords: ["gongdan", "ticket", "工单"],
    badge: (
      <span className="grid size-4 place-items-center rounded-full bg-danger text-[10px] font-semibold text-danger-foreground">
        9
      </span>
    ),
    icon: <Tile tone={C1} icon={<Inbox />} />,
  },
  {
    id: "approvals",
    label: "审批待办",
    category: "work",
    section: "recent",
    keywords: ["shenpi", "approval", "审批"],
    icon: <Tile tone={C2} icon={<ClipboardCheck />} />,
  },
  {
    id: "board",
    label: "任务看板",
    category: "work",
    section: "recent",
    keywords: ["renwu", "kanban", "任务"],
    icon: <Tile tone={C4} icon={<KanbanSquare />} />,
  },
  {
    id: "schedule",
    label: "排班日程",
    category: "work",
    section: "recent",
    keywords: ["paiban", "schedule", "日程"],
    icon: <Tile tone={C3} icon={<CalendarDays />} />,
  },

  {
    id: "reports",
    label: "报表中心",
    category: "data",
    keywords: ["baobiao", "report", "报表"],
    icon: <Tile tone={C1} icon={<BarChart3 />} />,
  },
  {
    id: "dashboards",
    label: "监控大盘",
    category: "data",
    keywords: ["jiankong", "monitor", "监控"],
    icon: <Tile tone={C5} icon={<Activity />} />,
  },
  {
    id: "datasource",
    label: "数据源",
    category: "data",
    keywords: ["shujuyuan", "database", "数据源"],
    icon: <Tile tone={C2} icon={<Database />} />,
  },
  {
    id: "logs",
    label: "日志检索",
    category: "data",
    keywords: ["rizhi", "log", "日志"],
    icon: <Tile tone={C6} icon={<ScrollText />} />,
  },

  {
    id: "members",
    label: "成员与角色",
    category: "system",
    keywords: ["chengyuan", "member", "成员"],
    icon: <Tile tone={C4} icon={<Users />} />,
  },
  {
    id: "permissions",
    label: "权限策略",
    category: "system",
    keywords: ["quanxian", "permission", "权限"],
    icon: <Tile tone={C1} icon={<ShieldCheck />} />,
  },
  {
    id: "keys",
    label: "密钥管理",
    category: "system",
    keywords: ["miyao", "key", "密钥"],
    icon: <Tile tone={C3} icon={<KeyRound />} />,
  },
  {
    id: "audit",
    label: "操作审计",
    category: "system",
    keywords: ["shenji", "audit", "审计"],
    icon: <Tile tone={C5} icon={<FileSearch />} />,
  },
  {
    id: "settings",
    label: "系统设置",
    category: "system",
    keywords: ["shezhi", "setting", "设置"],
    icon: <Tile tone={C6} icon={<Settings />} />,
  },

  {
    id: "repo",
    label: "代码仓库",
    category: "dev",
    keywords: ["cangku", "repo", "仓库"],
    icon: <Tile tone={C2} icon={<GitBranch />} />,
  },
  {
    id: "pipeline",
    label: "流水线",
    category: "dev",
    keywords: ["liushuixian", "pipeline", "ci"],
    icon: <Tile tone={C4} icon={<Rocket />} />,
  },
  {
    id: "api",
    label: "接口文档",
    category: "dev",
    keywords: ["jiekou", "api", "接口"],
    icon: <Tile tone={C1} icon={<Braces />} />,
  },
  {
    id: "env",
    label: "环境变量",
    category: "dev",
    keywords: ["huanjing", "env", "环境"],
    icon: <Tile tone={C3} icon={<SlidersHorizontal />} />,
  },
  {
    id: "terminal",
    label: "在线终端",
    category: "dev",
    keywords: ["zhongduan", "terminal", "终端"],
    icon: <Tile tone={C6} icon={<TerminalSquare />} />,
  },
];

const categories = [
  { key: "work", label: "日常工作" },
  { key: "data", label: "数据与分析" },
  { key: "system", label: "系统管理" },
  { key: "dev", label: "研发工具" },
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
      <p className="text-xs text-muted-foreground">外部搜索词：{q ? `「${q}」` : "（空）"}</p>
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
            actions={<span className="px-2 text-lg leading-none text-muted-foreground">···</span>}
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
    { id: "tickets", label: "工单中心", icon: <Tile icon={<Inbox />} />, badge: <Dot>9</Dot> },
    { id: "docs", label: "接口文档", icon: <Tile icon={<Braces />} />, href: "#" },
    { id: "old", label: "已下线", icon: <Tile icon={<Ban />} />, disabled: true },
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
            apps.find((a) => a.id === "tickets")!,
            {
              id: "docs",
              label: "接口文档",
              icon: <Tile tone={C1} icon={<Braces />} />,
              href: "#",
            },
            {
              id: "old",
              label: "已下线",
              icon: <Tile tone={C6} icon={<Ban />} />,
              disabled: true,
            },
          ]}
        />
      ),
    },
    {
      title: "自定义图标：icon 接受任意 ReactNode",
      description:
        "上面几个示例用线性图标是因为「中后台应用中心」的语义能被它表达；真要做第三方 App 启动台，icon 里塞品牌位图 / 自定义 SVG 即可——那类图标本就不该进通用图标库。",
      code: `<AppLauncher
  items={[
    { id: "brand", label: "自建应用", icon: <img src="/logo.png" alt="" className="size-full object-cover" /> },
    { id: "svg", label: "自定义 SVG", icon: <MyBrandMark className="size-full" /> },
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
            {
              id: "brand",
              label: "自建应用",
              // 位图占位用内联 SVG 生成，文档站门禁禁远程资源；真实项目这里就是 <img src="/logo.png" />
              icon: (
                <svg viewBox="0 0 64 64" className="size-full" aria-hidden>
                  <rect width="64" height="64" fill="var(--color-chart-4)" />
                  <circle cx="32" cy="26" r="12" fill="var(--color-chart-3)" />
                  <rect x="12" y="42" width="40" height="10" rx="5" fill="var(--color-bg)" />
                </svg>
              ),
            },
            {
              id: "svg",
              label: "自定义 SVG",
              icon: (
                <svg viewBox="0 0 64 64" className="size-full" aria-hidden>
                  <rect width="64" height="64" fill="var(--color-chart-1)" />
                  <path d="M18 40 L32 18 L46 40 Z" fill="var(--color-bg)" />
                </svg>
              ),
            },
            {
              id: "mono",
              label: "字形图标",
              icon: (
                <span className="grid size-full place-items-center bg-foreground text-2xl font-semibold text-bg">
                  瑚
                </span>
              ),
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
