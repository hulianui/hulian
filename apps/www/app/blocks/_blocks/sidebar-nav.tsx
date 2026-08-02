/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

// 中后台侧边导航区块 —— 独立侧栏片段（非整页壳，整页壳见 AdminLayout）。
// 结构：顶部 Logo + 折叠切换 / 分组菜单（组标题 + 图标 + 文字 + 选中高亮 + 计数 Badge）/ 底部用户卡。
// 复制后改：GROUPS 菜单数据、品牌名、底部用户信息。约 220px 宽，放在示意容器里展示。
// 折叠态：收起为 56px，仅留图标（带计数的项用红点提示）。

import { useState } from "react";
import { Avatar, Badge, Button } from "@hulianui/ui";
import {
  BarChart3,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

// 分组菜单 —— 复制后按需增删；count 为可选计数 Badge
const GROUPS = [
  {
    title: "概览",
    items: [
      { key: "dashboard", label: "工作台", icon: LayoutDashboard },
      { key: "analytics", label: "数据分析", icon: BarChart3 },
    ],
  },
  {
    title: "业务",
    items: [
      { key: "customers", label: "客户管理", icon: Users, count: 12 },
      { key: "billing", label: "账单结算", icon: CreditCard },
      { key: "docs", label: "文档中心", icon: FileText },
      { key: "alerts", label: "告警通知", icon: Bell, count: 5 },
    ],
  },
  {
    title: "系统",
    items: [
      { key: "security", label: "安全合规", icon: ShieldCheck },
      { key: "settings", label: "系统设置", icon: Settings },
    ],
  },
] as const;

export function SidebarNavBlock() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("customers");

  return (
    // 示意容器：模拟中后台页面背景，让侧栏有上下文
    <div className="flex h-[560px] overflow-hidden rounded-[var(--radius)] border border-border bg-bg">
      <aside
        className="flex flex-col border-r border-border bg-surface transition-[width] duration-200"
        style={{ width: collapsed ? 56 : 220 }}
      >
        {/* 顶部：Logo + 折叠切换 */}
        <div className="flex h-14 items-center gap-2 border-b border-border px-3">
          <div
            className="grid size-8 shrink-0 place-items-center rounded-[var(--radius)] text-sm font-bold text-primary-foreground"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--color-primary), var(--color-chart-2))",
            }}
            aria-hidden
          >
            瀚
          </div>
          {!collapsed && (
            <span className="flex-1 truncate text-sm font-semibold text-foreground">
              瀚云控制台
            </span>
          )}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
            className="shrink-0"
          >
            {collapsed ? (
              <ChevronsRight className="size-4" />
            ) : (
              <ChevronsLeft className="size-4" />
            )}
          </Button>
        </div>

        {/* 分组菜单 */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {GROUPS.map((group) => (
            <div key={group.title} className="mb-3 last:mb-0">
              {!collapsed && (
                <div className="px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted">
                  {group.title}
                </div>
              )}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = active === item.key;
                  const count = "count" in item ? item.count : undefined;
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => setActive(item.key)}
                        title={collapsed ? item.label : undefined}
                        className={[
                          "flex w-full items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm font-medium transition-colors",
                          collapsed ? "justify-center" : "",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted hover:bg-surface-hover hover:text-foreground",
                        ].join(" ")}
                      >
                        {/* 折叠态：用 Badge dot 包裹图标提示计数 */}
                        {collapsed && count ? (
                          <Badge dot tone="danger" offset={[2, -2]}>
                            <item.icon className="size-[18px] shrink-0" />
                          </Badge>
                        ) : (
                          <item.icon className="size-[18px] shrink-0" />
                        )}
                        {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
                        {!collapsed && count ? (
                          <Badge
                            count={count}
                            tone={item.key === "alerts" ? "danger" : "neutral"}
                            size="sm"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* 底部用户卡 */}
        <div className="border-t border-border p-2">
          <div
            className={[
              "flex items-center gap-2 rounded-[var(--radius)] p-1.5 hover:bg-surface-hover",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <Avatar fallback="林" size="sm" />
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">林晚晴</div>
                  <div className="truncate text-xs text-muted">管理员</div>
                </div>
                <Button variant="ghost" size="iconSm" aria-label="账号设置" className="shrink-0">
                  <Settings className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* 右侧内容占位，仅作示意 */}
      <div className="hidden flex-1 items-center justify-center p-8 text-sm text-muted sm:flex">
        主内容区
      </div>
    </div>
  );
}
