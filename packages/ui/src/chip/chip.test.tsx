import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Chip } from "./chip";

describe("Chip", () => {
  it("渲染内容", () => {
    const { getByText } = render(<Chip>标签</Chip>);
    expect(getByText("标签")).toBeTruthy();
  });

  it("无 onClose 时不渲染关闭按钮", () => {
    const { queryByLabelText } = render(<Chip>标签</Chip>);
    expect(queryByLabelText("移除")).toBeNull();
  });

  it("有 onClose 时渲染关闭按钮，点击触发回调", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(<Chip onClose={fn}>标签</Chip>);
    fireEvent.click(getByLabelText("移除"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("variant=outline tone=danger 皮肤类", () => {
    const { container } = render(
      <Chip variant="outline" tone="danger">
        x
      </Chip>,
    );
    expect(container.firstElementChild!.className).toContain("border-danger");
  });

  it("dot 渲染前导圆点", () => {
    const { container } = render(<Chip dot>x</Chip>);
    expect(container.querySelector(".rounded-full.bg-primary")).toBeTruthy();
  });

  it("透传 className", () => {
    const { container } = render(<Chip className="my-chip">x</Chip>);
    expect(container.firstElementChild!.classList.contains("my-chip")).toBe(true);
  });
});
