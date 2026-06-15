"use client";
import type { ShowcaseSpec } from "../showcase/types";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "./context-menu";

function Demo({ withGroup = false, withSub = false }: { withGroup?: boolean; withSub?: boolean }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-28 w-full max-w-sm select-none items-center justify-center rounded-[var(--radius)] border border-dashed border-border bg-surface text-sm text-muted">
        右键点击此区域
      </ContextMenuTrigger>
      <ContextMenuContent>
        {withGroup ? (
          <ContextMenuGroup>
            <ContextMenuGroupLabel>操作</ContextMenuGroupLabel>
            <ContextMenuItem>编辑</ContextMenuItem>
            <ContextMenuItem>复制</ContextMenuItem>
          </ContextMenuGroup>
        ) : (
          <>
            <ContextMenuItem>编辑</ContextMenuItem>
            <ContextMenuItem>复制</ContextMenuItem>
            <ContextMenuItem disabled>归档（禁用）</ContextMenuItem>
          </>
        )}
        {withSub && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>移动到</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>收件箱</ContextMenuItem>
              <ContextMenuItem>项目 A</ContextMenuItem>
              <ContextMenuItem>项目 B</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuSub>
                <ContextMenuSubTrigger>更多分组</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem>归档</ContextMenuItem>
                  <ContextMenuItem>星标</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem variant="danger">删除</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const contextMenuShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "在 Trigger 区域右键（或长按）弹出菜单，菜单定位锚到光标。Item 支持 disabled 与 variant=\"danger\"。",
      code: `<ContextMenu>
  <ContextMenuTrigger className="...右键点击此区域">
    右键点击此区域
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>编辑</ContextMenuItem>
    <ContextMenuItem>复制</ContextMenuItem>
    <ContextMenuItem disabled>归档（禁用）</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem variant="danger">删除</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
      render: () => <Demo />,
    },
    {
      title: "分组带标题",
      description: "用 ContextMenuGroup + ContextMenuGroupLabel 给一组命令加分组标题。",
      code: `<ContextMenuContent>
  <ContextMenuGroup>
    <ContextMenuGroupLabel>操作</ContextMenuGroupLabel>
    <ContextMenuItem>编辑</ContextMenuItem>
    <ContextMenuItem>复制</ContextMenuItem>
  </ContextMenuGroup>
  <ContextMenuSeparator />
  <ContextMenuItem variant="danger">删除</ContextMenuItem>
</ContextMenuContent>`,
      render: () => <Demo withGroup />,
    },
    {
      title: "级联子菜单",
      description: "ContextMenuSub 嵌套 SubTrigger + SubContent，从父项右侧展开，支持多层嵌套。",
      code: `<ContextMenuSub>
  <ContextMenuSubTrigger>移动到</ContextMenuSubTrigger>
  <ContextMenuSubContent>
    <ContextMenuItem>收件箱</ContextMenuItem>
    <ContextMenuItem>项目 A</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuSub>
      <ContextMenuSubTrigger>更多分组</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>归档</ContextMenuItem>
        <ContextMenuItem>星标</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  </ContextMenuSubContent>
</ContextMenuSub>`,
      render: () => <Demo withSub />,
    },
  ],
  controls: [
    { prop: "withGroup", type: "boolean", defaultValue: false, label: "分组" },
    { prop: "withSub", type: "boolean", defaultValue: true, label: "级联子菜单" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "分组", render: () => <Demo withGroup /> },
    { name: "级联子菜单", render: () => <Demo withSub /> },
  ],
  renderWithProps: (p) => (
    <Demo withGroup={p.withGroup as boolean} withSub={p.withSub as boolean} />
  ),
  toCode: () =>
    `<ContextMenu>\n  <ContextMenuTrigger>右键此区域</ContextMenuTrigger>\n  <ContextMenuContent>\n    <ContextMenuItem>编辑</ContextMenuItem>\n    <ContextMenuSub>\n      <ContextMenuSubTrigger>移动到</ContextMenuSubTrigger>\n      <ContextMenuSubContent>\n        <ContextMenuItem>项目 A</ContextMenuItem>\n      </ContextMenuSubContent>\n    </ContextMenuSub>\n    <ContextMenuSeparator />\n    <ContextMenuItem variant="danger">删除</ContextMenuItem>\n  </ContextMenuContent>\n</ContextMenu>`,
};
