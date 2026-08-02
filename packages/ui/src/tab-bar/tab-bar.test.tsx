import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TabBar } from "./tab-bar";
import type { TabBarItem } from "./tab-bar.types";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

afterEach(cleanup);

// badge/dot 锚定图标 span，故带图标（真实 tab 项均有图标）。
const items: TabBarItem[] = [
  { key: "a", label: "甲", icon: <span>·</span> },
  { key: "b", label: "乙", icon: <span>·</span>, dot: true },
  { key: "c", label: "丙", icon: <span>·</span>, badge: 9, disabled: true },
];

describe("TabBar", () => {
  it("非受控默认激活首项（aria-current=page）", () => {
    const { getByText, getByRole } = render(<TabBar items={items} />);
    expect(getByText("甲").closest("button")?.getAttribute("aria-current")).toBe("page");
    expect(getByRole("navigation", { name: "底部导航" })).toBeTruthy();
  });

  it("点击切换激活项并触发 onChange", () => {
    const onChange = vi.fn();
    const { getByText } = render(<TabBar items={items} onChange={onChange} />);
    fireEvent.click(getByText("乙"));
    expect(onChange).toHaveBeenCalledWith("b");
    expect(getByText("乙").closest("button")?.getAttribute("aria-current")).toBe("page");
  });

  it("受控模式下不内部切换，仅回调", () => {
    const onChange = vi.fn();
    const { getByText } = render(<TabBar items={items} value="a" onChange={onChange} />);
    fireEvent.click(getByText("乙"));
    expect(onChange).toHaveBeenCalledWith("b");
    expect(getByText("甲").closest("button")?.getAttribute("aria-current")).toBe("page");
    expect(getByText("乙").closest("button")?.getAttribute("aria-current")).toBeNull();
  });

  it("disabled 项不可点击不回调", () => {
    const onChange = vi.fn();
    const { getByText } = render(<TabBar items={items} onChange={onChange} />);
    fireEvent.click(getByText("丙"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("badge 渲染角标内容", () => {
    const { getByText } = render(<TabBar items={items} />);
    expect(getByText("9")).toBeTruthy();
  });

  it("defaultValue 指定初始激活项", () => {
    const { getByText } = render(<TabBar items={items} defaultValue="b" />);
    expect(getByText("乙").closest("button")?.getAttribute("aria-current")).toBe("page");
  });

  it("ConfigProvider locale=enUS localizes the navigation label", () => {
    const { getByRole } = render(
      <ConfigProvider locale={enUS}>
        <TabBar items={items} fixed={false} />
      </ConfigProvider>,
    );
    expect(getByRole("navigation", { name: "Bottom navigation" })).toBeTruthy();
  });

  it("legacy locale falls back to Chinese and aria-label overrides the locale", () => {
    const legacy = { ...enUS, components: { ...enUS.components!, tabBar: undefined } };
    const { getByRole, rerender } = render(
      <ConfigProvider locale={legacy}>
        <TabBar items={items} fixed={false} />
      </ConfigProvider>,
    );
    expect(getByRole("navigation", { name: "底部导航" })).toBeTruthy();
    rerender(
      <ConfigProvider locale={enUS}>
        <TabBar items={items} fixed={false} aria-label="Primary app navigation" />
      </ConfigProvider>,
    );
    expect(getByRole("navigation", { name: "Primary app navigation" })).toBeTruthy();
  });
});
