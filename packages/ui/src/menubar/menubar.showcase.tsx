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
