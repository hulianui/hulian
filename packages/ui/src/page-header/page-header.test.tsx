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
