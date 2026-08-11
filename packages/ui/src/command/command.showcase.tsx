"use client";
import { useState } from "react";
import {
  Calendar,
  FilePlus,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Sun,
  Upload,
  User,
  Users,
} from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button/button";
import { Segmented } from "../segmented/segmented";
import { Command } from "./command";
import type { CommandGroupData } from "./command.types";

// 真实中后台命令面板：跳转 / 操作 / 主题 三组、十余条命令，带描述/快捷键/图标/关键词。
// 在搜索框输入「订单」「dd」「主题」「new」都能看到跨组过滤——这才体现命令面板的价值。
const groups: CommandGroupData[] = [
  {
    heading: "快速跳转",
    items: [
      { value: "go-dashboard", label: "仪表盘", description: "总览今日数据", keywords: "dashboard 首页 概览 db", icon: <LayoutDashboard /> },
      { value: "go-orders", label: "订单管理", description: "查看与处理订单", keywords: "order 订单 dd 交易", icon: <ShoppingCart /> },
      { value: "go-products", label: "商品库", description: "SKU 与库存", keywords: "product sku 商品 库存", icon: <Package /> },
      { value: "go-customers", label: "客户列表", description: "会员与画像", keywords: "customer 客户 会员 user", icon: <Users /> },
    ],
  },
  {
    heading: "操作",
    items: [
      { value: "new-order", label: "新建订单", keywords: "create order 新建 下单", icon: <Plus />, shortcut: "⌘N" },
      { value: "new-doc", label: "新建文档", keywords: "create doc 文档 new", icon: <FilePlus /> },
      { value: "import", label: "导入数据", description: "上传 CSV / Excel", keywords: "import upload 导入 上传", icon: <Upload /> },
      { value: "search-all", label: "全局搜索", keywords: "search 搜索 查找", icon: <Search />, shortcut: "⌘F" },
      { value: "schedule", label: "排期日历", keywords: "calendar 日历 日程 排期", icon: <Calendar /> },
    ],
  },
  {
    heading: "账户与主题",
    items: [
      { value: "theme-light", label: "切换浅色主题", keywords: "theme light 主题 浅色 亮", icon: <Sun /> },
      { value: "theme-dark", label: "切换深色主题", keywords: "theme dark 主题 深色 暗", icon: <Moon /> },
      { value: "profile", label: "个人资料", keywords: "profile account 账户 个人", icon: <User /> },
      { value: "settings", label: "偏好设置", keywords: "settings preferences 设置 偏好", icon: <Settings />, shortcut: "⌘," },
      { value: "logout", label: "退出登录", description: "结束当前会话", keywords: "logout 退出 登出 signout", icon: <LogOut /> },
    ],
  },
];

function Demo({
  placeholder,
  shortcut,
  closeOnSelect,
}: {
  placeholder?: string;
  shortcut?: boolean;
  closeOnSelect?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        打开命令面板{shortcut ? "（或 ⌘K）" : ""}
      </Button>
      <Command
        open={open}
        onOpenChange={setOpen}
        groups={groups}
        placeholder={placeholder}
        shortcut={shortcut}
        closeOnSelect={closeOnSelect}
      />
    </>
  );
}

// 页脚版：面板底部常驻一条「本次选取算什么」的切换条 —— 面板是模态的，这类控件没有别处可放，
// 前置到触发器就得先决定再开始搜。
function FooterDemo() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("related");
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        关联任务
      </Button>
      <Command
        open={open}
        onOpenChange={setOpen}
        groups={groups}
        placeholder="搜索任务…"
        footer={
          <div className="flex items-center justify-between gap-2">
            <Segmented
              size="sm"
              value={mode}
              onValueChange={setMode}
              aria-label="关联方式"
              items={[
                { value: "related", label: "关联" },
                { value: "blocks", label: "阻塞" },
              ]}
            />
            <span className="text-xs text-muted-foreground">选择任务</span>
          </div>
        }
      />
    </>
  );
}

