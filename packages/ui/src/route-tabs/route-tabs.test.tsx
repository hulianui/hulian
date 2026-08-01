import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { RouteTabs } from "./route-tabs";
import type { RouteTabItem } from "./route-tabs.types";

const TABS: RouteTabItem[] = [
  { key: "home", label: "首页", pinned: true },
  { key: "a", label: "订单" },
  { key: "b", label: "商品" },
  { key: "c", label: "会员" },
];

const openMenuOn = (label: string) =>
  fireEvent.contextMenu(screen.getByText(label).closest('[role="tab"]')!);

describe("RouteTabs", () => {
  it("渲染 tablist + 每个页签 role=tab，pinned 排在最前", () => {
    render(<RouteTabs items={TABS} activeKey="a" />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4);
    expect(tabs[0].textContent).toContain("首页");
  });

  it("激活项标 aria-selected", () => {
    render(<RouteTabs items={TABS} activeKey="a" />);
    expect(screen.getByText("订单").closest('[role="tab"]')!.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("商品").closest('[role="tab"]')!.getAttribute("aria-selected")).toBe("false");
  });

  it("点页签触发 onChange；Enter/Space 同样可达", () => {
    const onChange = vi.fn();
    render(<RouteTabs items={TABS} activeKey="a" onChange={onChange} />);
    const tab = screen.getByText("商品").closest('[role="tab"]')!;
    fireEvent.click(tab);
    expect(onChange).toHaveBeenCalledWith("b");
    fireEvent.keyDown(tab, { key: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("点 × 触发 onClose，且不冒泡成切页签", () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(<RouteTabs items={TABS} activeKey="a" onChange={onChange} onClose={onClose} />);
    const tab = screen.getByText("商品").closest('[role="tab"]')!;
    fireEvent.click(tab.querySelector('[aria-label="关闭页签"]')!);
    expect(onClose).toHaveBeenCalledWith("b");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("pinned 页签没有关闭按钮", () => {
    render(<RouteTabs items={TABS} activeKey="a" />);
    const pinned = screen.getByText("首页").closest('[role="tab"]')!;
    expect(pinned.querySelector('[aria-label="关闭页签"]')).toBeNull();
  });

  describe("右键批量动作", () => {
    it("「关闭其他」回传排除自己与 pinned 的 key 列表", () => {
      const onAction = vi.fn();
      render(<RouteTabs items={TABS} activeKey="a" onAction={onAction} />);
      openMenuOn("商品");
      fireEvent.click(screen.getByText("关闭其他"));
      expect(onAction).toHaveBeenCalledWith("closeOthers", "b", ["a", "c"]);
    });

    it("「关闭全部」含当前页（不是关闭其他）", () => {
      const onAction = vi.fn();
      render(<RouteTabs items={TABS} activeKey="a" onAction={onAction} />);
      openMenuOn("商品");
      fireEvent.click(screen.getByText("关闭全部"));
      expect(onAction).toHaveBeenCalledWith("closeAll", "b", ["a", "b", "c"]);
    });

    it("「关闭左侧 / 右侧」按展示顺序算", () => {
      const onAction = vi.fn();
      render(<RouteTabs items={TABS} activeKey="a" onAction={onAction} />);
      openMenuOn("会员");
      fireEvent.click(screen.getByText("关闭左侧"));
      expect(onAction).toHaveBeenCalledWith("closeLeft", "c", ["a", "b"]);
    });

    it("无可关对象时该菜单项禁用", () => {
      render(<RouteTabs items={TABS} activeKey="a" />);
      openMenuOn("订单");
      // 订单左侧只有 pinned 的首页 → 关闭左侧无对象
      expect(screen.getByText("关闭左侧").closest("[role='menuitem']")!.getAttribute("data-disabled")).not.toBeNull();
    });

    it("右键「关闭」走 onClose 而非 onAction", () => {
      const onAction = vi.fn();
      const onClose = vi.fn();
      render(<RouteTabs items={TABS} activeKey="a" onAction={onAction} onClose={onClose} />);
      openMenuOn("商品");
      fireEvent.click(screen.getByText("关闭页签"));
      expect(onClose).toHaveBeenCalledWith("b");
      expect(onAction).not.toHaveBeenCalled();
    });

    it("refresh 回传空的影响列表（不改 items，只传意图）", () => {
      const onAction = vi.fn();
      render(<RouteTabs items={TABS} activeKey="a" onAction={onAction} />);
      openMenuOn("商品");
      fireEvent.click(screen.getByText("刷新当前页"));
      expect(onAction).toHaveBeenCalledWith("refresh", "b", []);
    });

    it("actions 收窄后菜单只出指定项", () => {
      render(<RouteTabs items={TABS} activeKey="a" actions={["close", "closeOthers"]} />);
      openMenuOn("商品");
      expect(screen.getByText("关闭其他")).toBeTruthy();
      expect(screen.queryByText("关闭全部")).toBeNull();
    });

    it("extraMenuItems 追加在内置动作之后", () => {
      const onExtraAction = vi.fn();
      render(
        <RouteTabs
          items={TABS}
          activeKey="a"
          extraMenuItems={[{ key: "pin", label: "固定此页" }]}
          onExtraAction={onExtraAction}
        />,
      );
      openMenuOn("商品");
      fireEvent.click(screen.getByText("固定此页"));
      expect(onExtraAction).toHaveBeenCalledWith("pin", "b");
    });
  });

  describe("拖拽调序", () => {
    const tabOf = (label: string) => screen.getByText(label).closest('[role="tab"]')! as HTMLElement;

    it("不开 sortable 时页签不可拖", () => {
      render(<RouteTabs items={TABS} activeKey="a" />);
      expect(tabOf("订单").getAttribute("draggable")).toBeNull();
    });

    it("只传 sortable 不传 onReorder 时不启用", () => {
      render(<RouteTabs items={TABS} activeKey="a" sortable />);
      expect(tabOf("订单").getAttribute("draggable")).toBeNull();
    });
  });
});
