import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Link } from "./link";

describe("Link", () => {
  it("渲染 a 标签 + href", () => {
    const { getByText } = render(<Link href="/docs">文档</Link>);
    const a = getByText("文档") as HTMLAnchorElement;
    expect(a.tagName).toBe("A");
    expect(a.getAttribute("href")).toBe("/docs");
  });

  it("external 加 target=_blank + rel + 外链图标", () => {
    const { container } = render(
      <Link href="https://x.com" external>
        外链
      </Link>,
    );
    const a = container.querySelector("a")!;
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
    expect(a.querySelector("svg")).toBeTruthy();
  });

  it("非 external 不加 target", () => {
    const { container } = render(<Link href="/x">内链</Link>);
    expect(container.querySelector("a")!.hasAttribute("target")).toBe(false);
  });

  it("tone=danger 皮肤类", () => {
    const { container } = render(
      <Link href="#" tone="danger">
        x
      </Link>,
    );
    expect(container.querySelector("a")!.className).toContain("text-danger");
  });

  it("underline=always 皮肤类", () => {
    const { container } = render(
      <Link href="#" underline="always">
        x
      </Link>,
    );
    expect(container.querySelector("a")!.className).toContain("underline");
  });
});
