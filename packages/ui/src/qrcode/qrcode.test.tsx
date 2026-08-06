import { Profiler } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QRCode } from "./qrcode";
import { buildQRCode, qrCodeSvgString } from "./qrcode-core";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

afterEach(cleanup);

describe("QRCode", () => {
  it("稳定父组件更新时跳过重复编码与渲染", async () => {
    await expectMemoSkipsSubtree(() => <QRCode value="https://hulian.dev" />);
  });

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

describe("buildQRCode", () => {
  it("boostLevel 默认在不升版本的前提下抬高纠错级别", () => {
    const plain = buildQRCode({ value: "hi", level: "L", boostLevel: false });
    const boosted = buildQRCode({ value: "hi", level: "L" });
    expect(boosted.version).toBe(plain.version); // 版本不许被抬
    expect(["M", "Q", "H"]).toContain(boosted.level);
  });

  it("boostLevel=false 老老实实用给定级别", () => {
    expect(buildQRCode({ value: "hi", level: "L", boostLevel: false }).level).toBe("L");
  });

  it("minVersion 抬高版本（模块数随之变大）", () => {
    const auto = buildQRCode({ value: "hi", boostLevel: false });
    const pinned = buildQRCode({ value: "hi", minVersion: 6, boostLevel: false });
    expect(auto.version).toBeLessThan(6);
    expect(pinned.version).toBe(6);
    expect(pinned.count).toBeGreaterThan(auto.count);
  });

  it("minVersion 低于内容所需版本时被忽略，不截断内容", () => {
    const long = "x".repeat(400);
    const auto = buildQRCode({ value: long, boostLevel: false });
    const pinned = buildQRCode({ value: long, minVersion: 1, boostLevel: false });
    expect(pinned.version).toBe(auto.version);
  });

  it("total = 模块数 + 2×margin", () => {
    const m = buildQRCode({ value: "hi", margin: 4 });
    expect(m.total).toBe(m.count + 8);
  });
});

describe("qrCodeSvgString", () => {
  it("出独立可下载的 SVG（带 xmlns 与具体颜色）", () => {
    const svg = qrCodeSvgString({ value: "https://hulian.dev" });
    expect(svg.startsWith("<svg xmlns=")).toBe(true);
    expect(svg).toContain('fill="#000000"');
    expect(svg).toContain('fill="#ffffff"'); // 导出默认给白底
    expect(svg).toContain("</svg>");
  });

  it("与组件同源：同参数下 path 一致", () => {
    const { path } = buildQRCode({ value: "same-source" });
    expect(qrCodeSvgString({ value: "same-source" })).toContain(path);
  });

  it("background 传 undefined 之外的值可覆盖", () => {
    expect(qrCodeSvgString({ value: "x", background: "#eef" })).toContain('fill="#eef"');
  });
});

describe("QRCode 的 logo 抠空开关", () => {
  it("默认垫底色块抠空", () => {
    const { container } = render(
      <QRCode value="x" level="H" logo={{ src: "/l.png" }} />,
    );
    expect(container.querySelectorAll("rect")).toHaveLength(1);
  });

  it("excavate=false 不垫底、opacity 透传（水印式 logo）", () => {
    const { container } = render(
      <QRCode value="x" level="H" logo={{ src: "/l.png", excavate: false, opacity: 0.3 }} />,
    );
    expect(container.querySelectorAll("rect")).toHaveLength(0);
    expect(container.querySelector("image")?.getAttribute("opacity")).toBe("0.3");
  });
});
