import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StickerPeel } from "./sticker-peel";

const SRC = "https://example.com/sticker.png";

describe("StickerPeel", () => {
  it("渲染根容器 + 两层贴纸图（正面 + 卷边），不抛错", () => {
    const { container } = render(<StickerPeel imageSrc={SRC} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(2);
    imgs.forEach((i) => expect(i.getAttribute("src")).toBe(SRC));
  });

  it("根容器带拖拽 group 类 + token 化的 CSS 变量（宽/旋转/卷边）", () => {
    const { container } = render(
      <StickerPeel imageSrc={SRC} width={160} rotate={12} peelBackHoverPct={25} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("group/sticker");
    expect(root.className).toContain("cursor-grab");
    expect(root.style.getPropertyValue("--hulian-sticker-w")).toBe("160px");
    expect(root.style.getPropertyValue("--hulian-sticker-rotate")).toBe("12deg");
    expect(root.style.getPropertyValue("--hulian-sticker-hover")).toBe("25%");
  });

  it("高光层走 var(--color-foreground)（token）；lightingIntensity=0 时不渲染高光", () => {
    const { container } = render(<StickerPeel imageSrc={SRC} />);
    const light = container.querySelector("[aria-hidden].mix-blend-soft-light") as HTMLElement;
    expect(light).not.toBeNull();
    expect(light.className).toContain("var(--color-foreground)");

    const { container: c2 } = render(<StickerPeel imageSrc={SRC} lightingIntensity={0} />);
    expect(c2.querySelector(".mix-blend-soft-light")).toBeNull();
  });

  it("draggable=false 时不可拖拽（cursor-default，无 grab）", () => {
    const { container } = render(<StickerPeel imageSrc={SRC} draggable={false} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("cursor-default");
    expect(root.className).not.toContain("cursor-grab");
  });

  it("motion-reduce 关过渡 + className/props 透传到根", () => {
    const { container } = render(
      <StickerPeel imageSrc={SRC} className="ring-2" data-testid="sp" alt="贴纸" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("ring-2");
    expect(root.getAttribute("data-testid")).toBe("sp");
    // 存在带 motion-reduce 停过渡的元素（卷边层 / 容器层）
    const reduced = Array.from(container.querySelectorAll<HTMLElement>("*")).filter((el) =>
      el.className?.toString().includes("motion-reduce:[transition:none]"),
    );
    expect(reduced.length).toBeGreaterThan(0);
    expect(container.querySelector('img[alt="贴纸"]')).not.toBeNull();
  });
});
