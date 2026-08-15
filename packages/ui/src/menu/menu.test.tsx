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
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
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

describe("MenuContent 高度上限（#198）", () => {
  it("项数一多时改为滚动，而不是长出视口（浮层是 fixed 的，溢出那截点不到）", () => {
    render(
      <Menu defaultOpen>
        <MenuTrigger>打开</MenuTrigger>
        <MenuContent>
          {Array.from({ length: 40 }, (_, i) => (
            <MenuItem key={i}>选项 {i + 1}</MenuItem>
          ))}
        </MenuContent>
      </Menu>,
    );
    const popup = screen.getByRole("menu");
    expect(popup.className).toContain("max-h-[min(24rem,var(--available-height))]");
    expect(popup.className).toContain("overflow-y-auto");
  });

  // 补子菜单（#212）时把 MenuContent 的皮肤抽成了共用常量。抽常量是重构，重构不该有可见后果：
  // 这条把已有消费方拿到的那串 class 逐字钉死，改一个字符就红，避免「顺手优化一下」悄悄变了样。
  it("面板 class 逐字不变（抽共用常量属重构，不得改变既有渲染结果）", () => {
    render(
      <Menu defaultOpen>
        <MenuTrigger>打开</MenuTrigger>
        <MenuContent>
          <MenuItem>编辑</MenuItem>
        </MenuContent>
      </Menu>,
    );
    expect(screen.getByRole("menu").className).toBe(
      "max-h-[min(24rem,var(--available-height))] min-w-[8rem] overflow-y-auto rounded-[var(--radius)] border border-hairline bg-surface p-1 text-foreground shadow-xl outline-none origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
    );
  });
});

