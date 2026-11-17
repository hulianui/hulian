import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { tabsListVariants, Tabs, TabsList, TabsTab, TabsPanel } from "./tabs";
import type { TabsTone } from "./tabs.types";

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
  it("tab className 含 data-[active] 选中色（默认 brand）+ text-muted-foreground + relative z-10 + 焦点环", () => {
    const { getAllByRole } = render(<Tree />);
    const cls = getAllByRole("tab")[0].className;
    expect(cls).toContain("text-muted-foreground");
    expect(cls).toContain("data-[active]:text-primary");
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
          <TabsTab value="a">待处理</TabsTab>
          <TabsTab value="b">已完成</TabsTab>
        </TabsList>
        <TabsPanel value="a" />
      </Tabs>,
    );
    return { list: container.querySelector('[role="tablist"]')!, tab: getByText("待处理"), container };
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

// #316 语义档 tone。默认档已改为 brand；neutral 是旧观感的退路，必须逐字保持加 tone 之前的
// class 串（下面两个字面量是从那时的 DOM 里原样抄出来的）。
describe("Tabs tone（#316）", () => {
  const TAB_CLASS_BEFORE_TONE =
    "relative z-10 cursor-pointer select-none rounded-[var(--hl-radius-control,var(--radius))] font-medium " +
    "text-muted-foreground transition-colors hover:text-foreground data-[active]:text-foreground " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--hl-opacity-disabled,0.5)] px-3 py-1.5 text-sm";
  const UNDERLINE_INDICATOR_BEFORE_TONE =
    "pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-primary";

  function listOf(props: { variant?: "underline" | "solid"; tone?: TabsTone }) {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList {...props}>
          <TabsTab value="a">甲</TabsTab>
          <TabsTab value="b">乙</TabsTab>
        </TabsList>
      </Tabs>,
    );
    const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
    return {
      indicator: container.querySelector('[role="tablist"] span')!,
      active: tabs[0],
      inactive: tabs[1],
    };
  }

  it("tone=\"neutral\"：tab 与 underline 滑块的 class 逐字等于加 tone 之前（旧观感退路）", () => {
    const { indicator, active } = listOf({ tone: "neutral" });
    expect(active.className).toBe(TAB_CLASS_BEFORE_TONE);
    expect(indicator.className).toBe(UNDERLINE_INDICATOR_BEFORE_TONE);
  });

  it("不传 tone 默认 brand：与显式 tone=\"brand\" 渲染完全一致", () => {
    expect(listOf({}).active.className).toBe(listOf({ tone: "brand" }).active.className);
    expect(listOf({}).indicator.className).toBe(listOf({ tone: "brand" }).indicator.className);
    expect(listOf({}).active.className).toContain("data-[active]:text-primary");
  });

  it("tone 换掉选中文字色，且顶掉基类那条中性色（tailwind-merge 后者胜）", () => {
    const { active } = listOf({ tone: "brand" });
    expect(active.className).toContain("data-[active]:text-primary");
    expect(active.className).not.toContain("data-[active]:text-foreground");
  });

  it("未选中态不受 tone 影响：静息仍是 muted、hover 仍回 foreground", () => {
    const { inactive } = listOf({ tone: "danger" });
    expect(inactive.className).toContain("text-muted-foreground");
    expect(inactive.className).toContain("hover:text-foreground");
    expect(inactive.className).not.toContain("text-danger ");
  });

  it("underline 的下划线跟 tone；solid 的药丸底不跟（保持 bg-surface 白药丸 + 语义字）", () => {
    const underline = listOf({ tone: "success" }).indicator;
    expect(underline.className).toContain("bg-success");
    expect(underline.className).not.toContain("bg-primary");
    const solid = listOf({ variant: "solid", tone: "success" }).indicator;
    expect(solid.className).toContain("bg-surface");
    expect(solid.className).not.toContain("bg-success");
  });

  it("tone 经 TabsList 下发，TabsTab 不必逐个传；两条 tab 条互不串", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList tone="warning">
          <TabsTab value="a">甲</TabsTab>
          <TabsTab value="b">乙</TabsTab>
        </TabsList>
        <TabsList>
          <TabsTab value="c">丙</TabsTab>
        </TabsList>
      </Tabs>,
    );
    const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
    expect(tabs[0].className).toContain("data-[active]:text-warning");
    expect(tabs[1].className).toContain("data-[active]:text-warning");
    // 第二条没传 tone → 走默认 brand，不被第一条的 warning 串染
    expect(tabs[2].className).toContain("data-[active]:text-primary");
  });

  it("消费方 className 仍是最后一道，能盖住库给的选中色", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList tone="brand">
          <TabsTab value="a" className="data-[active]:text-success">
            甲
          </TabsTab>
        </TabsList>
      </Tabs>,
    );
    const tab = container.querySelector('[role="tab"]')!;
    expect(tab.className).toContain("data-[active]:text-success");
    expect(tab.className).not.toContain("data-[active]:text-primary");
  });
});

describe("Tabs · card / autoPlay", () => {
  it("card 皮肤：无滑块，tab 是卡", () => {
    const { container, getAllByRole } = render(
      <Tabs defaultValue="a">
        <TabsList variant="card">
          <TabsTab value="a">甲</TabsTab>
          <TabsTab value="b">乙</TabsTab>
        </TabsList>
      </Tabs>,
    );
    expect(getAllByRole("tab")[0].className).toContain("rounded-xl");
    expect(getAllByRole("tab")[0].className).toContain("data-[active]:bg-primary-subtle");
    expect(container.querySelector("[data-slot=tabs-autoplay-progress]")).toBeNull();
  });

  it("不传 autoPlay 时不出进度条（存量渲染不变）", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTab value="a">甲</TabsTab>
        </TabsList>
      </Tabs>,
    );
    expect(container.querySelector("[data-slot=tabs-autoplay-progress]")).toBeNull();
  });

  it("autoPlay：选中 tab 出进度条；用户选档后永久停下", async () => {
    const { container, getAllByRole } = render(
      <Tabs defaultValue="a" autoPlay={5000}>
        <TabsList variant="card">
          <TabsTab value="a">甲</TabsTab>
          <TabsTab value="b">乙</TabsTab>
        </TabsList>
      </Tabs>,
    );
    await act(async () => {});
    const bar = container.querySelector("[data-slot=tabs-autoplay-progress]");
    expect(bar).toBeTruthy();
    expect(getAllByRole("tab")[0].contains(bar)).toBe(true);
    fireEvent.click(getAllByRole("tab")[1]);
    await act(async () => {});
    expect(container.querySelector("[data-slot=tabs-autoplay-progress]")).toBeNull();
  });
});
