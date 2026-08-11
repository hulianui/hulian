import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Banner } from "./banner";

describe("Banner", () => {
  it("渲染文案与 role=status", () => {
    const { getByText, getByRole } = render(<Banner>系统将于今晚维护</Banner>);
    expect(getByText("系统将于今晚维护")).toBeTruthy();
    expect(getByRole("status")).toBeTruthy();
  });

  it("默认 tone=info soft 皮肤", () => {
    const { getByRole } = render(<Banner>x</Banner>);
    expect(getByRole("status").className).toContain("text-info");
  });

  it("solid danger：实色填充", () => {
    const { getByRole } = render(<Banner variant="solid" tone="danger">x</Banner>);
    expect(getByRole("status").className).toContain("bg-danger");
  });

  it("icon 渲染前导槽", () => {
    const { getByTestId } = render(<Banner icon={<svg data-testid="ic" />}>x</Banner>);
    expect(getByTestId("ic")).toBeTruthy();
  });

  it("action 渲染右侧操作", () => {
    const { getByText } = render(<Banner action={<a href="#">详情</a>}>x</Banner>);
    expect(getByText("详情")).toBeTruthy();
  });

  it("无 onClose 不渲染关闭按钮", () => {
    const { queryByLabelText } = render(<Banner>x</Banner>);
    expect(queryByLabelText("关闭")).toBeNull();
  });

  it("onClose 点击触发回调", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(<Banner onClose={fn}>x</Banner>);
    fireEvent.click(getByLabelText("关闭"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("scrollable 走 Marquee（含动画层）", () => {
    const { container } = render(<Banner scrollable>很长的公告文本循环滚动</Banner>);
    expect(container.querySelector(".group.overflow-hidden")).toBeTruthy();
  });

  it("非 scrollable 居中默认截断", () => {
    const { container } = render(<Banner>x</Banner>);
    const clipped = container.querySelector(".truncate");
    expect(clipped).toBeTruthy();
    // truncate 的 overflow:hidden / text-overflow:ellipsis 对 inline 元素不生效，
    // 只剩 white-space:nowrap —— 文字既不换行又不被裁剪，长文案会撑破 flex 容器
    // 把 action 挤出屏幕。所以承载 truncate 的这个节点必须是块级。
    expect(clipped?.classList.contains("block")).toBe(true);
  });

  it("透传 className", () => {
    const { getByRole } = render(<Banner className="my-banner">x</Banner>);
    expect(getByRole("status").classList.contains("my-banner")).toBe(true);
  });
});
