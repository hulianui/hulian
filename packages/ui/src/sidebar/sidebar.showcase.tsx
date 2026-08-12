"use client";
import { useState, type CSSProperties } from "react";
import { Calendar, ChevronRight, Ellipsis, File, Folder, Gauge, Search, Wrench } from "../_icons";
import type { ShowcaseSpec } from "../showcase/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./sidebar";
import type { SidebarCollapsible, SidebarVariant } from "./sidebar.types";

const NAV = [
  { key: "overview", label: "工作台", icon: Gauge },
  { key: "projects", label: "项目", icon: Folder },
  { key: "files", label: "文件", icon: File, badge: "12" },
  { key: "schedule", label: "日程", icon: Calendar },
];

// 折叠态回显：showcase 里要能一眼看到状态机确实在动。
function StateReadout() {
  const { state, open, isMobile } = useSidebar();
  return (
    <p className="text-sm text-muted-foreground">
      state：<code className="text-foreground">{state}</code> · open：
      <code className="text-foreground">{String(open)}</code> · isMobile：
      <code className="text-foreground">{String(isMobile)}</code>
    </p>
  );
}

function Shell({
  collapsible = "icon",
  variant = "sidebar",
  // 栏底色逃生口：不传就是 --color-surface（与不写这个属性完全一致）
  sidebarSurface,
}: {
  collapsible?: SidebarCollapsible;
  variant?: SidebarVariant;
  sidebarSurface?: string;
}) {
  const [active, setActive] = useState("projects");
  const [subOpen, setSubOpen] = useState(true);
  return (
    <SidebarProvider
      fitViewport={false}
      className="h-[420px] overflow-hidden rounded-[var(--radius)] border border-border"
      style={sidebarSurface ? ({ "--hl-sidebar-surface": sidebarSurface } as CSSProperties) : undefined}
    >
      <Sidebar collapsible={collapsible} variant={variant}>
        <SidebarHeader>
          <div className="flex h-8 items-center gap-2 px-1">
            <span
              aria-hidden
              className="grid size-6 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-xs font-bold text-primary-foreground"
            >
              瑚
            </span>
            <span className="truncate text-sm font-semibold group-data-[collapsible=icon]/sidebar:hidden">
              瑚琏工作区
            </span>
          </div>
          <div className="group-data-[collapsible=icon]/sidebar:hidden">
            <SidebarInput placeholder="搜索…" prefix={<Search className="size-4" />} />
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>导航</SidebarGroupLabel>
            <SidebarGroupAction aria-label="新建">
              <span aria-hidden>+</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={active === item.key}
                      tooltip={item.label}
                      onClick={() => setActive(item.key)}
                    >
                      <item.icon aria-hidden />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    ) : (
                      <SidebarMenuAction showOnHover aria-label={`更多操作：${item.label}`}>
                        <Ellipsis className="size-4" aria-hidden />
                      </SidebarMenuAction>
                    )}
                    {item.key === "projects" && subOpen ? (
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton isActive>
                            <span>瑚琏组件库</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>
                            <span>文档站改版</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="设置" onClick={() => setSubOpen((v) => !v)}>
                <Wrench aria-hidden />
                <span>设置</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <span className="text-sm font-medium">
            {NAV.find((n) => n.key === active)?.label ?? "工作台"}
          </span>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-4">
          <StateReadout />
          <p className="text-sm text-muted-foreground">
            <kbd className="rounded-sm border border-border px-1">⌘/Ctrl</kbd>
            <kbd className="ml-1 rounded-sm border border-border px-1">B</kbd>
            <span className="ml-1">切换侧栏。在下面的输入框里按同一组合键不会误触。</span>
          </p>
          <input
            className="h-8 w-56 rounded-[var(--radius)] border border-border bg-bg px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="在这里打字试试 ⌘B"
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function LoadingShell() {
  return (
    <SidebarProvider fitViewport={false} className="h-[280px] overflow-hidden rounded-[var(--radius)] border border-border">
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>导航</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {["78%", "62%", "88%", "54%"].map((width) => (
                  <SidebarMenuItem key={width}>
                    <SidebarMenuSkeleton width={width} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 text-sm text-muted-foreground">导航数据加载中…</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ControlledShell() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        受控：当前 <code className="text-foreground">{open ? "expanded" : "collapsed"}</code>
        （持久化由消费方自己接 cookie / localStorage，库内不写）
      </p>
      <SidebarProvider
        open={open}
        onOpenChange={setOpen}
        fitViewport={false}
        className="h-[220px] overflow-hidden rounded-[var(--radius)] border border-border"
      >
        <Sidebar collapsible="offcanvas">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <Gauge aria-hidden />
                      <span>工作台</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <ChevronRight aria-hidden />
                      <span>更多</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="flex items-center gap-2 p-3">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">offcanvas 档收起后靠这里开回来</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export const sidebarShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法（icon 折叠档）",
      description:
        "SidebarProvider 管状态机，Sidebar 是外壳，SidebarInset 是兄弟内容区。折叠后菜单退化成图标 + Tooltip 补文字。",
      code: `<SidebarProvider>
  <Sidebar collapsible="icon">
    <SidebarHeader>{/* 品牌 / 工作区切换器 */}</SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>导航</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive tooltip="工作台">
                <Gauge />
                <span>工作台</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
  <SidebarInset>
    <SidebarTrigger />
  </SidebarInset>
</SidebarProvider>`,
      render: () => <Shell collapsible="icon" />,
    },
    {
      title: "offcanvas 档 + 受控",
      description:
        "offcanvas 折叠后整条收走，必须在正文里留一个 SidebarTrigger。open / onOpenChange 交给消费方，持久化自己接。",
      code: `const [open, setOpen] = useState(true);

<SidebarProvider open={open} onOpenChange={setOpen}>
  <Sidebar collapsible="offcanvas">{/* … */}</Sidebar>
  <SidebarInset>
    <SidebarTrigger />
  </SidebarInset>
</SidebarProvider>`,
      render: () => <ControlledShell />,
    },
    {
      title: "加载态",
      description: "SidebarMenuSkeleton 的宽度是确定值而非随机数，避免 SSR 与 hydration 对不上。",
      code: `<SidebarMenu>
  {["78%", "62%", "88%", "54%"].map((width) => (
    <SidebarMenuItem key={width}>
      <SidebarMenuSkeleton width={width} />
    </SidebarMenuItem>
  ))}
</SidebarMenu>`,
      render: () => <LoadingShell />,
    },
    {
      title: "行内次级动作",
      description:
        "SidebarMenuAction 是 SidebarMenuButton 的兄弟节点而非子节点 —— 按钮套按钮是无效 HTML。showOnHover 让它悬停才显形。",
      code: `<SidebarMenuItem>
  <SidebarMenuButton>
    <Folder />
    <span>项目</span>
  </SidebarMenuButton>
  <SidebarMenuAction showOnHover aria-label="更多操作">
    <Ellipsis className="size-4" />
  </SidebarMenuAction>
</SidebarMenuItem>`,
      render: () => <Shell collapsible="none" />,
    },
    {
      title: "层次：inset 形态 + 栏底色",
      description:
        "亮色下 surface 与 bg 常常同色，侧栏、页面底、内容区就只剩 1px 边框分界。inset 让内容区收成浮岛、侧栏留 8px 外白，--hl-sidebar-surface 只换侧栏这一处的底色（不传等于 surface，也不必去改全局 token）。offcanvas 收起时那 8px 外白会一并归零。",
      code: `<SidebarProvider style={{ "--hl-sidebar-surface": "var(--color-muted)" }}>
  <Sidebar variant="inset" collapsible="icon">…</Sidebar>
  <SidebarInset>…</SidebarInset>
</SidebarProvider>`,
      render: () => <Shell collapsible="icon" variant="inset" sidebarSurface="var(--color-muted)" />,
    },
  ],
  controls: [
    {
      prop: "collapsible",
      type: "select",
      options: ["offcanvas", "icon", "none"],
      defaultValue: "icon",
    },
    {
      prop: "variant",
      type: "select",
      options: ["sidebar", "inset"],
      defaultValue: "sidebar",
    },
  ],
  states: [
    { name: "icon 折叠档", render: () => <Shell collapsible="icon" /> },
    { name: "offcanvas 受控", render: () => <ControlledShell /> },
    { name: "加载态", render: () => <LoadingShell /> },
  ],
  renderWithProps: (props) => (
    <Shell
      collapsible={(props.collapsible as SidebarCollapsible) ?? "icon"}
      variant={(props.variant as SidebarVariant) ?? "sidebar"}
    />
  ),
  toCode: (props) =>
    `<SidebarProvider>\n  <Sidebar collapsible="${props.collapsible ?? "icon"}" variant="${props.variant ?? "sidebar"}">…</Sidebar>\n  <SidebarInset>…</SidebarInset>\n</SidebarProvider>`,
};
