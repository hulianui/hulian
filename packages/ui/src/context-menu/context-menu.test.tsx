import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuGroupLabel,
} from "./context-menu";

describe("ContextMenu", () => {
  it("闭合态: 触发区域在, item 不在 DOM", () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>右键此处</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>编辑</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByText("右键此处")).toBeTruthy();
    expect(screen.queryByText("编辑")).toBeNull();
  });

  it("受控 open: items/group-label/separator 渲染 + 复用 menu surface 皮肤 + danger 红", () => {
    render(
      <ContextMenu open>
        <ContextMenuTrigger>右键此处</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuGroupLabel>操作</ContextMenuGroupLabel>
            <ContextMenuItem>编辑</ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuItem variant="danger">删除</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByText("编辑")).toBeTruthy();
    expect(screen.getByText("操作")).toBeTruthy();
    expect(screen.getByText("删除").className).toContain("text-danger");
    expect(document.querySelector(".bg-surface.border-hairline")).not.toBeNull();
    expect(document.querySelector('[role="separator"]')).not.toBeNull();
  });

  it("ContextMenuItem 复用 menu 高亮钩子 data-[highlighted]:bg-surface-hover", () => {
    render(
      <ContextMenu open>
        <ContextMenuTrigger>右键此处</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>编辑</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByText("编辑").className).toContain("data-[highlighted]:bg-surface-hover");
  });

  it("ContextMenuItem onClick 触发动作", () => {
    const onClick = vi.fn();
    render(
      <ContextMenu open>
        <ContextMenuTrigger>右键此处</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={onClick}>编辑</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.click(screen.getByText("编辑"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
