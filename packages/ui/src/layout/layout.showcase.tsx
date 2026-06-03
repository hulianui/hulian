"use client";
import { Gauge, LayoutGrid, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Layout } from "./layout";

// 侧栏示意菜单：icon 常驻、label 在收起态被窄宽度裁切（真实消费者会按 collapsed 隐藏 label）。
const navItems: { icon: ReactNode; label: string; active?: boolean }[] = [
  { icon: <Gauge className="size-5 shrink-0" />, label: "仪表盘", active: true },
  { icon: <LayoutGrid className="size-5 shrink-0" />, label: "工作台" },
  { icon: <Users className="size-5 shrink-0" />, label: "用户管理" },
  { icon: <Settings className="size-5 shrink-0" />, label: "系统设置" },
];

function SiderNav() {
  return (
    <nav className="flex flex-col gap-1 p-2">
      <div className="px-3 py-3 text-sm font-semibold text-foreground">瑚琏控制台</div>
      {navItems.map((it) => (
        <a
          key={it.label}
          href="#"
          onClick={(e) => e.preventDefault()}
          className={
            "flex items-center gap-3 whitespace-nowrap rounded-[min(var(--radius),0.5rem)] px-3 py-2 text-sm transition-colors " +
            (it.active
              ? "bg-primary/12 font-medium text-primary"
              : "text-muted hover:bg-surface-hover hover:text-foreground")
          }
        >
          {it.icon}
          <span>{it.label}</span>
        </a>
      ))}
    </nav>
  );
}

function FillerContent() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">页面内容</h2>
      {Array.from({ length: 8 }, (_, i) => (
        <p key={i} className="text-sm text-muted">
          第 {i + 1} 段占位内容 —— Content 区 flex-auto 占满并独立滚动，Header 可吸顶、Footer 沉底。
        </p>
      ))}
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="h-[360px] w-full max-w-3xl overflow-hidden rounded-[var(--radius)] border border-border">
      {children}
    </div>
  );
}

// 经典：左 Sider（可折叠）+ 右(Header 顶 / Content 中 / Footer 底)。
function ClassicShell({
  collapsed,
  collapsible = true,
  defaultCollapsed,
  collapsedWidth,
  breakpoint,
}: {
  collapsed?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapsedWidth?: number;
  breakpoint?: "md";
}) {
  return (
    <Layout className="h-full">
      <Layout.Sider
        collapsible={collapsible}
        collapsed={collapsed}
        defaultCollapsed={defaultCollapsed}
        collapsedWidth={collapsedWidth}
        breakpoint={breakpoint}
      >
        <SiderNav />
      </Layout.Sider>
      <Layout>
        <Layout.Header sticky>
          <span className="font-medium text-foreground">中后台外壳</span>
          <span className="ml-auto text-sm text-muted">user@hulian</span>
        </Layout.Header>
        <Layout.Content>
          <FillerContent />
        </Layout.Content>
        <Layout.Footer>瑚琏 Layout · © 2026</Layout.Footer>
      </Layout>
    </Layout>
  );
}

export const layoutShowcase: ShowcaseSpec = {
  controls: [
    { prop: "collapsed", type: "boolean", defaultValue: false, label: "收起侧栏" },
  ],
  states: [
    {
      name: "经典中后台（左 Sider + Header/Content/Footer，可折叠）",
      render: () => (
        <Frame>
          <ClassicShell />
        </Frame>
      ),
    },
    {
      name: "Header 通栏在上（Header / [Sider + Content] / Footer）",
      render: () => (
        <Frame>
          <Layout className="h-full">
            <Layout.Header>
              <span className="font-medium text-foreground">通栏头部</span>
            </Layout.Header>
            <Layout>
              <Layout.Sider collapsible width={200}>
                <SiderNav />
              </Layout.Sider>
              <Layout.Content>
                <FillerContent />
              </Layout.Content>
            </Layout>
            <Layout.Footer>底部通栏 · © 2026</Layout.Footer>
          </Layout>
        </Frame>
      ),
    },
    {
      name: "默认收起 + 自定义 collapsedWidth(56)",
      render: () => (
        <Frame>
          <ClassicShell defaultCollapsed collapsedWidth={56} />
        </Frame>
      ),
    },
    {
      name: "响应式断点(md)：窄屏自动收起",
      render: () => (
        <Frame>
          <ClassicShell breakpoint="md" />
        </Frame>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Frame>
      <ClassicShell collapsed={Boolean(p.collapsed)} />
    </Frame>
  ),
  toCode: (p) => `<Layout>
  <Layout.Sider collapsible${p.collapsed ? " collapsed" : ""}>
    <SiderNav />
  </Layout.Sider>
  <Layout>
    <Layout.Header sticky>顶栏</Layout.Header>
    <Layout.Content>内容</Layout.Content>
    <Layout.Footer>底栏</Layout.Footer>
  </Layout>
</Layout>`,
};
