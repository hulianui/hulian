import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { avatarVariants, Avatar } from "./avatar";

describe("Avatar", () => {
  it("尺寸变体", () => {
    expect(avatarVariants({ size: "lg" })).toContain("size-12");
  });
  it("无 src 时渲染 fallback 文本", () => {
    const { container } = render(<Avatar fallback="ZS" />);
    expect(container.textContent).toContain("ZS");
  });
});
