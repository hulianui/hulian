import { describe, it, expect, afterEach, vi } from "vitest";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import { NavMenu } from "./nav-menu";
import type { NavMenuNode } from "./nav-menu.types";

afterEach(cleanup);

const ITEMS: NavMenuNode[] = [
  { key: "home", label: "首页", href: "#home" },
  {
    key: "manage",
    label: "管理",
    children: [
      { key: "users", label: "用户", href: "#users" },
      { key: "roles", label: "角色", href: "#roles", disabled: true },
    ],
  },
  {
    type: "group",
    key: "g1",
    label: "系统分组",
    children: [{ key: "settings", label: "设置", href: "#settings" }],
  },
];

describe("NavMenu", () => {
  it("渲染 role=tree + 顶层项为 treeitem，分组标题为 presentation 不入树", () => {
    render(<NavMenu items={ITEMS} />);
    expect(screen.getByRole("tree")).toBeTruthy();
    // 顶层 home/manage + 分组内 settings 都是 treeitem；分组标题不是
    expect(screen.getByText("首页").closest('[role="treeitem"]')).toBeTruthy();
    expect(screen.getByText("系统分组").closest('[role="treeitem"]')).toBeNull();
    // 分组小标题用 presentation 角色
    expect(screen.getByText("系统分组").getAttribute("role")).toBe("presentation");
  });

  it("叶子项点击触发 onSelect 并写选中态（aria-selected / aria-current）", () => {
    const onSelect = vi.fn();
    render(<NavMenu items={ITEMS} onSelect={onSelect} />);
    const home = screen.getByText("首页").closest('[role="treeitem"]')!;
    fireEvent.click(home);
    expect(onSelect).toHaveBeenCalledWith("home", expect.objectContaining({ key: "home" }));
    expect(home.getAttribute("aria-selected")).toBe("true");
    expect(home.getAttribute("aria-current")).toBe("page");
  });

  it("含 href 的叶子渲染为 <a> 且带 href，无 children 的父项不渲染 a", () => {
    render(<NavMenu items={ITEMS} />);
    const home = screen.getByText("首页").closest('[role="treeitem"]')!;
    expect(home.tagName).toBe("A");
    expect(home.getAttribute("href")).toBe("#home");
  });

  it("父项点击展开/收起子菜单（aria-expanded 翻转 + onOpenChange）", () => {
    const onOpenChange = vi.fn();
    render(<NavMenu items={ITEMS} onOpenChange={onOpenChange} />);
    const manage = screen.getByText("管理").closest('[role="treeitem"]')!;
    expect(manage.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(manage);
    expect(onOpenChange).toHaveBeenCalledWith(["manage"]);
    expect(manage.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(manage);
    expect(manage.getAttribute("aria-expanded")).toBe("false");
  });

  it("父项点击不触发叶子 onSelect（仅切换展开）", () => {
    const onSelect = vi.fn();
    render(<NavMenu items={ITEMS} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("管理").closest('[role="treeitem"]')!);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("禁用项 aria-disabled，点击不触发 onSelect", () => {
    const onSelect = vi.fn();
    render(<NavMenu items={ITEMS} defaultOpenKeys={["manage"]} onSelect={onSelect} />);
    const roles = screen.getByText("角色").closest('[role="treeitem"]')!;
    expect(roles.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(roles);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("受控 openKeys：内部点击不改 DOM 展开态（受控者说了算）", () => {
    const onOpenChange = vi.fn();
    render(<NavMenu items={ITEMS} openKeys={[]} onOpenChange={onOpenChange} />);
    const manage = screen.getByText("管理").closest('[role="treeitem"]')!;
    fireEvent.click(manage);
    expect(onOpenChange).toHaveBeenCalledWith(["manage"]); // 回调照发
    expect(manage.getAttribute("aria-expanded")).toBe("false"); // 但受控未变 → 仍收起
  });

  it("子菜单容器用纯 CSS grid-template-rows 过渡（展开 1fr / 收起 0fr）", () => {
    const { container } = render(<NavMenu items={ITEMS} defaultOpenKeys={["manage"]} />);
    const submenu = container.querySelector("[data-submenu]")!;
    expect(submenu.className).toContain("transition-[grid-template-rows]");
    expect(submenu.className).toContain("grid-rows-[1fr]");
  });

  it("roving tabindex：默认选中项 tabIndex=0，其余 -1", () => {
    render(<NavMenu items={ITEMS} defaultSelectedKeys={["home"]} />);
    const home = screen.getByText("首页").closest('[role="treeitem"]')!;
    const manage = screen.getByText("管理").closest('[role="treeitem"]')!;
    expect(home.getAttribute("tabindex")).toBe("0");
    expect(manage.getAttribute("tabindex")).toBe("-1");
  });

  it("键盘 ArrowDown 移动焦点到下一项", () => {
    render(<NavMenu items={ITEMS} defaultSelectedKeys={["home"]} />);
    const tree = screen.getByRole("tree");
    const manage = screen.getByText("管理").closest('[role="treeitem"]') as HTMLElement;
    fireEvent.keyDown(tree, { key: "ArrowDown" });
    expect(document.activeElement).toBe(manage);
  });

  it("键盘 ArrowRight 在收起父项上展开子菜单", () => {
    render(<NavMenu items={ITEMS} defaultSelectedKeys={["manage"]} />);
    const tree = screen.getByRole("tree");
    const manage = screen.getByText("管理").closest('[role="treeitem"]')!;
    expect(manage.getAttribute("aria-expanded")).toBe("false");
    fireEvent.keyDown(tree, { key: "ArrowRight" });
    expect(manage.getAttribute("aria-expanded")).toBe("true");
  });

  it("键盘 Enter 在叶子上触发 onSelect", () => {
    const onSelect = vi.fn();
    render(<NavMenu items={ITEMS} defaultSelectedKeys={["home"]} onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole("tree"), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("home", expect.objectContaining({ key: "home" }));
  });

  it("collapsed 模式：顶层渲染 aria-haspopup 的父项 + 飞出层含子项", () => {
    render(<NavMenu items={ITEMS} mode="collapsed" />);
    // manage 有子菜单 → aria-haspopup
    const tops = screen.getAllByRole("treeitem");
    const haspopup = tops.find((el) => el.getAttribute("aria-haspopup") === "true");
    expect(haspopup).toBeTruthy();
    // 飞出层里的子项（用户）也在 DOM（CSS hover 控制可见，DOM 恒在）
    expect(screen.getByText("用户")).toBeTruthy();
  });

  it("actions 行尾操作渲染在 treeitem 按钮【之外】（不形成 <button> 嵌套）且可独立点击", () => {
    const onAction = vi.fn();
    const onSelect = vi.fn();
    const items: NavMenuNode[] = [
      {
        key: "c1",
        label: "对话一",
        actions: (
          <button
            type="button"
            aria-label="删除"
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
          >
            x
          </button>
        ),
      },
    ];
    render(<NavMenu items={items} onSelect={onSelect} />);
    const treeitem = screen.getByText("对话一").closest('[role="treeitem"]') as HTMLElement;
    const del = screen.getByLabelText("删除");
    // 关键：操作按钮不是 treeitem 按钮的后代 —— 否则就是非法的 <button> 套 <button>
    expect(treeitem.contains(del)).toBe(false);
    expect(treeitem.querySelector("button")).toBeNull();
    // 点击操作触发自身回调，且不触发行 onSelect
    fireEvent.click(del);
    expect(onAction).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
