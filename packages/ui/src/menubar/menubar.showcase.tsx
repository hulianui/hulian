"use client";
import type { ShowcaseSpec } from "../showcase/types";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarGroupLabel,
} from "./menubar";

type Orientation = "horizontal" | "vertical";

function Demo({ orientation = "horizontal" as Orientation }: { orientation?: Orientation }) {
  return (
    <Menubar orientation={orientation}>
      <MenubarMenu>
        <MenubarTrigger>文件</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>新建窗口</MenubarItem>
          <MenubarItem>打开…</MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="danger">退出</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>编辑</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>撤销</MenubarItem>
          <MenubarItem>重做</MenubarItem>
          <MenubarSeparator />
          <MenubarGroupLabel>剪贴板</MenubarGroupLabel>
          <MenubarItem>复制</MenubarItem>
          <MenubarItem>粘贴</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>视图</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>放大</MenubarItem>
          <MenubarItem>缩小</MenubarItem>
          <MenubarItem>全屏</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

export const menubarShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "多个 MenubarMenu 组成横向菜单条，打开一个后悬停即可切换到相邻菜单。",
      code: `<Menubar>
  <MenubarMenu>
    <MenubarTrigger>文件</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>新建窗口</MenubarItem>
      <MenubarItem>打开…</MenubarItem>
      <MenubarSeparator />
      <MenubarItem variant="danger">退出</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>编辑</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>撤销</MenubarItem>
      <MenubarItem>重做</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
      render: () => (
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>新建窗口</MenubarItem>
              <MenubarItem>打开…</MenubarItem>
              <MenubarSeparator />
              <MenubarItem variant="danger">退出</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>编辑</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>撤销</MenubarItem>
              <MenubarItem>重做</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      ),
    },
    {
      title: "分组标题",
      description: "下拉内容里用 MenubarGroupLabel 给一组项加小标题。",
      code: `<Menubar>
  <MenubarMenu>
    <MenubarTrigger>编辑</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>撤销</MenubarItem>
      <MenubarSeparator />
      <MenubarGroupLabel>剪贴板</MenubarGroupLabel>
      <MenubarItem>复制</MenubarItem>
      <MenubarItem>粘贴</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
      render: () => (
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>编辑</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>撤销</MenubarItem>
              <MenubarSeparator />
              <MenubarGroupLabel>剪贴板</MenubarGroupLabel>
              <MenubarItem>复制</MenubarItem>
              <MenubarItem>粘贴</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      ),
    },
    {
      title: "竖向菜单条",
      description: "orientation=\"vertical\" 将菜单条竖排，适合侧边场景。",
      code: `<Menubar orientation="vertical">
  <MenubarMenu>
    <MenubarTrigger>文件</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>新建窗口</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>视图</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>放大</MenubarItem>
      <MenubarItem>缩小</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
      render: () => <Demo orientation="vertical" />,
    },
  ],
  controls: [
    {
      prop: "orientation",
      type: "select",
      options: ["horizontal", "vertical"],
      defaultValue: "horizontal",
      label: "方向",
    },
  ],
  states: [
    { name: "横向菜单条（文件/编辑/视图）", render: () => <Demo /> },
    { name: "竖向菜单条", render: () => <Demo orientation="vertical" /> },
  ],
  renderWithProps: (p) => <Demo orientation={(p.orientation as Orientation) ?? "horizontal"} />,
  toCode: () =>
    `<Menubar>\n  <MenubarMenu>\n    <MenubarTrigger>文件</MenubarTrigger>\n    <MenubarContent>\n      <MenubarItem>新建窗口</MenubarItem>\n      <MenubarSeparator />\n      <MenubarItem variant="danger">退出</MenubarItem>\n    </MenubarContent>\n  </MenubarMenu>\n  {/* 更多顶层菜单… */}\n</Menubar>`,
};
