import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AppLauncher } from "./app-launcher";
import { filterApps, groupSections, matchApp } from "./app-launcher.filter";
import type { AppLauncherItem } from "./app-launcher.types";

const items: AppLauncherItem[] = [
  { id: "ghostty", label: "Ghostty", icon: "G", category: "dev", section: "recent", keywords: ["terminal"] },
  { id: "chrome", label: "Google Chrome", icon: "C", category: "dev", section: "recent" },
  { id: "wechat", label: "微信", icon: "W", category: "social", keywords: ["weixin", "wx"] },
  { id: "notes", label: "备忘录", icon: "N", category: "tool" },
];

describe("matchApp", () => {
  it("空查询全命中", () => {
    expect(matchApp(items[0], "")).toBe(true);
    expect(matchApp(items[0], "   ")).toBe(true);
  });

  it("大小写不敏感的子串匹配", () => {
    expect(matchApp(items[1], "chrome")).toBe(true);
    expect(matchApp(items[1], "GOO")).toBe(true);
  });

  it("中文按子串命中（非前缀）", () => {
    expect(matchApp(items[3], "忘")).toBe(true);
  });

  it("keywords 作为别名参与匹配", () => {
    expect(matchApp(items[2], "wx")).toBe(true);
    expect(matchApp(items[2], "weixin")).toBe(true);
  });

  it("label 非字符串时只靠 keywords", () => {
    const node: AppLauncherItem = { id: 1, label: <span>X</span>, icon: "x", keywords: ["alpha"] };
    expect(matchApp(node, "alpha")).toBe(true);
    expect(matchApp(node, "X")).toBe(false);
  });
});

describe("filterApps", () => {
  it("按分类过滤，空分类=全部", () => {
    expect(filterApps(items, { category: "dev" })).toHaveLength(2);
    expect(filterApps(items)).toHaveLength(4);
  });

  it("分类与关键词叠加", () => {
    expect(filterApps(items, { category: "dev", query: "chrome" })).toHaveLength(1);
    expect(filterApps(items, { category: "social", query: "chrome" })).toHaveLength(0);
  });
});

describe("groupSections", () => {
  it("按连续 section 归组，不重排", () => {
    const groups = groupSections(items);
    expect(groups.map((g) => g.key)).toEqual(["recent", ""]);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].items).toHaveLength(2);
  });

  it("同名但不连续的 section 各自成组（顺序即真源）", () => {
    const groups = groupSections([
      { id: 1, label: "a", icon: "", section: "x" },
      { id: 2, label: "b", icon: "" },
      { id: 3, label: "c", icon: "", section: "x" },
    ]);
    expect(groups).toHaveLength(3);
  });

  it("空数组返回空组", () => {
    expect(groupSections([])).toEqual([]);
  });
});

describe("AppLauncher", () => {
  it("渲染全部应用", () => {
    const { getByText } = render(<AppLauncher items={items} />);
    expect(getByText("Ghostty")).toBeTruthy();
    expect(getByText("微信")).toBeTruthy();
  });

  it("搜索即时过滤（非受控）", () => {
    const { getByRole, queryByText } = render(<AppLauncher items={items} title="应用程序" />);
    fireEvent.change(getByRole("searchbox"), { target: { value: "chrome" } });
    expect(queryByText("Google Chrome")).toBeTruthy();
    expect(queryByText("微信")).toBeNull();
  });

  it("搜索无结果出空文案", () => {
    const { getByRole, getByText } = render(<AppLauncher items={items} />);
    fireEvent.change(getByRole("searchbox"), { target: { value: "zzz" } });
    expect(getByText("没有匹配的应用")).toBeTruthy();
  });

  it("受控搜索由外部说了算", () => {
    const onSearchChange = vi.fn();
    const { getByRole, queryByText } = render(
      <AppLauncher items={items} search="微信" onSearchChange={onSearchChange} />,
    );
    expect(queryByText("Ghostty")).toBeNull();
    fireEvent.change(getByRole("searchbox"), { target: { value: "x" } });
    expect(onSearchChange).toHaveBeenCalledWith("x");
    expect(queryByText("微信")).toBeTruthy(); // 外部没改 search，结果不动
  });

  it("分类胶囊切换过滤，「全部」回到不筛", () => {
    const { getByText, queryByText } = render(
      <AppLauncher
        items={items}
        categories={[
          { key: "dev", label: "开发者工具" },
          { key: "social", label: "社交" },
        ]}
      />,
    );
    fireEvent.click(getByText("社交"));
    expect(queryByText("Ghostty")).toBeNull();
    expect(queryByText("微信")).toBeTruthy();
    fireEvent.click(getByText("全部"));
    expect(queryByText("Ghostty")).toBeTruthy();
  });

  it("分类胶囊用 aria-pressed 表达选中", () => {
    const { getByText } = render(
      <AppLauncher items={items} categories={[{ key: "dev", label: "开发者工具" }]} defaultCategory="dev" />,
    );
    expect(getByText("开发者工具").getAttribute("aria-pressed")).toBe("true");
    expect(getByText("全部").getAttribute("aria-pressed")).toBe("false");
  });

  it("连续同 section 之间画分隔线", () => {
    const { container } = render(<AppLauncher items={items} />);
    expect(container.querySelectorAll(".border-t")).toHaveLength(1);
  });

  it("点击回传条目", () => {
    const onItemClick = vi.fn();
    const { getByText } = render(<AppLauncher items={items} onItemClick={onItemClick} />);
    fireEvent.click(getByText("微信"));
    expect(onItemClick).toHaveBeenCalledWith(items[2], expect.anything());
  });

  it("href 项渲染成链接", () => {
    const { container } = render(
      <AppLauncher items={[{ id: 1, label: "文档", icon: "D", href: "/docs" }]} />,
    );
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/docs");
  });

  it("disabled 项不触发点击", () => {
    const onItemClick = vi.fn();
    const { getByText } = render(
      <AppLauncher items={[{ id: 1, label: "停用", icon: "X", disabled: true }]} onItemClick={onItemClick} />,
    );
    fireEvent.click(getByText("停用"));
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it("方向键在网格里漫游焦点，越界不回绕", () => {
    const { container } = render(<AppLauncher items={items} columns={2} searchable={false} />);
    const cells = Array.from(container.querySelectorAll<HTMLElement>("[data-app-item]"));
    const grid = cells[0].closest("[class*='overflow-y-auto']") as HTMLElement;
    cells[0].focus();
    fireEvent.keyDown(grid, { key: "ArrowRight" });
    expect(document.activeElement).toBe(cells[1]);
    fireEvent.keyDown(grid, { key: "ArrowDown" });
    expect(document.activeElement).toBe(cells[3]);
    fireEvent.keyDown(grid, { key: "ArrowUp" });
    expect(document.activeElement).toBe(cells[1]);
    fireEvent.keyDown(grid, { key: "ArrowUp" });
    expect(document.activeElement).toBe(cells[1]); // 顶行再上不动
    fireEvent.keyDown(grid, { key: "End" });
    expect(document.activeElement).toBe(cells.at(-1));
  });

  it("badge 槽渲染在图标角上", () => {
    const { getByText } = render(
      <AppLauncher items={[{ id: 1, label: "邮件", icon: "M", badge: <span>9</span> }]} />,
    );
    expect(getByText("9")).toBeTruthy();
  });
});
