import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { CodeBlock } from "./code-block";

const writeText = vi.fn().mockResolvedValue(undefined);
beforeEach(() => {
  writeText.mockClear();
  Object.assign(navigator, { clipboard: { writeText } });
});

describe("CodeBlock", () => {
  it("渲染代码文本于 <pre><code>", () => {
    const { container, getByText } = render(<CodeBlock code="const x = 1" />);
    expect(container.querySelector("pre code")).toBeTruthy();
    expect(getByText("const x = 1")).toBeTruthy();
  });

  it("默认渲染复制按钮，点击调用 clipboard.writeText(code)", () => {
    const { getByLabelText } = render(<CodeBlock code={"line1\nline2"} />);
    fireEvent.click(getByLabelText("复制"));
    expect(writeText).toHaveBeenCalledWith("line1\nline2");
  });

  it("复制后按钮 aria-label 切为已复制", () => {
    const { getByLabelText } = render(<CodeBlock code="x" />);
    fireEvent.click(getByLabelText("复制"));
    expect(getByLabelText("已复制")).toBeTruthy();
  });

  it("copyable={false} 不渲染复制按钮", () => {
    const { queryByLabelText } = render(<CodeBlock code="x" copyable={false} />);
    expect(queryByLabelText("复制")).toBeNull();
  });

  it("lang 渲染语言标签", () => {
    const { getByText } = render(<CodeBlock code="x" lang="tsx" />);
    expect(getByText("tsx")).toBeTruthy();
  });

  it("透传 className 到外壳", () => {
    const { container } = render(<CodeBlock code="x" className="my-cb" />);
    expect(container.firstElementChild!.classList.contains("my-cb")).toBe(true);
  });
});
