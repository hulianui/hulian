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
    // 轨道必须是 bg-track（凹槽语义），不能退回 bg-surface-hover ——
    // 那个 token 与药丸的 bg-surface 在亮色下只差 3.3% 亮度、暗色下凹凸方向还是反的（#152）。
    expect(c).toContain("bg-track");
    expect(c).not.toContain("bg-surface-hover");
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

describe("Tabs 尺寸档（#269）", () => {
  const tabsOf = (size?: "sm" | "md") => {
    const { container, getByText } = render(
      <Tabs defaultValue="a">
        <TabsList variant="solid" size={size}>
          <TabsTab value="a">职称订单</TabsTab>
          <TabsTab value="b">论文订单</TabsTab>
        </TabsList>
        <TabsPanel value="a" />
      </Tabs>,
    );
    return { list: container.querySelector('[role="tablist"]')!, tab: getByText("职称订单"), container };
  };

  it("不传 size：逐字保持改动前的 md（px-3 py-1.5 text-sm + 轨道 p-1）", () => {
    const { list, tab } = tabsOf();
    expect(tab.className).toContain("px-3");
    expect(tab.className).toContain("py-1.5");
    expect(tab.className).toContain("text-sm");
    expect(list.className).toContain("p-1");
    expect(list.className).toContain("gap-1");
  });

  it("size=sm：tab 与 solid 轨道一起收，不是只压其中一层", () => {
    const { list, tab } = tabsOf("sm");
    expect(tab.className).toContain("px-2");
    expect(tab.className).toContain("py-1");
    expect(tab.className).toContain("text-xs");
    expect(tab.className).not.toContain("text-sm");
    // 只压轨道会让药丸上下探出（消费方写 h-7 的下场）——两层必须一起收
    expect(list.className).toContain("p-0.5");
    expect(list.className).toContain("gap-0.5");
  });

  it("尺寸经 TabsList 下发，TabsTab 不必逐个传", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList size="sm">
          <TabsTab value="a">甲</TabsTab>
          <TabsTab value="b">乙</TabsTab>
        </TabsList>
      </Tabs>,
    );
    for (const tab of Array.from(container.querySelectorAll('[role="tab"]'))) {
      expect(tab.className).toContain("text-xs");
    }
  });

  it("两条 tab 条各自的尺寸互不串（size 是 List 级、不是全局）", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList size="sm">
          <TabsTab value="a">小</TabsTab>
        </TabsList>
        <TabsList>
          <TabsTab value="b">大</TabsTab>
        </TabsList>
      </Tabs>,
    );
    const [small, medium] = Array.from(container.querySelectorAll('[role="tab"]'));
    expect(small.className).toContain("text-xs");
    expect(medium.className).toContain("text-sm");
  });
});
