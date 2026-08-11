import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import {
  menuItemVariants,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
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
    expect(document.querySelector(".bg-surface.border-hairline")).not.toBeNull();
    expect(document.querySelector('[role="separator"]')).not.toBeNull();
  });

  // 这批断言盯的是**语义**不是像素：MenuItem + 自画 √ 视觉一模一样，但读屏里
  // 听不出「这是一组选项 / 当前选的是哪个」。所以验收标准是 role 与 aria-checked。
  it("MenuCheckboxItem: role=menuitemcheckbox + aria-checked 跟随 checked", () => {
    render(
      <Menu open modal={false}>
        <MenuTrigger render={<button>菜单</button>} />
        <MenuContent>
          <MenuCheckboxItem checked>显示网格</MenuCheckboxItem>
          <MenuCheckboxItem checked={false}>显示标尺</MenuCheckboxItem>
        </MenuContent>
      </Menu>,
    );
    const items = screen.getAllByRole("menuitemcheckbox");
    expect(items).toHaveLength(2);
    expect(items[0]?.getAttribute("aria-checked")).toBe("true");
    expect(items[1]?.getAttribute("aria-checked")).toBe("false");
    // 勾选态是真出勾，不是只有 aria。
    expect(items[0]?.querySelector("svg")).not.toBeNull();
    expect(items[1]?.querySelector("svg")).toBeNull();
  });

  it("MenuCheckboxItem: 点击后 aria-checked 从 false 变 true 并回吐 onCheckedChange", () => {
    const onCheckedChange = vi.fn();
    render(
      <Menu open modal={false}>
        <MenuTrigger render={<button>菜单</button>} />
        <MenuContent>
          <MenuCheckboxItem onCheckedChange={onCheckedChange}>显示网格</MenuCheckboxItem>
        </MenuContent>
      </Menu>,
    );
    const item = screen.getByRole("menuitemcheckbox");
    expect(item.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(item);
    expect(item.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("MenuRadioItem: role=menuitemradio，组内互斥（选中项唯一）", () => {
    render(
      <Menu open modal={false}>
        <MenuTrigger render={<button>菜单</button>} />
        <MenuContent>
          <MenuRadioGroup defaultValue="medium">
            <MenuRadioItem value="low">低</MenuRadioItem>
            <MenuRadioItem value="medium">中</MenuRadioItem>
            <MenuRadioItem value="high">高</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>,
    );
    const items = screen.getAllByRole("menuitemradio");
    expect(items.map((item) => item.getAttribute("aria-checked"))).toEqual([
      "false",
      "true",
      "false",
    ]);
    fireEvent.click(items[2]!);
    expect(items.map((item) => item.getAttribute("aria-checked"))).toEqual([
      "false",
      "false",
      "true",
    ]);
  });

  it("MenuRadioGroup: 受控 value + onValueChange", () => {
    function Controlled() {
      const [value, setValue] = useState("low");
      return (
        <Menu open modal={false}>
          <MenuTrigger render={<button>菜单</button>} />
          <MenuContent>
            <MenuRadioGroup value={value} onValueChange={setValue}>
              <MenuRadioItem value="low">低</MenuRadioItem>
              <MenuRadioItem value="high">高</MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
      );
    }
    render(<Controlled />);
    const items = screen.getAllByRole("menuitemradio");
    expect(items[0]?.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(items[1]!);
    expect(items[0]?.getAttribute("aria-checked")).toBe("false");
    expect(items[1]?.getAttribute("aria-checked")).toBe("true");
  });

  it("选中态项复用 menuItemVariants 皮肤，并把指示器放进与 Item 图标位同宽的栅格首列", () => {
    render(
      <Menu open modal={false}>
        <MenuTrigger render={<button>菜单</button>} />
        <MenuContent>
          <MenuCheckboxItem checked>显示网格</MenuCheckboxItem>
          <MenuRadioGroup defaultValue="low">
            <MenuRadioItem value="low">低</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>,
    );
    for (const item of [
      screen.getByRole("menuitemcheckbox"),
      screen.getByRole("menuitemradio"),
    ]) {
      // 皮肤同一份：高亮/禁用钩子来自 menuItemVariants，不是另抄的字面量。
      expect(item.className).toContain("data-[highlighted]:bg-surface-hover");
      expect(item.className).toContain("data-[disabled]:opacity-50");
      // 槽位：display 换成 grid（tailwind-merge 顶掉 variants 的 flex），首列 1rem = Item 的 size-4 图标位，
      // gap-2 仍由 variants 提供 —— 所以文字左缘与带图标的普通项一致。
      expect(item.className).toContain("grid-cols-[1rem_1fr]");
      expect(item.className.split(/\s+/)).toContain("grid");
      expect(item.className.split(/\s+/)).not.toContain("flex");
      expect(item.className.split(/\s+/)).toContain("gap-2");
      expect(item.querySelector(".col-start-1")).not.toBeNull();
      expect(item.querySelector(".col-start-2")?.textContent).toBeTruthy();
    }
  });

  it("MenuCheckboxItem / MenuRadioItem 支持 disabled 与 danger", () => {
    render(
      <Menu open modal={false}>
        <MenuTrigger render={<button>菜单</button>} />
        <MenuContent>
          <MenuCheckboxItem disabled>显示网格</MenuCheckboxItem>
          <MenuRadioGroup defaultValue="low">
            <MenuRadioItem value="low" variant="danger">
              低
            </MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>,
    );
    expect(screen.getByRole("menuitemcheckbox").getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByRole("menuitemradio").className).toContain("text-danger");
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
