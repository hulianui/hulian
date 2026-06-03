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
} from "./context-menu";

function Demo({ withGroup = false }: { withGroup?: boolean }) {
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
        <ContextMenuSeparator />
        <ContextMenuItem variant="danger">删除</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const contextMenuShowcase: ShowcaseSpec = {
  controls: [{ prop: "withGroup", type: "boolean", defaultValue: false, label: "分组" }],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "分组", render: () => <Demo withGroup /> },
  ],
  renderWithProps: (p) => <Demo withGroup={p.withGroup as boolean} />,
  toCode: () =>
    `<ContextMenu>\n  <ContextMenuTrigger>右键此区域</ContextMenuTrigger>\n  <ContextMenuContent>\n    <ContextMenuItem>编辑</ContextMenuItem>\n    <ContextMenuSeparator />\n    <ContextMenuItem variant="danger">删除</ContextMenuItem>\n  </ContextMenuContent>\n</ContextMenu>`,
};
