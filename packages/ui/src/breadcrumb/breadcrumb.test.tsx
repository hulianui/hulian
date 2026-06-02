import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Breadcrumb } from "./breadcrumb";

const items = [
  { label: "首页", href: "/" },
  { label: "组件", href: "/components" },
  { label: "面包屑" },
];

describe("Breadcrumb", () => {
  it("根元素是 nav，默认 aria-label=breadcrumb，内含 ol", () => {
    const { container } = render(<Breadcrumb items={items} />);
    const nav = container.querySelector("nav");
    expect(nav).toBeTruthy();
    expect(nav!.getAttribute("aria-label")).toBe("breadcrumb");
    expect(nav!.querySelector("ol")).toBeTruthy();
  });

  it("非末项且有 href → 渲染为 <a> 链接", () => {
    const { getByText } = render(<Breadcrumb items={items} />);
    const home = getByText("首页");
    expect(home.tagName).toBe("A");
    expect(home.getAttribute("href")).toBe("/");
  });

  it("末项为当前页：aria-current=page 且不是链接", () => {
    const { getByText } = render(<Breadcrumb items={items} />);
    const cur = getByText("面包屑");
    expect(cur.tagName).not.toBe("A");
    expect(cur.getAttribute("aria-current")).toBe("page");
  });

  it("current 显式覆盖默认末项判定", () => {
    const { getByText } = render(
      <Breadcrumb
        items={[
          { label: "A", href: "/a", current: true },
          { label: "B", href: "/b" },
        ]}
      />,
    );
    const a = getByText("A");
    expect(a.getAttribute("aria-current")).toBe("page");
    expect(a.tagName).not.toBe("A");
  });

  it("分隔符为装饰位(aria-hidden)，数量 = 项数 - 1", () => {
    const { container } = render(<Breadcrumb items={items} />);
    const seps = container.querySelectorAll('[aria-hidden="true"]');
    expect(seps.length).toBe(items.length - 1);
  });

  it("默认分隔符文本为 /", () => {
    const { container } = render(<Breadcrumb items={items} />);
    expect(container.querySelector('[aria-hidden="true"]')!.textContent).toBe("/");
  });

  it("separator 可自定义为 ReactNode（如 chevron）", () => {
    const { getAllByTestId } = render(
      <Breadcrumb items={items} separator={<svg data-testid="chev" />} />,
    );
    expect(getAllByTestId("chev").length).toBe(items.length - 1);
  });

  it("无 href 且非当前页的中间项 → 渲染为纯文本(非链接，无 aria-current)", () => {
    const { getByText } = render(
      <Breadcrumb items={[{ label: "根" }, { label: "中" }, { label: "叶" }]} />,
    );
    const mid = getByText("中");
    expect(mid.tagName).not.toBe("A");
    expect(mid.getAttribute("aria-current")).toBeNull();
  });

  it("透传 className 到根 nav，aria-label 可覆盖", () => {
    const { container } = render(
      <Breadcrumb items={items} className="my-bc" aria-label="路径导航" />,
    );
    const nav = container.querySelector("nav")!;
    expect(nav.classList.contains("my-bc")).toBe(true);
    expect(nav.getAttribute("aria-label")).toBe("路径导航");
  });
});
