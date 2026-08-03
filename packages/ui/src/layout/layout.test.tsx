import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ConfigProvider, enUS } from "../config";
import { Layout } from "./layout";

describe("Layout 容器方向自动探测", () => {
  it("无 Sider 子元素 → 纵向(vertical)堆叠", () => {
    const { container } = render(
      <Layout>
        <Layout.Header>头</Layout.Header>
        <Layout.Content>主</Layout.Content>
        <Layout.Footer>尾</Layout.Footer>
      </Layout>,
    );
    const root = container.querySelector("[data-layout]")!;
    expect(root.getAttribute("data-direction")).toBe("vertical");
    expect(root.classList.contains("flex-col")).toBe(true);
  });

  it("含 Sider 直接子元素 → 横向(horizontal)", () => {
    const { container } = render(
      <Layout>
        <Layout.Sider>菜单</Layout.Sider>
        <Layout>
          <Layout.Content>主</Layout.Content>
        </Layout>
      </Layout>,
    );
    const root = container.querySelector("[data-layout]")!;
    expect(root.getAttribute("data-direction")).toBe("horizontal");
    expect(root.classList.contains("flex-row")).toBe(true);
  });

  it("hasSider 显式覆盖自动探测", () => {
    const { container } = render(
      <Layout hasSider>
        <Layout.Content>主</Layout.Content>
      </Layout>,
    );
    expect(container.querySelector("[data-layout]")!.getAttribute("data-direction")).toBe(
      "horizontal",
    );
  });
});

describe("Layout 部件语义标签", () => {
  it("Header=header / Content=main / Footer=footer", () => {
    const { container } = render(
      <Layout>
        <Layout.Header>头</Layout.Header>
        <Layout.Content>主</Layout.Content>
        <Layout.Footer>尾</Layout.Footer>
      </Layout>,
    );
    expect(container.querySelector("header")).toBeTruthy();
    expect(container.querySelector("main")).toBeTruthy();
    expect(container.querySelector("footer")).toBeTruthy();
  });

  it("Header sticky → sticky top-0 类", () => {
    const { container } = render(
      <Layout>
        <Layout.Header sticky>头</Layout.Header>
      </Layout>,
    );
    const h = container.querySelector("header")!;
    expect(h.classList.contains("sticky")).toBe(true);
    expect(h.classList.contains("top-0")).toBe(true);
  });
});

describe("Layout.Sider 折叠", () => {
  it("默认展开按 width 渲染宽度", () => {
    const { container } = render(<Layout.Sider width={200}>菜单</Layout.Sider>);
    const aside = container.querySelector("aside")!;
    expect(aside.style.width).toBe("200px");
    expect(aside.hasAttribute("data-collapsed")).toBe(false);
  });

  it("defaultCollapsed → 按 collapsedWidth 渲染 + data-collapsed", () => {
    const { container } = render(
      <Layout.Sider defaultCollapsed collapsedWidth={56}>
        菜单
      </Layout.Sider>,
    );
    const aside = container.querySelector("aside")!;
    expect(aside.style.width).toBe("56px");
    expect(aside.hasAttribute("data-collapsed")).toBe(true);
  });

  it("collapsible 显示底部 trigger 按钮；点击切换(非受控)", () => {
    const onCollapse = vi.fn();
    const { container } = render(
      <Layout.Sider collapsible onCollapse={onCollapse}>
        菜单
      </Layout.Sider>,
    );
    const btn = container.querySelector("button[aria-label]")!;
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(btn);
    expect(onCollapse).toHaveBeenCalledWith(true, "clickTrigger");
    // 非受控 → 自身收起
    expect(container.querySelector("aside")!.hasAttribute("data-collapsed")).toBe(true);
  });

  it("受控 collapsed：点 trigger 只回调不自变（由父决定）", () => {
    const onCollapse = vi.fn();
    const { container } = render(
      <Layout.Sider collapsible collapsed={false} onCollapse={onCollapse}>
        菜单
      </Layout.Sider>,
    );
    const btn = container.querySelector("button[aria-label]")!;
    fireEvent.click(btn);
    expect(onCollapse).toHaveBeenCalledWith(true, "clickTrigger");
    // 受控未回写 → 仍展开
    expect(container.querySelector("aside")!.hasAttribute("data-collapsed")).toBe(false);
  });

  it("trigger={null} → 即便 collapsible 也不渲染触发器", () => {
    const { container } = render(
      <Layout.Sider collapsible trigger={null}>
        菜单
      </Layout.Sider>,
    );
    expect(container.querySelector("button[aria-label]")).toBeNull();
  });

  it("不可折叠默认无 trigger", () => {
    const { container } = render(<Layout.Sider>菜单</Layout.Sider>);
    expect(container.querySelector("button[aria-label]")).toBeNull();
  });

  it("ConfigProvider locale=enUS localizes the collapse trigger", () => {
    const { getByRole } = render(
      <ConfigProvider locale={enUS}>
        <Layout.Sider collapsible>Menu</Layout.Sider>
      </ConfigProvider>,
    );
    const trigger = getByRole("button", { name: "Collapse" });
    fireEvent.click(trigger);
    expect(getByRole("button", { name: "Expand" })).toBeTruthy();
  });
});
