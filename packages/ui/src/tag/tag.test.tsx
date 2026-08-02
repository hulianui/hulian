import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Tag } from "./tag";
import { ConfigProvider, enUS } from "../config";

describe("Tag", () => {
  it("渲染内容", () => {
    const { getByText } = render(<Tag>状态</Tag>);
    expect(getByText("状态")).toBeTruthy();
  });

  it("默认 tone=neutral soft 皮肤", () => {
    const { container } = render(<Tag>x</Tag>);
    expect(container.firstElementChild!.className).toContain("text-muted");
  });

  it("tone=success outline 皮肤类", () => {
    const { container } = render(
      <Tag variant="outline" tone="success">
        x
      </Tag>,
    );
    expect(container.firstElementChild!.className).toContain("border-success");
  });

  it("dot 渲染状态圆点（颜色随 tone）", () => {
    const { container } = render(
      <Tag dot tone="success">
        x
      </Tag>,
    );
    expect(container.querySelector(".rounded-full.bg-success")).toBeTruthy();
  });

  it("pulse 渲染呼吸动画层", () => {
    const { container } = render(
      <Tag dot pulse tone="brand">
        x
      </Tag>,
    );
    expect(container.querySelector(".animate-ping")).toBeTruthy();
  });

  it("pulse 仅在 dot 为真时生效", () => {
    const { container } = render(
      <Tag pulse tone="brand">
        x
      </Tag>,
    );
    expect(container.querySelector(".animate-ping")).toBeNull();
  });

  it("icon 存在时不渲染 dot", () => {
    const { getByText, container } = render(
      <Tag dot icon={<i>ic</i>} tone="success">
        x
      </Tag>,
    );
    expect(getByText("ic")).toBeTruthy();
    expect(container.querySelector(".size-1\\.5")).toBeNull();
  });

  it("无 onClose 时不渲染关闭按钮", () => {
    const { queryByLabelText } = render(<Tag>x</Tag>);
    expect(queryByLabelText("移除")).toBeNull();
  });

  it("有 onClose 时点击触发回调", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(<Tag onClose={fn}>x</Tag>);
    fireEvent.click(getByLabelText("移除"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("enUS localizes the close button accessible label", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(
      <ConfigProvider locale={enUS}>
        <Tag onClose={fn}>Status</Tag>
      </ConfigProvider>,
    );
    fireEvent.click(getByLabelText("Remove"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("a legacy custom locale without tag keeps the Chinese close label", () => {
    const locale = { ...enUS, components: { ...enUS.components!, tag: undefined } };
    const { getByLabelText } = render(
      <ConfigProvider locale={locale}>
        <Tag onClose={() => {}}>Status</Tag>
      </ConfigProvider>,
    );
    expect(getByLabelText("移除")).toBeTruthy();
  });

  it("isDisabled 降透明度且关闭按钮禁用不触发", () => {
    const fn = vi.fn();
    const { getByLabelText, container } = render(
      <Tag isDisabled onClose={fn}>
        x
      </Tag>,
    );
    expect(container.firstElementChild!.className).toContain("opacity-50");
    const btn = getByLabelText("移除") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(fn).not.toHaveBeenCalled();
  });

  it("透传 className", () => {
    const { container } = render(<Tag className="my-tag">x</Tag>);
    expect(container.firstElementChild!.classList.contains("my-tag")).toBe(true);
  });
});
