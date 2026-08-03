import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ConfigProvider, enUS } from "../config";
import { CardNav } from "./card-nav";

const items = [
  {
    label: "产品",
    bgColor: "var(--color-chart-1)",
    links: [
      { label: "概览", href: "/overview" },
      { label: "定价", href: "/pricing" },
    ],
  },
  {
    label: "公司",
    links: [{ label: "关于", href: "/about", ariaLabel: "关于我们" }],
  },
];

describe("CardNav", () => {
  it("渲染根容器 + 顶栏品牌/CTA + token 类", () => {
    const { container, getByText } = render(
      <CardNav brand="瑚琏" items={items} ctaLabel="开始使用" />,
    );
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("max-w-3xl");
    const nav = root.querySelector("nav")!;
    expect(nav.getAttribute("class")).toContain("bg-surface");
    expect(nav.getAttribute("class")).toContain("border-border");
    expect(getByText("瑚琏")).toBeTruthy();
    expect(getByText("开始使用")).toBeTruthy();
  });

  it("默认收起：aria-expanded=false 且内容区 aria-hidden", () => {
    const { container } = render(<CardNav items={items} />);
    const trigger = container.querySelector('[role="button"]')!;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    const content = container.querySelector('[aria-hidden="true"]');
    expect(content).toBeTruthy();
  });

  it("点击汉堡按钮展开：aria-expanded=true 且渲染卡片标题/链接", () => {
    const { container, getByText, queryByText } = render(<CardNav items={items} />);
    // 收起态不渲染卡片
    expect(queryByText("产品")).toBeNull();
    const trigger = container.querySelector('[role="button"]')!;
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(getByText("产品")).toBeTruthy();
    const link = getByText("关于").closest("a")!;
    expect(link.getAttribute("aria-label")).toBe("关于我们");
  });

  it("受控 open + onOpenChange 透传，且只取前 3 张卡片", () => {
    const four = [...items, { label: "支持" }, { label: "多余" }];
    let changed: boolean | null = null;
    const { container, getByText, queryByText } = render(
      <CardNav
        items={four}
        open
        onOpenChange={(o) => {
          changed = o;
        }}
      />,
    );
    expect(getByText("产品")).toBeTruthy();
    expect(getByText("支持")).toBeTruthy();
    // 第 4 张被截断
    expect(queryByText("多余")).toBeNull();
    const trigger = container.querySelector('[role="button"]')!;
    fireEvent.click(trigger);
    expect(changed).toBe(false);
  });

  it("className/style 透传到根容器", () => {
    const { container } = render(
      <CardNav items={items} className="ring-1" style={{ opacity: 0.9 }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("class")).toContain("ring-1");
    expect(root.style.opacity).toBe("0.9");
  });

  it("ConfigProvider locale=enUS localizes the menu trigger", () => {
    const { getByRole } = render(
      <ConfigProvider locale={enUS}>
        <CardNav brand="Brand" items={[]} />
      </ConfigProvider>,
    );
    const trigger = getByRole("button", { name: "Open menu" });
    fireEvent.click(trigger);
    expect(getByRole("button", { name: "Close menu" })).toBeTruthy();
  });
});
