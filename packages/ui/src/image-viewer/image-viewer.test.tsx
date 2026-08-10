import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ImageViewer } from "./image-viewer";

afterEach(cleanup);

const images = [
  { src: "https://example.com/a.jpg", alt: "图 A" },
  { src: "https://example.com/b.jpg", alt: "图 B" },
];

/** 取舞台大图（object-contain，区别于缩略图 object-cover）。 */
function stageImg() {
  return document.querySelector<HTMLImageElement>("img.object-contain");
}

describe("ImageViewer 加载态", () => {
  it("打开时大图未加载 → 显示 spinner 且大图淡出(opacity-0)", () => {
    render(<ImageViewer open images={images} index={0} onOpenChange={vi.fn()} onIndexChange={vi.fn()} />);
    expect(document.querySelector(".animate-spin")).not.toBeNull();
    const img = stageImg();
    expect(img?.className).toContain("opacity-0");
  });

  it("图片 onLoad 后 → spinner 消失且大图淡入(opacity-100)", () => {
    render(<ImageViewer open images={images} index={0} onOpenChange={vi.fn()} onIndexChange={vi.fn()} />);
    const img = stageImg()!;
    fireEvent.load(img);
    expect(document.querySelector(".animate-spin")).toBeNull();
    expect(stageImg()?.className).toContain("opacity-100");
  });

  it("切图(index 变) → 加载态重置回 spinner", () => {
    const { rerender } = render(
      <ImageViewer open images={images} index={0} onOpenChange={vi.fn()} onIndexChange={vi.fn()} />,
    );
    fireEvent.load(stageImg()!);
    expect(document.querySelector(".animate-spin")).toBeNull();
    // 翻到下一张：新大图未加载 → spinner 回归
    rerender(<ImageViewer open images={images} index={1} onOpenChange={vi.fn()} onIndexChange={vi.fn()} />);
    expect(document.querySelector(".animate-spin")).not.toBeNull();
    expect(stageImg()?.className).toContain("opacity-0");
  });
});
