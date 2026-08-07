"use client";
import { useState } from "react";
import { Gauge, LayoutGrid, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { NavMenu } from "../nav-menu/nav-menu";
import type { NavMenuNode } from "../nav-menu/nav-menu.types";
import type { ShowcaseSpec } from "../showcase/types";
import { Layout } from "./layout";

// 侧栏菜单：dogfood 瑚琏 NavMenu —— 收起态直接切到组件自带的 collapsed 图标轨（悬浮飞出），
// 不再手搓「窄宽裁切 label」。Sider 受控持 collapsed，故 mode 与品牌全/简切换都走 React 条件（零 CSS hack）。
const menu: NavMenuNode[] = [
  { key: "dashboard", label: "仪表盘", icon: <Gauge /> },
  { key: "apps", label: "工作台", icon: <LayoutGrid /> },
  { key: "users", label: "用户管理", icon: <Users /> },
  { key: "settings", label: "系统设置", icon: <Settings /> },
];

// Sider + NavMenu 一体演示件：自管 collapsed（受控传给 Sider，trigger/断点回写本地态），
// 并据此驱动 NavMenu 的 mode 与品牌全称/单字标记。
function DemoSider({
  collapsed: collapsedProp,
  collapsible = true,
  defaultCollapsed,
  collapsedWidth,
  width,
  breakpoint,
}: {
  collapsed?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapsedWidth?: number;
  width?: number;
  breakpoint?: "md";
}) {
  const [internal, setInternal] = useState(defaultCollapsed ?? false);
  const collapsed = collapsedProp ?? internal;
  return (
    <Layout.Sider
      collapsible={collapsible}
      collapsed={collapsed}
      collapsedWidth={collapsedWidth}
      width={width}
      breakpoint={breakpoint}
      onCollapse={(c) => setInternal(c)}
    >
      <div
        className={cn(
          "flex h-[var(--hl-layout-header-h)] shrink-0 items-center font-semibold text-primary",
          collapsed ? "justify-center" : "px-4",
        )}
      >
        {collapsed ? "瑚" : "瑚琏控制台"}
      </div>
      <NavMenu
        items={menu}
        mode={collapsed ? "collapsed" : "inline"}
        selectedKeys={["dashboard"]}
        className={collapsed ? "mx-auto py-2" : "w-full p-2"}
      />
    </Layout.Sider>
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
    <Layout className="h-full" hasSider>
      <DemoSider
        collapsible={collapsible}
        collapsed={collapsed}
        defaultCollapsed={defaultCollapsed}
        collapsedWidth={collapsedWidth}
        breakpoint={breakpoint}
      />
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
  examples: [
    {
      title: "经典中后台外壳",
      description: "左侧 Sider + 右侧 Header / Content / Footer，含侧栏时自动横向布局。",
      // 侧栏的**内容**不会自己跟着折叠：Sider 只负责宽度，品牌区显示全称还是单字、
      // NavMenu 走 inline 还是 collapsed，都得消费方自己按折叠态切。所以示例代码必须把
      // 「自管 state + onCollapse 回写」这一步写出来，照抄的人才不会踩（#120）。
      // 品牌区高度用 --hl-layout-header-h，与右侧 Layout.Header 共用同一个数才齐平。
      code: `const [collapsed, setCollapsed] = useState(false)

<Layout className="h-full" hasSider>
  <Layout.Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
    <div className={cn(
      "flex h-[var(--hl-layout-header-h)] items-center font-semibold",
      collapsed ? "justify-center" : "px-4",
    )}>
      {collapsed ? "瑚" : "瑚琏控制台"}
    </div>
    <NavMenu items={items} mode={collapsed ? "collapsed" : "inline"} selectedKeys={["dashboard"]} />
  </Layout.Sider>
  <Layout>
    <Layout.Header sticky>
      <span className="font-medium">中后台外壳</span>
      <span className="ml-auto text-sm text-muted">user@hulian</span>
    </Layout.Header>
    <Layout.Content>{/* 页面内容 */}</Layout.Content>
    <Layout.Footer>瑚琏 Layout · © 2026</Layout.Footer>
  </Layout>
</Layout>`,
      render: () => (
        <Frame>
          <Layout className="h-full" hasSider>
            <DemoSider />
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
        </Frame>
      ),
    },
    {
      title: "通栏头部在上",
      description: "Header 横跨全宽，下方再分 Sider + Content，最外层为纵向布局。",
      code: `<Layout className="h-full">
  <Layout.Header>
    <span className="font-medium">通栏头部</span>
  </Layout.Header>
  <Layout>
    <Layout.Sider collapsible>
      <NavMenu items={items} />
    </Layout.Sider>
    <Layout.Content>{/* 页面内容 */}</Layout.Content>
  </Layout>
  <Layout.Footer>底部通栏 · © 2026</Layout.Footer>
</Layout>`,
      render: () => (
        <Frame>
          <Layout className="h-full">
            <Layout.Header>
              <span className="font-medium text-foreground">通栏头部</span>
            </Layout.Header>
            <Layout hasSider>
              <DemoSider />
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
      title: "默认收起侧栏",
      description: "defaultCollapsed 让侧栏初始收起，NavMenu 切到 collapsed 图标轨。",
      code: `<Layout.Sider collapsible defaultCollapsed>
  <NavMenu items={items} mode="collapsed" />
</Layout.Sider>`,
      render: () => (
        <Frame>
          <Layout className="h-full" hasSider>
            <DemoSider defaultCollapsed />
            <Layout>
              <Layout.Header sticky>
                <span className="font-medium text-foreground">收起态</span>
              </Layout.Header>
              <Layout.Content>
                <FillerContent />
              </Layout.Content>
              <Layout.Footer>瑚琏 Layout · © 2026</Layout.Footer>
            </Layout>
          </Layout>
        </Frame>
      ),
    },
  ],
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
            <Layout hasSider>
              <DemoSider width={200} />
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
    {/* dogfood NavMenu：收起态自动切图标轨 */}
    <NavMenu items={items} mode={${p.collapsed ? '"collapsed"' : '"inline"'}} />
  </Layout.Sider>
  <Layout>
    <Layout.Header sticky>顶栏</Layout.Header>
    <Layout.Content>内容</Layout.Content>
    <Layout.Footer>底栏</Layout.Footer>
  </Layout>
</Layout>`,
};
