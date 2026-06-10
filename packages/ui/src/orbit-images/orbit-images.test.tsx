import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { OrbitImages } from "./orbit-images";

// 结构：根容器([aria-hidden]) > 缩放层 > 旋转层 > N 个轨道子项(.absolute·offset-path 动画)。
// 纯 CSS offset-path，无 WebGL/canvas，jsdom 安全。
const rootOf = (c: HTMLElement) => c.firstElementChild as HTMLElement;
// 轨道子项靠 className 里的 hulian-orbit-images 动画类唯一识别（jsdom 对 offset-path 序列化不可靠）。
const orbitItems = (c: HTMLElement) =>
  Array.from(
    c.querySelectorAll('div[class*="animation:hulian-orbit-images"]'),
  ) as HTMLElement[];

const sample = (n: number) =>
  Array.from({ length: n }, (_, i) => <span key={i}>{`★${i}`}</span>);

describe("OrbitImages", () => {
  it("渲染根容器(aria-hidden) + 每个 item 一个轨道节点，不抛错", () => {
    const { container, getByText } = render(<OrbitImages items={sample(4)} />);
    const root = rootOf(container);
    expect(root).not.toBeNull();
    expect(root.getAttribute("aria-hidden")).toBe("true");
    // 4 个子项内容都在 DOM 里
    expect(getByText("★0")).not.toBeNull();
    expect(getByText("★3")).not.toBeNull();
    // 轨道节点数量 == item 数量
    expect(orbitItems(container).length).toBe(4);
  });

  it("根容器吃 aspect-square / 自适应宽度 token 类 + className 透传", () => {
    const { container } = render(
      <OrbitImages items={sample(2)} className="test-orbit-class" />,
    );
    const root = rootOf(container);
    expect(root.className).toContain("aspect-square");
    expect(root.className).toContain("w-full");
    expect(root.className).toContain("test-orbit-class");
  });

  it("轨道子项带 hulian-orbit-images 动画类 + motion-reduce 禁用类 + will-change", () => {
    const { container } = render(<OrbitImages items={sample(3)} />);
    const item = orbitItems(container)[0];
    expect(item.className).toContain("[animation:hulian-orbit-images");
    expect(item.className).toContain("motion-reduce:[animation:none]");
    expect(item.className).toContain("will-change-[offset-distance]");
  });

  it("duration prop → 子项 animationDuration 内联；fill=true 时各项负延迟错峰分布", () => {
    const { container } = render(
      <OrbitImages items={sample(4)} duration={20} fill />,
    );
    const els = orbitItems(container);
    expect(els[0].style.animationDuration).toBe("20s");
    // index0 延迟 0；index 递增 → 负延迟（错峰铺满路径）
    expect(els[0].style.animationDelay).toBe("0s");
    expect(els[1].style.animationDelay).toBe("-5s");
    expect(els[2].style.animationDelay).toBe("-10s");
  });

  it("fill=false 时所有子项延迟为 0（从同一起点鱼贯出发）", () => {
    const { container } = render(
      <OrbitImages items={sample(3)} duration={30} fill={false} />,
    );
    for (const el of orbitItems(container)) {
      expect(el.style.animationDelay).toBe("0s");
    }
  });

  it("direction=reverse → 子项 animationDirection 为 reverse", () => {
    const { container } = render(
      <OrbitImages items={sample(2)} direction="reverse" />,
    );
    expect(orbitItems(container)[0].style.animationDirection).toBe("reverse");
  });

  it("showPath=true 渲染描边 path，默认吃 var(--color-border) token", () => {
    const { container } = render(
      <OrbitImages items={sample(2)} showPath shape="circle" />,
    );
    const path = container.querySelector("svg path");
    expect(path).not.toBeNull();
    expect(path?.getAttribute("stroke")).toBe("var(--color-border)");
    // 路径 d 非空（几何已生成）
    expect((path?.getAttribute("d") ?? "").length).toBeGreaterThan(0);
  });

  it("缩放层固定 baseWidth 设计画布（jsdom 量不到宽度时回退 scale(1) 仍可见）", () => {
    const { container } = render(
      <OrbitImages items={sample(2)} baseWidth={1400} />,
    );
    const scaleLayer = rootOf(container).firstElementChild as HTMLElement;
    expect(scaleLayer.className).toContain("origin-top-left");
    expect(scaleLayer.style.width).toBe("1400px");
    expect(scaleLayer.style.height).toBe("1400px");
    // jsdom offsetWidth=0 → 回退 scale(1)，缩放层不得停留在隐藏态
    expect(scaleLayer.style.transform).toBe("scale(1)");
    expect(scaleLayer.style.visibility).not.toBe("hidden");
  });

  it("itemSize 语义是最终 CSS 像素：scale=1 时子项盒尺寸直出 itemSize", () => {
    const { container } = render(
      <OrbitImages items={sample(2)} itemSize={48} />,
    );
    const item = orbitItems(container)[0];
    expect(item.style.width).toBe("48px");
    expect(item.style.height).toBe("48px");
    // 子项锚定缩放层原点，由 offset-anchor 把中心吸到路径点上
    expect(item.style.left).toBe("0px");
    expect(item.style.top).toBe("0px");
  });

  it("centerContent 渲染在 z-10 居中层", () => {
    const { getByText } = render(
      <OrbitImages items={sample(2)} centerContent={<b>LOGO</b>} />,
    );
    const layer = getByText("LOGO").closest("div");
    expect(layer?.className).toContain("z-10");
    expect(layer?.className).toContain("items-center");
  });
});
