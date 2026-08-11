import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
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

  // 右键菜单里的「优先级 / 状态」这类互斥选项：验收标准是 role 与 aria-checked，
  // 不是「画出了勾」—— 后者用普通 Item 也能做到，但读屏里当前选中项会彻底消失。
  it("ContextMenuCheckboxItem: role=menuitemcheckbox + aria-checked 随点击翻转", () => {
    const onCheckedChange = vi.fn();
    render(
      <ContextMenu open>
        <ContextMenuTrigger>右键此处</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem defaultChecked onCheckedChange={onCheckedChange}>
            置顶
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const item = screen.getByRole("menuitemcheckbox");
    expect(item.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(item);
    expect(item.getAttribute("aria-checked")).toBe("false");
    expect(onCheckedChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it("ContextMenuRadioItem: role=menuitemradio，组内互斥且复用 menu 皮肤与勾选槽位", () => {
    render(
      <ContextMenu open>
        <ContextMenuTrigger>右键此处</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuRadioGroup defaultValue="medium">
            <ContextMenuRadioItem value="low">低</ContextMenuRadioItem>
            <ContextMenuRadioItem value="medium">中</ContextMenuRadioItem>
            <ContextMenuRadioItem value="high">高</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const items = screen.getAllByRole("menuitemradio");
    expect(items.map((item) => item.getAttribute("aria-checked"))).toEqual([
      "false",
      "true",
      "false",
    ]);
    fireEvent.click(items[0]!);
    expect(items.map((item) => item.getAttribute("aria-checked"))).toEqual([
      "true",
      "false",
      "false",
    ]);
    expect(items[0]?.className).toContain("data-[highlighted]:bg-surface-hover");
    expect(items[0]?.className).toContain("grid-cols-[1rem_1fr]");
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
