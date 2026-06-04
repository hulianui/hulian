import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TypingDots } from "./typing-dots";

describe("TypingDots", () => {
  it("渲染 3 个点 + role=status", () => {
    const { container, getByRole } = render(<TypingDots />);
    expect(getByRole("status")).toBeTruthy();
    expect(container.querySelectorAll("span[aria-hidden]")).toHaveLength(3);
  });
  it("label 自定义进 aria-label", () => {
    const { getByRole } = render(<TypingDots label="生成中" />);
    expect(getByRole("status").getAttribute("aria-label")).toBe("生成中");
  });
});
