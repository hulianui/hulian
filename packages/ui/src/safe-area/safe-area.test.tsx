import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SafeArea } from "./safe-area";

afterEach(cleanup);

// 断言落在自定义属性 --hl-safe-*（jsdom 原样保留）而非 paddingTop 直值（cssstyle 会丢弃 env()/max()）。
describe("SafeArea", () => {
  it("默认四边都注入 env inset 自定义属性", () => {
    const { container } = render(<SafeArea />);
    const el = container.firstChild as HTMLElement;
    for (const edge of ["top", "right", "bottom", "left"]) {
      expect(el.style.getPropertyValue(`--hl-safe-${edge}`)).toContain(`env(safe-area-inset-${edge}`);
    }
  });

  it("edges 限定仅指定边", () => {
    const { container } = render(<SafeArea edges={["bottom"]} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue("--hl-safe-bottom")).toContain("safe-area-inset-bottom");
    expect(el.style.getPropertyValue("--hl-safe-top")).toBe("");
  });

  it("语义别名 horizontal 展开为左右两边", () => {
    const { container } = render(<SafeArea edges="horizontal" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue("--hl-safe-left")).not.toBe("");
    expect(el.style.getPropertyValue("--hl-safe-right")).not.toBe("");
    expect(el.style.getPropertyValue("--hl-safe-top")).toBe("");
  });

  it("min 数字转 px 进 max()", () => {
    const { container } = render(<SafeArea edges={["top"]} min={16} />);
    expect((container.firstChild as HTMLElement).style.getPropertyValue("--hl-safe-top")).toContain("max(16px");
  });

  it("min 字符串原样进 max()", () => {
    const { container } = render(<SafeArea edges={["top"]} min="1rem" />);
    expect((container.firstChild as HTMLElement).style.getPropertyValue("--hl-safe-top")).toContain("max(1rem");
  });

  it("as 多态渲染指定标签", () => {
    const { container } = render(<SafeArea as="footer" />);
    expect((container.firstChild as HTMLElement).tagName).toBe("FOOTER");
  });
});
