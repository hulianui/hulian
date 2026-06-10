import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ConfirmCard } from "./confirm-card";

const items = [
  { label: "姓名", value: "林晚晴" },
  { label: "应聘", value: "总裁私人秘书" },
];

describe("ConfirmCard", () => {
  it("渲染条目与两个动作", () => {
    const { container, getByText } = render(<ConfirmCard items={items} />);
    expect(container.textContent).toContain("林晚晴");
    expect(getByText("确认无误")).toBeTruthy();
    expect(getByText("需要修改")).toBeTruthy();
  });
  it("点击触发回调", () => {
    const onConfirm = vi.fn();
    const { getByText } = render(<ConfirmCard items={items} onConfirm={onConfirm} />);
    fireEvent.click(getByText("确认无误"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
  it("acted=confirmed 后按钮禁用并显示已确认", () => {
    const { container } = render(<ConfirmCard items={items} acted="confirmed" />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((b) => expect(b.disabled).toBe(true));
    expect(container.textContent).toContain("已确认");
  });
});