export const commandShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "Command 为受控模态：用 useState 持有 open，按钮触发打开。groups 提供分组命令，输入框实时跨组过滤（试输「订单」「dd」「主题」）。",
      code: `const [open, setOpen] = useState(false);

const groups = [
  {
    heading: "快速跳转",
    items: [
      { value: "go-dashboard", label: "仪表盘", description: "总览今日数据",
        keywords: "dashboard 首页", icon: <LayoutDashboard /> },
      { value: "go-orders", label: "订单管理", keywords: "order 订单 dd",
        icon: <ShoppingCart /> },
    ],
  },
  {
    heading: "操作",
    items: [
      { value: "new-order", label: "新建订单", icon: <Plus />, shortcut: "⌘N" },
      { value: "import", label: "导入数据", description: "上传 CSV / Excel",
        icon: <Upload /> },
    ],
  },
];

<Button variant="outline" onClick={() => setOpen(true)}>打开命令面板</Button>
<Command open={open} onOpenChange={setOpen} groups={groups} />`,
      render: () => <Demo />,
    },
    {
      title: "内置 ⌘K 快捷键",
      description: "shortcut 开启后，组件内置 ⌘K / Ctrl+K 全局监听切换开合，无需自行绑定。",
      code: `<Button variant="outline" onClick={() => setOpen(true)}>
  打开命令面板（或 ⌘K）
</Button>
<Command open={open} onOpenChange={setOpen} groups={groups} shortcut />`,
      render: () => <Demo shortcut />,
    },
    {
      title: "选中后保持打开",
      description: "closeOnSelect={false} 时执行命令后面板不关闭，适合连续多次操作的场景。",
      code: `<Command
  open={open}
  onOpenChange={setOpen}
  groups={groups}
  closeOnSelect={false}
/>`,
      render: () => <Demo closeOnSelect={false} />,
    },
    {
      title: "底部常驻页脚",
      description:
        "footer 渲染在列表之外：不随列表滚动，也不随过滤结果消失。适合放「本次选取算什么」的模式切换与右下角提示——面板是模态的，这些控件没有别处可放。",
      code: `const [mode, setMode] = useState("related");

<Command
  open={open}
  onOpenChange={setOpen}
  groups={groups}
  placeholder="搜索任务…"
  footer={
    <div className="flex items-center justify-between gap-2">
      <Segmented
        size="sm"
        value={mode}
        onValueChange={setMode}
        items={[
          { value: "related", label: "关联" },
          { value: "blocks", label: "阻塞" },
        ]}
      />
      <span className="text-xs text-muted-foreground">选择任务</span>
    </div>
  }
/>`,
      render: () => <FooterDemo />,
    },
  ],
  controls: [
    { prop: "placeholder", type: "text", defaultValue: "输入命令或搜索…" },
    { prop: "shortcut", type: "boolean", defaultValue: false, label: "内置 ⌘K" },
    { prop: "closeOnSelect", type: "boolean", defaultValue: true, label: "选后关闭" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "内置 ⌘K 快捷键", render: () => <Demo shortcut /> },
    { name: "底部常驻页脚", render: () => <FooterDemo /> },
  ],
  renderWithProps: (p) => (
    <Demo
      placeholder={(p.placeholder as string) || undefined}
      shortcut={p.shortcut as boolean}
      closeOnSelect={p.closeOnSelect as boolean}
    />
  ),
  toCode: (p) =>
    `const [open, setOpen] = useState(false);\n\n<Button onClick={() => setOpen(true)}>打开命令面板</Button>\n<Command\n  open={open}\n  onOpenChange={setOpen}\n  placeholder="${(p.placeholder as string) ?? "输入命令或搜索…"}"\n  shortcut={${Boolean(p.shortcut)}}\n  groups={[\n    { heading: "常用", items: [{ value: "new", label: "新建文件", onSelect: (v) => {} }] },\n  ]}\n/>`,
};
