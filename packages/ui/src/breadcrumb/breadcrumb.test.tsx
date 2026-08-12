import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { Breadcrumb } from "./breadcrumb";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

const items = [
  { label: "首页", href: "/" },
  { label: "组件", href: "/components" },
  { label: "面包屑" },
];

describe("Breadcrumb", () => {
  // items 必须是模块级常量（引用稳定），传数组字面量时 memo 本来就不该 bail。
  it("稳定父更新时跳过面包屑子树", async () => {
    await expectMemoSkipsSubtree(() => <Breadcrumb items={items} separator="/" />);
  });

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

  // #239：render 逃生口 —— 真渲染成消费方给的元素，而不是在 <nav> 上劫持点击。
  describe("render 插槽", () => {
    // 冒充框架的 Link：只认 to + children，自己渲染 <a>（原生行为因此照常成立）。
    function FakeLink({
      to,
      children,
      className,
      ...rest
    }: {
      to: string;
      children?: ReactNode;
      className?: string;
    }) {
      return (
        <a data-testid="fake-link" href={to} className={className} {...rest}>
          {children}
        </a>
      );
    }

    it("渲染成消费方给的元素，label 作它的子节点", () => {
      const { getByTestId } = render(
        <Breadcrumb
          items={[{ label: "客户", render: <FakeLink to="/customers" /> }, { label: "张三" }]}
        />,
      );
      const link = getByTestId("fake-link");
      expect(link.tagName).toBe("A");
      expect(link.getAttribute("href")).toBe("/customers");
      expect(link.textContent).toBe("客户");
    });

    it("皮肤类名合并进 render 元素，且元素自带的 className 保留（本组件在前、它在后）", () => {
      const { getByTestId } = render(
        <Breadcrumb
          items={[
            { label: "客户", render: <FakeLink to="/customers" className="my-link" /> },
            { label: "张三" },
          ]}
        />,
      );
      const cls = getByTestId("fake-link").className;
      expect(cls).toContain("text-muted-foreground");
      expect(cls).toContain("my-link");
      expect(cls.indexOf("text-muted-foreground")).toBeLessThan(cls.indexOf("my-link"));
    });

    it("当前页也传 render 时，aria-current=page 合并进该元素", () => {
      const { getByTestId } = render(
        <Breadcrumb
          items={[{ label: "客户", href: "/customers" }, { label: "张三", render: <FakeLink to="/customers/1" /> }]}
        />,
      );
      const cur = getByTestId("fake-link");
      expect(cur.getAttribute("aria-current")).toBe("page");
      expect(cur.className).toContain("text-foreground");
    });

    it("非当前项不带 aria-current", () => {
      const { getByTestId } = render(
        <Breadcrumb
          items={[{ label: "客户", render: <FakeLink to="/customers" /> }, { label: "张三" }]}
        />,
      );
      expect(getByTestId("fake-link").getAttribute("aria-current")).toBeNull();
    });

    it("本项写了 href 时以本项为准（否则 href 由 render 元素自带）", () => {
      const { getAllByRole } = render(
        <Breadcrumb
          items={[
            { label: "客户", href: "/from-item", render: <a data-testid="raw" href="/from-element" /> },
            { label: "张三" },
          ]}
        />,
      );
      expect(getAllByRole("link")[0]!.getAttribute("href")).toBe("/from-item");
    });

    it("不传 render 时行为不变：仍是裸 <a>，不出现额外元素", () => {
      const { getByText, container } = render(<Breadcrumb items={items} />);
      const home = getByText("首页");
      expect(home.tagName).toBe("A");
      expect(home.getAttribute("href")).toBe("/");
      expect(home.className).toContain("text-muted-foreground");
      expect(container.querySelectorAll("a").length).toBe(2);
    });
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
