import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { avatarVariants, Avatar } from "./avatar";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Avatar", () => {
  it("稳定父更新时跳过头像子树", async () => {
    await expectMemoSkipsSubtree(() => <Avatar size="md" fallback="ZS" />);
  });

  it("尺寸变体", () => {
    expect(avatarVariants({ size: "lg" })).toContain("size-12");
  });
  it("无 src 时渲染 fallback 文本", () => {
    const { container } = render(<Avatar fallback="ZS" />);
    expect(container.textContent).toContain("ZS");
  });
});
