import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  menuItemVariants,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuGroup,
  MenuGroupLabel,
} from "./menu";

describe("menuItemVariants", () => {
  it("default 用 data-[highlighted]:bg-surface-hover（非 hover/focus 伪类）+ data-[disabled]", () => {
    const c = menuItemVariants({});
    expect(c).toContain("data-[highlighted]:bg-surface-hover");
    expect(c).toContain("data-[disabled]:opacity-50");
  });
  it("danger 用 text-danger + data-[highlighted]:bg-danger/10", () => {
    const c = menuItemVariants({ variant: "danger" });
    expect(c).toContain("text-danger");
    expect(c).toContain("data-[highlighted]:bg-danger/10");
  });
});

describe("Menu", () => {
  it("闭合态: 触发器在, item 不在 DOM", () => {
    render(
      <Menu>
        <MenuTrigger render={<button>菜单</button>} />
        <MenuContent>
          <MenuItem>编辑</MenuItem>
        </MenuContent>
      </Menu>,
    );
    expect(screen.getByText("菜单")).toBeTruthy();
    expect(screen.queryByText("编辑")).toBeNull();
  });

  it("受控 open: items/group-label/separator 渲染 + surface 皮肤 + danger 红", () => {
    render(
      <Menu open modal={false}>
        <MenuTrigger render={<button>菜单</button>} />
        <MenuContent>
          <MenuGroup>
            <MenuGroupLabel>操作</MenuGroupLabel>
            <MenuItem>编辑</MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuItem variant="danger">删除</MenuItem>
        </MenuContent>
      </Menu>,
    );
    expect(screen.getByText("编辑")).toBeTruthy();
    expect(screen.getByText("操作")).toBeTruthy();
    expect(screen.getByText("删除").className).toContain("text-danger");
    expect(document.querySelector(".bg-surface.border-border")).not.toBeNull();
    expect(document.querySelector('[role="separator"]')).not.toBeNull();
  });

  it("MenuItem onClick 触发动作", () => {
    const onClick = vi.fn();
    render(
      <Menu open modal={false}>
        <MenuTrigger render={<button>菜单</button>} />
        <MenuContent>
          <MenuItem onClick={onClick}>编辑</MenuItem>
        </MenuContent>
      </Menu>,
    );
    fireEvent.click(screen.getByText("编辑"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
