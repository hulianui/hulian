import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { QRCode } from "./qrcode";

afterEach(cleanup);

describe("QRCode", () => {
  it("渲染 svg[role=img]，aria-label 默认取 value", () => {
    const { getByRole } = render(<QRCode value="https://hulian.dev" />);
    const svg = getByRole("img");
    expect(svg.tagName.toLowerCase()).toBe("svg");
    expect(svg.getAttribute("aria-label")).toBe("https://hulian.dev");
  });

  it("暗块合成非空 path", () => {
    const { getByRole } = render(<QRCode value="HELLO" />);
    const d = getByRole("img").querySelector("path")?.getAttribute("d") ?? "";
    expect(d.length).toBeGreaterThan(0);
    expect(d.startsWith("M")).toBe(true);
  });

  it("viewBox = 模块数 + 2×margin", () => {
    const { getByRole } = render(<QRCode value="A" margin={3} />);
    const vb = getByRole("img").getAttribute("viewBox") ?? "";
    const [, , w, h] = vb.split(" ").map(Number);
    expect(w).toBe(h);
    expect(w).toBeGreaterThanOrEqual(21 + 6); // 至少版本1(21) + 两侧 margin
  });

  it("中文内容不抛错（UTF-8 覆写生效）", () => {
    expect(() => render(<QRCode value="瑚琏二维码测试" />)).not.toThrow();
  });

  it("aria-label 可覆盖", () => {
    const { getByRole } = render(<QRCode value="x" aria-label="扫码加好友" />);
    expect(getByRole("img").getAttribute("aria-label")).toBe("扫码加好友");
  });

  it("background 提供时渲底色 rect", () => {
    const { getByRole } = render(<QRCode value="x" background="#fff" />);
    expect(getByRole("img").querySelector("rect")).not.toBeNull();
  });
});
