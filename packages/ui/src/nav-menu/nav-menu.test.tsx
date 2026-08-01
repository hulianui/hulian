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

  it("collapsed 模式：顶层渲染 aria-haspopup 的父项 + 飞出层含子项（旧行为）", () => {
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

// 四级深树：l1(顶层图标轨) → l2 → l3 → l4/l4b。
// 老实现的 collapsed 分支只 map 一层 children，l3/l4 在 DOM 里根本不存在 → 用户不可达。
const DEEP: NavMenuNode[] = [
  {
    type: "group",
    key: "g",
    label: "深层分组",
    children: [
      {
        key: "l1",
        label: "一级",
        children: [
          {
            key: "l2",
            label: "二级",
            children: [
              {
                key: "l3",
                label: "三级",
                children: [
                  { key: "l4", label: "四级甲", href: "#l4" },
                  { key: "l4b", label: "四级乙" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const row = (label: string) => screen.getByText(label).closest('[role="treeitem"]') as HTMLElement;

describe("NavMenu · collapsed 态无限级飞出", () => {
  it("三级 / 四级菜单项在 collapsed 态确实渲染进 DOM（且是 treeitem）", () => {
    render(<NavMenu items={DEEP} mode="collapsed" />);
    // 二级（老实现唯一渲染的一层）
    expect(row("二级")).toBeTruthy();
    // 三级、四级 —— 老实现里这两行不存在
    expect(row("三级")).toBeTruthy();
    expect(row("四级甲")).toBeTruthy();
    expect(row("四级乙")).toBeTruthy();
    // 整棵树共 5 个 treeitem：l1 图标 + l2 + l3 + l4 + l4b
    expect(screen.getAllByRole("treeitem")).toHaveLength(5);
  });

  it("每一层子菜单都挂在 role=group 里，父项带 aria-haspopup，叶子不带", () => {
    const { container } = render(<NavMenu items={DEEP} mode="collapsed" />);
    // l1(图标) / l2 / l3 三个父项各自领一个 group
    expect(container.querySelectorAll('[role="group"]')).toHaveLength(3);
    expect(row("二级").getAttribute("aria-haspopup")).toBe("true");
    expect(row("三级").getAttribute("aria-haspopup")).toBe("true");
    expect(row("四级甲").getAttribute("aria-haspopup")).toBeNull();
    // 四级叶子仍在同一棵 tree 内
    expect(screen.getByRole("tree").contains(row("四级甲"))).toBe(true);
  });

  it("每层飞出层用「自己那个 li」的直接子选择器控制显隐（防同名 group 连带炸开）", () => {
    const { container } = render(<NavMenu items={DEEP} mode="collapsed" />);
    const wraps = Array.from(container.querySelectorAll("[data-flyout]"));
    expect(wraps).toHaveLength(3); // l1 / l2 / l3 各一层面板
    for (const w of wraps) {
      expect(w.className).toContain("[li:hover>&]:opacity-100");
      expect(w.className).toContain("[li:focus-within>&]:opacity-100");
      // group-hover/xx 是【后代】选择器，多级同名会让祖先 hover 点亮所有后代面板
      expect(w.className).not.toContain("group-hover/");
      expect(w.className).not.toContain("group-focus-within/");
    }
  });

  it("第一层飞出层是 fixed（逃出侧栏滚动容器的 overflow 裁剪），第二层起仍是 absolute", () => {
    const { container } = render(<NavMenu items={DEEP} mode="collapsed" />);
    const wraps = Array.from(container.querySelectorAll("[data-flyout]")) as HTMLElement[];
    const first = wraps.find((w) => w.dataset.depth === "1")!;
    const deeper = wraps.filter((w) => w.dataset.depth !== "1");

    // absolute + left-full 会被 ScrollArea 之类的祖先整块裁掉：面板有尺寸、opacity=1，
    // 却一个像素都画不出来。fixed 的包含块是视口，不吃祖先 overflow。
    expect(first.className).toContain("fixed");
    expect(first.className).not.toContain("absolute");
    expect(first.className).not.toContain("left-full");
    // 坐标由 JS 实测写在行内（jsdom 里 rect 全 0，这里只验「确实写了」与「已定位」标记）
    expect(first.style.position).toBe("");
    expect(first.hasAttribute("data-positioned")).toBe(true);
    expect(first.style.top).toBe("0px");
    expect(first.style.left).toBe("0px");

    expect(deeper.length).toBeGreaterThan(0);
    for (const w of deeper) {
      expect(w.className).toContain("absolute");
      expect(w.className).toContain("left-full");
    }
  });

  it("第一层面板不靠 visibility:hidden 兜未定位帧（否则整棵子树掉出无障碍树）", () => {
    const { container } = render(<NavMenu items={DEEP} mode="collapsed" />);
    const first = Array.from(container.querySelectorAll("[data-flyout]")).find(
      (w) => (w as HTMLElement).dataset.depth === "1",
    ) as HTMLElement;
    expect(first.style.visibility).toBe("");
    // 深层项仍在无障碍树里可查（visibility:hidden 会让这一条直接归零）
    expect(screen.getAllByRole("treeitem")).toHaveLength(5);
  });

  it("键盘 → 逐层下钻到四级，← 逐层回父层", () => {
    render(<NavMenu items={DEEP} mode="collapsed" />);
    const tree = screen.getByRole("tree");
    const l1 = screen.getAllByRole("treeitem")[0];
    expect(l1.getAttribute("tabindex")).toBe("0");

    fireEvent.keyDown(tree, { key: "ArrowRight" });
    expect(document.activeElement).toBe(row("二级"));
    fireEvent.keyDown(tree, { key: "ArrowRight" });
    expect(document.activeElement).toBe(row("三级"));
    fireEvent.keyDown(tree, { key: "ArrowRight" });
    expect(document.activeElement).toBe(row("四级甲"));

    fireEvent.keyDown(tree, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(row("三级"));
    fireEvent.keyDown(tree, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(row("二级"));
  });

  it("键盘 ↑↓ 只在同层兄弟间移动，不串层；Home/End 落本层首尾", () => {
    render(<NavMenu items={DEEP} mode="collapsed" />);
    const tree = screen.getByRole("tree");
    fireEvent.keyDown(tree, { key: "ArrowRight" }); // → 二级
    fireEvent.keyDown(tree, { key: "ArrowDown" }); // 二级无兄弟 → 原地
    expect(document.activeElement).toBe(row("二级"));

    fireEvent.keyDown(tree, { key: "ArrowRight" }); // → 三级
    fireEvent.keyDown(tree, { key: "ArrowRight" }); // → 四级甲
    fireEvent.keyDown(tree, { key: "ArrowDown" });
    expect(document.activeElement).toBe(row("四级乙"));
    fireEvent.keyDown(tree, { key: "Home" });
    expect(document.activeElement).toBe(row("四级甲"));
    fireEvent.keyDown(tree, { key: "End" });
    expect(document.activeElement).toBe(row("四级乙"));
  });

  it("键盘 Enter：父项进下一层不选中，叶子才触发 onSelect", () => {
    const onSelect = vi.fn();
    render(<NavMenu items={DEEP} mode="collapsed" onSelect={onSelect} />);
    const tree = screen.getByRole("tree");
    fireEvent.keyDown(tree, { key: "Enter" }); // l1 是父项 → 进二级
    expect(document.activeElement).toBe(row("二级"));
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.keyDown(tree, { key: "ArrowRight" }); // 三级
    fireEvent.keyDown(tree, { key: "ArrowRight" }); // 四级甲
    fireEvent.keyDown(tree, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("l4", expect.objectContaining({ key: "l4" }));
  });

  it("Escape 从深层回到父层", () => {
    render(<NavMenu items={DEEP} mode="collapsed" />);
    const tree = screen.getByRole("tree");
    fireEvent.keyDown(tree, { key: "ArrowRight" });
    fireEvent.keyDown(tree, { key: "ArrowRight" });
    expect(document.activeElement).toBe(row("三级"));
    fireEvent.keyDown(tree, { key: "Escape" });
    expect(document.activeElement).toBe(row("二级"));
  });

  it("点击四级叶子触发 onSelect + 写选中态", () => {
    const onSelect = vi.fn();
    render(<NavMenu items={DEEP} mode="collapsed" onSelect={onSelect} />);
    fireEvent.click(row("四级乙"));
    expect(onSelect).toHaveBeenCalledWith("l4b", expect.objectContaining({ key: "l4b" }));
    expect(row("四级乙").getAttribute("aria-selected")).toBe("true");
  });

  it("点击中间层父项只进层不选中（与 inline 父项语义一致）", () => {
    const onSelect = vi.fn();
    render(<NavMenu items={DEEP} mode="collapsed" onSelect={onSelect} />);
    fireEvent.click(row("三级"));
    expect(onSelect).not.toHaveBeenCalled();
    expect(row("三级").getAttribute("aria-selected")).toBeNull();
  });

  it("深层选中：祖先链弱高亮 data-selected，roving tab 落点收敛到顶层图标", () => {
    render(<NavMenu items={DEEP} mode="collapsed" defaultSelectedKeys={["l4"]} />);
    const l1 = screen.getAllByRole("treeitem")[0];
    // tab 落点在图标轨上真实可见的那颗，而不是飞出层深处的隐藏行
    expect(l1.getAttribute("tabindex")).toBe("0");
    expect(row("四级甲").getAttribute("tabindex")).toBe("-1");
    // 祖先链弱高亮，便于收起态下定位当前分支
    expect(l1.hasAttribute("data-selected")).toBe(true);
    expect(row("二级").hasAttribute("data-selected")).toBe(true);
    expect(row("三级").hasAttribute("data-selected")).toBe(true);
    expect(row("四级甲").getAttribute("aria-selected")).toBe("true");
  });

  it("collapsed 与 inline 两态能力对齐：同一份数据渲染出同一批 treeitem key", () => {
    const { unmount } = render(
      <NavMenu items={DEEP} mode="inline" defaultOpenKeys={["l1", "l2", "l3"]} />,
    );
    const inlineLabels = screen
      .getAllByRole("treeitem")
      .map((el) => el.textContent?.trim())
      .sort();
    unmount();

    render(<NavMenu items={DEEP} mode="collapsed" />);
    const collapsedLabels = screen
      .getAllByRole("treeitem")
      .map((el) => el.textContent?.trim())
      .sort();
    // 顶层项在 collapsed 是图标/首字，其余层文案应完全一致
    expect(collapsedLabels.filter((l) => l !== "一")).toEqual(
      inlineLabels.filter((l) => l !== "一级"),
    );
  });

  it("禁用的深层项：aria-disabled + 点击不触发 onSelect", () => {
    const onSelect = vi.fn();
    const items: NavMenuNode[] = [
      {
        key: "a",
        label: "A",
        children: [{ key: "b", label: "B", children: [{ key: "c", label: "C", disabled: true }] }],
      },
    ];
    render(<NavMenu items={items} mode="collapsed" onSelect={onSelect} />);
    expect(row("C").getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(row("C"));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("NavMenuItem render 逃生口（hulianui/hulian#59）", () => {
  const items = [
    { key: "/a", label: "余额明细", render: <a data-router href="/a" /> },
    { key: "/b", label: "普通项" },
  ];

  it("render 的元素替代内建 <a>/<button>，皮肤与内容合并进去", () => {
    const { container, getByText } = render(<NavMenu items={items} />);
    const el = container.querySelector("[data-router]") as HTMLAnchorElement;
    expect(el).toBeTruthy();
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("href")).toBe("/a");
    expect(el.className).not.toBe(""); // 皮肤 class 合并了
    expect(getByText("余额明细")).toBeTruthy();
  });

  it("点击既跑消费方的 onClick 也跑内部选中", () => {
    const onClick = vi.fn();
    const onSelect = vi.fn();
    const { container } = render(
      <NavMenu
        onSelect={onSelect}
        items={[{ key: "/a", label: "余额", render: <a data-router href="/a" onClick={onClick} /> }]}
      />,
    );
    fireEvent.click(container.querySelector("[data-router]")!);
    expect(onClick).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith("/a", expect.objectContaining({ key: "/a" }));
  });
})
