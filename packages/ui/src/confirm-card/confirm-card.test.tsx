import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ConfigProvider, enUS } from "../config";
import { ConfirmCard } from "./confirm-card";

const items = [
  { label: "姓名", value: "林晚晴" },
  { label: "应聘", value: "总裁私人秘书" },
];

describe("ConfirmCard", () => {
  it("渲染条目与两个动作（onEdit 提供时）", () => {
    const { container, getByText } = render(<ConfirmCard items={items} onEdit={() => {}} />);
    expect(container.textContent).toContain("林晚晴");
    expect(getByText("确认无误")).toBeTruthy();
    expect(getByText("需要修改")).toBeTruthy();
  });
  it("不传 onEdit 时不渲染修改钮（单动作场景）", () => {
    const { container, queryByText } = render(<ConfirmCard items={items} />);
    expect(queryByText("需要修改")).toBeNull();
    expect(container.querySelectorAll("button").length).toBe(1);
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

  it("ConfigProvider locale=enUS localizes defaults and action states", () => {
    const englishItems = [{ label: "Name", value: "Ada" }];
    const { getByText, rerender } = render(
      <ConfigProvider locale={enUS}>
        <ConfirmCard items={englishItems} onEdit={() => {}} />
      </ConfigProvider>,
    );
    expect(getByText("Please confirm the following information")).toBeTruthy();
    expect(getByText("Confirm")).toBeTruthy();
    expect(getByText("Edit")).toBeTruthy();
    rerender(
      <ConfigProvider locale={enUS}>
        <ConfirmCard items={englishItems} onEdit={() => {}} acted="confirmed" />
      </ConfigProvider>,
    );
    expect(getByText("Confirmed")).toBeTruthy();
  });
});
