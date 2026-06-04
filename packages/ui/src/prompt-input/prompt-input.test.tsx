import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { PromptInput } from "./prompt-input";

describe("PromptInput", () => {
  it("Enter 提交 trim 后文本、非受控自动清空", () => {
    const onSubmit = vi.fn();
    const { container } = render(<PromptInput defaultValue="  你好  " onSubmit={onSubmit} />);
    const ta = container.querySelector("textarea")!;
    fireEvent.keyDown(ta, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("你好");
    expect(ta.value).toBe("");
  });
  it("Shift+Enter 不提交（换行）", () => {
    const onSubmit = vi.fn();
    const { container } = render(<PromptInput defaultValue="行一" onSubmit={onSubmit} />);
    const ta = container.querySelector("textarea")!;
    fireEvent.keyDown(ta, { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it("空白文本不提交", () => {
    const onSubmit = vi.fn();
    const { container } = render(<PromptInput defaultValue="   " onSubmit={onSubmit} />);
    fireEvent.keyDown(container.querySelector("textarea")!, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it("loading 时点停止触发 onStop", () => {
    const onStop = vi.fn();
    const { getByLabelText } = render(<PromptInput loading onStop={onStop} />);
    fireEvent.click(getByLabelText("停止生成"));
    expect(onStop).toHaveBeenCalled();
  });
});
