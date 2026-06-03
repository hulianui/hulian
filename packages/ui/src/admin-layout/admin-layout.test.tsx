import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, within } from "@testing-library/react";
import type { NavMenuNode } from "../nav-menu/nav-menu.types";
import { AdminLayout } from "./admin-layout";

const menu: NavMenuNode[] = [
  { key: "dashboard", label: "仪表盘" },
  {
    type: "group",
    key: "g",
    label: "业务",
    children: [
      { key: "orders", label: "订单管理" },
      { key: "products", label: "商品管理" },
    ],
  },
  { key: "settings", label: "系统设置" },
];

function tabsOf(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[role="tab"]'));
}

describe("AdminLayout", () => {
  it("渲染 logo 与菜单项", () => {
    const { getByText } = render(
      <AdminLayout menuItems={menu} logo={<span>瑚琏</span>}>
        <div>内容</div>
      </AdminLayout>,
    );
    expect(getByText("瑚琏")).toBeTruthy();
    expect(getByText("订单管理")).toBeTruthy();
    expect(getByText("内容")).toBeTruthy();
  });

  it("defaultActiveKey 自动打开对应页签", () => {
    const { container } = render(<AdminLayout menuItems={menu} defaultActiveKey="dashboard" />);
    const tabs = tabsOf(container);
    expect(tabs.length).toBe(1);
    expect(tabs[0].textContent).toContain("仪表盘");
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
  });

  it("点击菜单叶子项：打开新页签 + 激活 + 触发回调", () => {
    const onTab = vi.fn();
    const onSelect = vi.fn();
    const { container, getByText } = render(
      <AdminLayout menuItems={menu} defaultActiveKey="dashboard" onTabChange={onTab} onMenuSelect={onSelect} />,
    );
    fireEvent.click(getByText("订单管理"));
    expect(onSelect).toHaveBeenCalledWith("orders", expect.objectContaining({ key: "orders" }));
    expect(onTab).toHaveBeenLastCalledWith("orders");
    const tabs = tabsOf(container);
    expect(tabs.length).toBe(2);
    const orderTab = tabs.find((t) => t.textContent?.includes("订单管理"))!;
    expect(orderTab.getAttribute("aria-selected")).toBe("true");
  });

  it("收起侧栏：切换 aside data-collapsed + aria-expanded", () => {
    const { container, getByLabelText } = render(<AdminLayout menuItems={menu} defaultActiveKey="dashboard" />);
    const aside = container.querySelector("aside")!;
    expect(aside.hasAttribute("data-collapsed")).toBe(false);
    fireEvent.click(getByLabelText("收起侧栏"));
    expect(aside.hasAttribute("data-collapsed")).toBe(true);
    // 折叠后触发按钮语义翻转
    expect(getByLabelText("展开侧栏")).toBeTruthy();
  });

  it("受控 collapsed + onCollapsedChange", () => {
    const fn = vi.fn();
    const { getByLabelText, container } = render(
      <AdminLayout menuItems={menu} collapsed onCollapsedChange={fn} defaultActiveKey="dashboard" />,
    );
    expect(container.querySelector("aside")!.hasAttribute("data-collapsed")).toBe(true);
    fireEvent.click(getByLabelText("展开侧栏"));
    expect(fn).toHaveBeenCalledWith(false);
    // 受控：未提供新 prop 前保持折叠
    expect(container.querySelector("aside")!.hasAttribute("data-collapsed")).toBe(true);
  });

  it("关闭页签：移除并触发 onTabClose，激活邻居", () => {
    const onClose = vi.fn();
    const { container, getByText } = render(
      <AdminLayout menuItems={menu} defaultActiveKey="dashboard" onTabClose={onClose} />,
    );
    fireEvent.click(getByText("订单管理")); // 打开第二个页签并激活
    let tabs = tabsOf(container);
    const orderTab = tabs.find((t) => t.textContent?.includes("订单管理"))!;
    fireEvent.click(within(orderTab as HTMLElement).getByLabelText("关闭页签"));
    expect(onClose).toHaveBeenCalledWith("orders");
    tabs = tabsOf(container);
    expect(tabs.length).toBe(1);
    expect(tabs[0].textContent).toContain("仪表盘");
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
  });

  it("showTabs=false 不渲染页签条", () => {
    const { container } = render(
      <AdminLayout menuItems={menu} defaultActiveKey="dashboard" showTabs={false} />,
    );
    expect(tabsOf(container).length).toBe(0);
  });

  it("渲染 breadcrumb 与 headerExtra", () => {
    const { getByText } = render(
      <AdminLayout
        menuItems={menu}
        breadcrumb={<span>首页 / 仪表盘</span>}
        headerExtra={<span>用户菜单</span>}
      />,
    );
    expect(getByText("首页 / 仪表盘")).toBeTruthy();
    expect(getByText("用户菜单")).toBeTruthy();
  });

  it("受控 tabs：点击菜单不自动增减页签", () => {
    const { container, getByText } = render(
      <AdminLayout
        menuItems={menu}
        tabs={[{ key: "dashboard", label: "仪表盘" }]}
        activeKey="dashboard"
      />,
    );
    fireEvent.click(getByText("订单管理"));
    // 受控页签由上层维护，组件内部不增改
    expect(tabsOf(container).length).toBe(1);
  });
});
