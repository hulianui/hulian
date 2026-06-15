"use client";
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

export const dockShowcase: ShowcaseSpec = {
  examples: [
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
