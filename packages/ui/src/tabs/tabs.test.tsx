import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { tabsListVariants, Tabs, TabsList, TabsTab, TabsPanel } from "./tabs";

describe("tabsListVariants", () => {
  it("默认 underline：下划线条 + relative 锚", () => {
    const c = tabsListVariants({});
    expect(c).toContain("relative");
    expect(c).toContain("border-b");
  });
  it("solid：分段药丸轨道", () => {
    const c = tabsListVariants({ variant: "solid" });
    expect(c).toContain("relative");
    expect(c).toContain("bg-surface-hover");
    expect(c).toContain("p-1");
  });
});

function Tree({ variant }: { variant?: "underline" | "solid" }) {
  return (
    <Tabs defaultValue="a">
      <TabsList variant={variant}>
        <TabsTab value="a">甲</TabsTab>
        <TabsTab value="b">乙</TabsTab>
        <TabsTab value="c" disabled>
          丙
        </TabsTab>
      </TabsList>
      <TabsPanel value="a">面板甲</TabsPanel>
      <TabsPanel value="b">面板乙</TabsPanel>
      <TabsPanel value="c">面板丙</TabsPanel>
    </Tabs>
  );
}

describe("Tabs 结构与 a11y（Base UI 兜底）", () => {
  it("tablist + tab 角色齐，激活 tab 有 data-active + aria-selected", () => {
    const { getByRole, getAllByRole } = render(<Tree />);
    expect(getByRole("tablist")).toBeTruthy();
    const tabs = getAllByRole("tab");
    expect(tabs.length).toBe(3);
    const active = tabs.find((t) => t.getAttribute("data-active") !== null)!;
    expect(active.textContent).toBe("甲");
    expect(active.getAttribute("aria-selected")).toBe("true");
  });

  it("TabsList 自动注入 Indicator span（在 tablist 内）", () => {
    const { container } = render(<Tree />);
    expect(container.querySelector('[role="tablist"] span')).toBeTruthy();
  });

  it("禁用 tab 带 data-disabled", () => {
    const { getByText } = render(<Tree />);
    const tab = getByText("丙").closest('[role="tab"]')!;
    expect(tab.getAttribute("data-disabled")).not.toBeNull();
  });
});

describe("Tab 皮肤钩子（防 data-active 漂移）", () => {
  it("tab className 含 data-[active]:text-foreground + text-muted-foreground + relative z-10 + 焦点环", () => {
    const { getAllByRole } = render(<Tree />);
    const cls = getAllByRole("tab")[0].className;
    expect(cls).toContain("text-muted-foreground");
    expect(cls).toContain("data-[active]:text-foreground");
    expect(cls).toContain("relative");
    expect(cls).toContain("z-10");
    expect(cls).toContain("focus-visible:ring-ring");
  });
});

describe("受控/非受控行为", () => {
  it("非受控：默认显首面板，点次 tab 切到次面板（隐藏即卸载）", () => {
    const { getByText, queryByText } = render(<Tree />);
    expect(getByText("面板甲")).toBeTruthy();
    expect(queryByText("面板乙")).toBeNull();
    fireEvent.click(getByText("乙"));
    expect(getByText("面板乙")).toBeTruthy();
    expect(queryByText("面板甲")).toBeNull();
  });

  it("受控：点 tab 触发 onValueChange 带新 value", () => {
    const onValueChange = vi.fn();
    const { getByText } = render(
      <Tabs value="a" onValueChange={onValueChange}>
        <TabsList>
          <TabsTab value="a">甲</TabsTab>
          <TabsTab value="b">乙</TabsTab>
        </TabsList>
        <TabsPanel value="a">面板甲</TabsPanel>
        <TabsPanel value="b">面板乙</TabsPanel>
      </Tabs>,
    );
    fireEvent.click(getByText("乙"));
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls[0][0]).toBe("b");
  });
});
