import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StreamingText } from "./streaming-text";

describe("StreamingText", () => {
  it("渲染当前文本", () => {
    const { getByText } = render(<StreamingText text="部分回答" />);
    expect(getByText(/部分回答/)).toBeTruthy();
  });
  it("streaming 时尾随闪烁光标", () => {
    const { container } = render(<StreamingText text="生成中" streaming />);
    expect(container.querySelector("[aria-hidden]")?.textContent).toBe("|");
  });
  it("非 streaming 无光标", () => {
    const { container } = render(<StreamingText text="完成" />);
    expect(container.querySelector("[aria-hidden]")).toBeNull();
  });
});
