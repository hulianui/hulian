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

describe("缓存图片的淡入态", () => {
  // 图片命中缓存时 load 事件先于 React 挂 onLoad 烧完，只等 onLoad 会永久停在 opacity-0
  const stubComplete = (complete: boolean, naturalWidth: number) => {
    const proto = HTMLImageElement.prototype;
    const origComplete = Object.getOwnPropertyDescriptor(proto, "complete");
    const origWidth = Object.getOwnPropertyDescriptor(proto, "naturalWidth");
    Object.defineProperty(proto, "complete", { configurable: true, get: () => complete });
    Object.defineProperty(proto, "naturalWidth", { configurable: true, get: () => naturalWidth });
    return () => {
      if (origComplete) Object.defineProperty(proto, "complete", origComplete);
      else delete (proto as unknown as Record<string, unknown>).complete;
      if (origWidth) Object.defineProperty(proto, "naturalWidth", origWidth);
      else delete (proto as unknown as Record<string, unknown>).naturalWidth;
    };
  };

  it("挂载时图片已解码完成 → 直接可见，不必等 onLoad", () => {
    const restore = stubComplete(true, 256);
    try {
      const { container } = render(<Image src="/cached.png" alt="缓存图" />);
      const img = container.querySelector("img")!;
      expect(img.className).toContain("opacity-100");
      expect(img.className).not.toContain("opacity-0");
    } finally {
      restore();
    }
  });

  it("尚未解码完成时仍保持透明，等 onLoad 淡入", () => {
    const restore = stubComplete(false, 0);
    try {
      const { container } = render(<Image src="/pending.png" alt="加载中" />);
      expect(container.querySelector("img")!.className).toContain("opacity-0");
    } finally {
      restore();
    }
  });
});
