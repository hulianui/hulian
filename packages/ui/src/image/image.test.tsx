import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Image } from "./image";

describe("Image", () => {
  it("渲染 img + src/alt", () => {
    const { getByAltText } = render(<Image src="/a.png" alt="图A" />);
    const img = getByAltText("图A") as HTMLImageElement;
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toBe("/a.png");
  });

  it("加载前 opacity-0，onLoad 后 opacity-100", () => {
    const { getByAltText } = render(<Image src="/a.png" alt="图A" />);
    const img = getByAltText("图A");
    expect(img.className).toContain("opacity-0");
    fireEvent.load(img);
    expect(img.className).toContain("opacity-100");
  });

  it("原图失败且有 fallbackSrc → 切到回退图", () => {
    const { getByAltText } = render(<Image src="/bad.png" fallbackSrc="/fb.png" alt="图A" />);
    const img = getByAltText("图A") as HTMLImageElement;
    fireEvent.error(img);
    expect(img.getAttribute("src")).toBe("/fb.png");
  });

  it("原图失败且无 fallback → 卸载 img 仅留占位底", () => {
    const { queryByAltText, getByAltText } = render(<Image src="/bad.png" alt="图A" />);
    fireEvent.error(getByAltText("图A"));
    expect(queryByAltText("图A")).toBeNull();
  });

  it("isZoomed 加 group-hover:scale-110", () => {
    const { getByAltText } = render(<Image src="/a.png" alt="图A" isZoomed />);
    expect(getByAltText("图A").className).toContain("group-hover:scale-110");
  });

  it("radius=full 外壳圆形", () => {
    const { container } = render(<Image src="/a.png" alt="x" radius="full" />);
    expect(container.firstElementChild!.className).toContain("rounded-full");
  });
});