// ===== 级联子菜单（#212）=====
describe("MenuSub / MenuSubTrigger / MenuSubContent", () => {
  function Nested({ disabled = false }: { disabled?: boolean }) {
    return (
      <Menu defaultOpen modal={false}>
        <MenuTrigger render={<button>筛选</button>} />
        <MenuContent>
          <MenuItem>全部</MenuItem>
          <MenuSub>
            <MenuSubTrigger disabled={disabled}>状态</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>进行中</MenuItem>
              <MenuItem>已完成</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
    );
  }

  it("闭合态: 触发项在，子面板的项不在 DOM", () => {
    render(<Nested />);
    expect(screen.getByText("状态")).toBeTruthy();
    expect(screen.queryByText("进行中")).toBeNull();
  });

  // 「这项还有下一级」在读屏里唯一的载体是 aria-haspopup / aria-expanded —— 视觉上的 chevron
  // 读屏读不到。所以这条盯语义，下一条才盯 chevron。
  it("SubTrigger 带 aria-haspopup + aria-expanded，展开后 expanded 翻真", () => {
    render(<Nested />);
    const trigger = screen.getByText("状态");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("进行中")).toBeTruthy();
  });

  // 子菜单只能靠指针展开的话，键盘用户就走不进去了。ArrowRight 是 menu 模式的约定键。
  it("键盘 ArrowRight 展开子菜单", () => {
    render(<Nested />);
    const trigger = screen.getByText("状态");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "ArrowRight" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("进行中")).toBeTruthy();
  });

  it("SubTrigger 渲出右向 chevron（子菜单在视觉上唯一的线索）", () => {
    render(<Nested />);
    const svg = screen.getByText("状态").querySelector("svg");
    expect(svg).not.toBeNull();
    // 与 ContextMenuSubTrigger 同一条 lucide chevron-right 路径。
    expect(svg?.querySelector("path")?.getAttribute("d")).toBe("m9 18 6-6-6-6");
  });

  it("SubTrigger 复用 menuItemVariants 皮肤 + 展开时保持高亮 + 支持 danger/disabled", () => {
    const { unmount } = render(<Nested />);
    const trigger = screen.getByText("状态");
    expect(trigger.className).toContain("data-[highlighted]:bg-surface-hover");
    expect(trigger.className).toContain("data-[disabled]:opacity-50");
    // 指针移进子面板后父项不再 hover，靠这条撑住底色。
    expect(trigger.className).toContain("data-[popup-open]:bg-surface-hover");
    unmount();

    // 每棵树各自捕获自己的 unmount：复用第一棵的会让第二棵留在 document 里，
    // 后面的 getByText 就是在两棵树上查，将来加 getAllBy* 断言会串。
    const second = render(<Nested disabled />);
    expect(screen.getByText("状态").getAttribute("aria-disabled")).toBe("true");
    second.unmount();

    render(
      <Menu defaultOpen modal={false}>
        <MenuTrigger render={<button>更多</button>} />
        <MenuContent>
          <MenuSub>
            <MenuSubTrigger variant="danger">危险操作</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>清空</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>,
    );
    expect(screen.getByText("危险操作").className).toContain("text-danger");
  });

  // #212 的成因就是「同一形态两处各自维护」。子面板与主面板共用同一串皮肤常量，
  // 这条钉住它：任何一边单独改，两个 role=menu 的 class 就不再相等。
  it("子面板与主面板共用同一份皮肤（含 #198 的高度上限）", () => {
    render(<Nested />);
    fireEvent.click(screen.getByText("状态"));
    const [main, sub] = screen.getAllByRole("menu");
    expect(sub).toBeTruthy();
    expect(sub?.className).toBe(main?.className);
    expect(sub?.className).toContain("max-h-[min(24rem,var(--available-height))]");
  });

  it("className 透传到子面板与触发项", () => {
    render(
      <Menu defaultOpen modal={false}>
        <MenuTrigger render={<button>筛选</button>} />
        <MenuContent>
          <MenuSub>
            <MenuSubTrigger className="my-trigger">状态</MenuSubTrigger>
            <MenuSubContent className="w-64">
              <MenuItem>进行中</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>,
    );
    const trigger = screen.getByText("状态");
    expect(trigger.className).toContain("my-trigger");
    fireEvent.click(trigger);
    expect(screen.getAllByRole("menu")[1]?.className).toContain("w-64");
  });

  it("子菜单里的 MenuItem onClick 照常触发", () => {
    const onClick = vi.fn();
    render(
      <Menu defaultOpen modal={false}>
        <MenuTrigger render={<button>筛选</button>} />
        <MenuContent>
          <MenuSub>
            <MenuSubTrigger>状态</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem onClick={onClick}>进行中</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>,
    );
    fireEvent.click(screen.getByText("状态"));
    fireEvent.click(screen.getByText("进行中"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

// #273：MenuItem 的 render 此前只缺类型 —— 值本来就能穿透到 BaseMenu.Item。
// 这两条钉的是「穿透之后语义没退化」：链接是真 <a href>，role 与键盘漫游仍在。
describe("MenuItem render（导航型菜单项 · #273）", () => {
  it("render 成 <a>：拿到真 href，role=menuitem 不退化", () => {
    render(
      <Menu defaultOpen modal={false}>
        <MenuTrigger render={<button>更多</button>} />
        <MenuContent>
          <MenuItem render={<a href="/settings/roles" />}>角色管理</MenuItem>
        </MenuContent>
      </Menu>,
    );
    const item = screen.getByText("角色管理");
    expect(item.tagName).toBe("A");
    expect(item.getAttribute("href")).toBe("/settings/roles");
    expect(item.getAttribute("role")).toBe("menuitem");
  });

  it("render 成 <a> 后 onClick 仍然合并进去（两者可以并存）", () => {
    const onClick = vi.fn();
    render(
      <Menu defaultOpen modal={false}>
        <MenuTrigger render={<button>更多</button>} />
        <MenuContent>
          {/* 用片段 href：真路径会让 jsdom 打一条 "Not implemented: navigation" 噪音，
              而本条验的是回调合并，不是导航目标（那条在上一个用例里验）。 */}
          <MenuItem render={<a href="#roles" />} onClick={onClick}>
            角色管理
          </MenuItem>
        </MenuContent>
      </Menu>,
    );
    fireEvent.click(screen.getByText("角色管理"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
