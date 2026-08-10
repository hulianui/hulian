"use client";
import { useState } from "react";
import { Home, Search, Bell, Settings, User } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Dock, DockIcon } from "./dock";

function Demo() {
  return (
    <Dock>
      <DockIcon><Home className="size-5" /></DockIcon>
      <DockIcon><Search className="size-5" /></DockIcon>
      <DockIcon><Bell className="size-5" /></DockIcon>
      <DockIcon><Settings className="size-5" /></DockIcon>
      <DockIcon><User className="size-5" /></DockIcon>
    </Dock>
  );
}

// 常驻底部导航：Dock 在 Web 上最典型的用法，也是「必须回答我现在在哪」的场景。
const NAV = [
  { key: "home", label: "首页", icon: <Home className="size-5" /> },
  { key: "search", label: "搜索", icon: <Search className="size-5" /> },
  { key: "alerts", label: "通知", icon: <Bell className="size-5" /> },
  { key: "settings", label: "设置", icon: <Settings className="size-5" /> },
];

function NavDemo() {
  const [active, setActive] = useState("home");
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="text-xs text-muted-foreground">
        当前：<span className="text-foreground">{NAV.find((i) => i.key === active)?.label}</span>
      </p>
      <Dock aria-label="主导航" activeKey={active} onSelect={setActive}>
        {NAV.map((item) => (
          <DockIcon key={item.key} itemKey={item.key} label={item.label}>
            {item.icon}
          </DockIcon>
        ))}
      </Dock>
    </div>
  );
}

export const dockShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "常驻底部导航（选中态）",
      description:
        "activeKey + onSelect 是受控范式，与 NavMenu / RouteTabs 一致。选中项落 aria-current=\"page\"，视觉上是图标下方的指示点——形状线索，不只靠颜色。接了 onSelect 后 DockIcon 会渲染成真正的 <button>（可聚焦、可回车激活），底座也升级为 nav 地标。",
      code: `const [active, setActive] = useState("home")

<Dock aria-label="主导航" activeKey={active} onSelect={setActive}>
  <DockIcon itemKey="home" label="首页"><Home className="size-5" /></DockIcon>
  <DockIcon itemKey="search" label="搜索"><Search className="size-5" /></DockIcon>
  <DockIcon itemKey="alerts" label="通知"><Bell className="size-5" /></DockIcon>
  <DockIcon itemKey="settings" label="设置"><Settings className="size-5" /></DockIcon>
</Dock>`,
      render: () => <NavDemo />,
    },
    {
      title: "基础用法",
      description: "DockIcon 包裹图标，鼠标靠近时图标按水平距离放大（macOS 放大坞效果）。",
      code: `<Dock>
  <DockIcon><Home className="size-5" /></DockIcon>
  <DockIcon><Search className="size-5" /></DockIcon>
  <DockIcon><Bell className="size-5" /></DockIcon>
  <DockIcon><Settings className="size-5" /></DockIcon>
  <DockIcon><User className="size-5" /></DockIcon>
</Dock>`,
      render: () => <Demo />,
    },
    {
      title: "更强放大",
      description: "magnification 调高峰值尺寸、distance 调大影响范围，得到更夸张的放大效果。",
      code: `<Dock magnification={84} distance={160}>
  <DockIcon><Home className="size-5" /></DockIcon>
  <DockIcon><Search className="size-5" /></DockIcon>
  <DockIcon><Bell className="size-5" /></DockIcon>
</Dock>`,
      render: () => (
        <Dock magnification={84} distance={160}>
          <DockIcon><Home className="size-5" /></DockIcon>
          <DockIcon><Search className="size-5" /></DockIcon>
          <DockIcon><Bell className="size-5" /></DockIcon>
        </Dock>
      ),
    },
    {
      title: "自定义静息尺寸",
      description: "iconSize 设定未悬停时的基础尺寸，适配更紧凑或更宽松的坞。",
      code: `<Dock iconSize={32}>
  <DockIcon><Home className="size-4" /></DockIcon>
  <DockIcon><Search className="size-4" /></DockIcon>
  <DockIcon><Settings className="size-4" /></DockIcon>
</Dock>`,
      render: () => (
        <Dock iconSize={32}>
          <DockIcon><Home className="size-4" /></DockIcon>
          <DockIcon><Search className="size-4" /></DockIcon>
          <DockIcon><Settings className="size-4" /></DockIcon>
        </Dock>
      ),
    },
  ],
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<Dock>\n  <DockIcon><Home /></DockIcon>\n  <DockIcon><Search /></DockIcon>\n</Dock>`,
};
