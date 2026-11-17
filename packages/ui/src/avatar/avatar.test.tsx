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

describe("Avatar · tone / ring", () => {
  it("默认中性灰底、无外圈（存量渲染不变）", () => {
    const cls = avatarVariants({});
    expect(cls).toContain("bg-surface-hover");
    expect(cls).not.toContain("ring-2");
  });

  it("brand + ring：主色浅底主色字，外圈取主色浅边", () => {
    const cls = avatarVariants({ tone: "brand", ring: true });
    expect(cls).toContain("bg-primary-subtle");
    expect(cls).toContain("text-primary");
    expect(cls).toContain("ring-2");
    expect(cls).toContain("ring-primary-border");
  });

  it("中性 + ring 取 border 色", () => {
    expect(avatarVariants({ ring: true })).toContain("ring-border");
  });
});
