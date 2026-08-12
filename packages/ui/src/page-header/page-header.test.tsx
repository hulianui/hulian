import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { PageHeader } from "./page-header";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

describe("PageHeader", () => {
  it("title 渲染为 h1（语义页头标题）", () => {
    const { container } = render(<PageHeader title="订单详情" />);
    const h1 = container.querySelector("h1");
    expect(h1).toBeTruthy();
    expect(h1!.textContent).toBe("订单详情");
  });

  it("根元素为 header，title 不落到 DOM title 属性上", () => {
    const { container } = render(<PageHeader title="标题" />);
    const header = container.querySelector("header")!;
    expect(header).toBeTruthy();
    expect(header.getAttribute("title")).toBeNull();
  });

  it("提供 subTitle 时渲染副标题文本", () => {
    const { getByText } = render(<PageHeader title="标题" subTitle="共 128 条记录" />);
    expect(getByText("共 128 条记录")).toBeTruthy();
  });

  it("不提供 subTitle 时不渲染副标题节点", () => {
    const { queryByText } = render(<PageHeader title="标题" />);
    expect(queryByText("共 128 条记录")).toBeNull();
  });

  it("提供 onBack → 渲染返回按钮，点击触发回调", () => {
    const onBack = vi.fn();
    const { container } = render(<PageHeader title="标题" onBack={onBack} />);
    const back = container.querySelector('button[aria-label="返回"]') as HTMLButtonElement;
    expect(back).toBeTruthy();
    fireEvent.click(back);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("backLabel 可自定义返回按钮无障碍标签", () => {
    const { container } = render(
      <PageHeader title="标题" onBack={() => {}} backLabel="返回列表" />,
    );
    expect(container.querySelector('button[aria-label="返回列表"]')).toBeTruthy();
  });

  it("默认返回标签跟随 ConfigProvider", () => {
    const { container } = render(<ConfigProvider locale={enUS}><PageHeader title="Title" onBack={() => {}} /></ConfigProvider>);
    expect(container.querySelector('button[aria-label="Back"]')).toBeTruthy();
  });

  it("不提供 onBack → 无返回按钮", () => {
    const { container } = render(<PageHeader title="标题" />);
    expect(container.querySelector("button")).toBeNull();
  });

  it("breadcrumb / tags / extra / footer 槽位均渲染", () => {
    const { getByTestId } = render(
      <PageHeader
        title="标题"
        breadcrumb={<nav data-testid="bc" />}
        tags={<span data-testid="tag" />}
        extra={<button data-testid="extra" />}
        footer={<div data-testid="footer" />}
      />,
    );
    expect(getByTestId("bc")).toBeTruthy();
    expect(getByTestId("tag")).toBeTruthy();
    expect(getByTestId("extra")).toBeTruthy();
    expect(getByTestId("footer")).toBeTruthy();
  });

  it("bordered 时渲染分隔线(role=separator)，默认不渲染", () => {
    const { container, rerender } = render(<PageHeader title="标题" />);
    expect(container.querySelector('[role="separator"]')).toBeNull();
    rerender(<PageHeader title="标题" bordered />);
    expect(container.querySelector('[role="separator"]')).toBeTruthy();
  });

  it("透传 className 到根 header", () => {
    const { container } = render(<PageHeader title="标题" className="my-ph" />);
    expect(container.querySelector("header")!.classList.contains("my-ph")).toBe(true);
  });
});

describe("PageHeader 元信息行（#240）", () => {
  const metaOf = (c: HTMLElement) =>
    c.querySelector('[data-slot="page-header-meta"]') as HTMLElement | null;
  const separatorsIn = (row: HTMLElement) => row.querySelectorAll('li[aria-hidden="true"]');

  it("不传 meta 时不渲染元信息行（行为与今天逐字相同）", () => {
    const { container } = render(<PageHeader title="张三" />);
    expect(metaOf(container)).toBeNull();
  });

  it("meta 各项渲染为 li，分隔符数 = 项数 - 1", () => {
    const { container } = render(<PageHeader title="张三" meta={["330106…512", "男", "3 段社保"]} />);
    const row = metaOf(container)!;
    expect(row.tagName).toBe("UL");
    const seps = separatorsIn(row);
    expect(seps.length).toBe(2);
    expect([...seps].every((s) => s.textContent === "·")).toBe(true);
    expect(row.querySelectorAll("li").length).toBe(5); // 3 项 + 2 分隔符
  });

  it("中间某项为空时不产生多余分隔符（消费方拼 ::before 中点要绕的正是这件事）", () => {
    const { container } = render(
      <PageHeader title="张三" meta={["330106…512", null, "男", undefined, false, "", "2 家公司"]} />,
    );
    const row = metaOf(container)!;
    // 留下 3 项 → 2 个分隔符，且首尾没有孤零零的点
    expect(separatorsIn(row).length).toBe(2);
    expect(row.textContent).toBe("330106…512·男·2 家公司");
    expect(row.firstElementChild!.getAttribute("aria-hidden")).toBeNull();
    expect(row.lastElementChild!.getAttribute("aria-hidden")).toBeNull();
  });

  it("全部为空时整行不渲染（不留一个空壳 ul）", () => {
    const { container } = render(<PageHeader title="张三" meta={[null, undefined, false, ""]} />);
    expect(metaOf(container)).toBeNull();
  });

  it("数字 0 是事实值，不算空", () => {
    const { container } = render(<PageHeader title="张三" meta={[0, "男"]} />);
    const row = metaOf(container)!;
    expect(separatorsIn(row).length).toBe(1);
    expect(row.textContent).toBe("0·男");
  });

  it("metaSeparator 可换，且分隔符是 aria-hidden 装饰位", () => {
    const { container } = render(<PageHeader title="张三" meta={["A", "B"]} metaSeparator="/" />);
    const seps = separatorsIn(metaOf(container)!);
    expect(seps.length).toBe(1);
    expect(seps[0]!.textContent).toBe("/");
  });

  it("元信息行排在标题行之后、footer 之前", () => {
    const { container } = render(
      <PageHeader title="张三" meta={["男"]} footer={<div data-testid="footer" />} />,
    );
    const row = metaOf(container)!;
    const h1 = container.querySelector("h1")!;
    const footer = container.querySelector('[data-testid="footer"]')!;
    expect(h1.compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(row.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("meta 项可以是 ReactNode 而不只是字符串", () => {
    const { getByTestId } = render(
      <PageHeader title="张三" meta={[<span key="a" data-testid="node" />, "男"]} />,
    );
    expect(getByTestId("node")).toBeTruthy();
  });
});
