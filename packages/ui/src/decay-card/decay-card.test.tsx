import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// 默认走「非 reduced-motion」分支，确保 RAF/监听挂载路径在 jsdom 下也不抛错
vi.mock("motion/react", () => ({
  useReducedMotion: () => false,
}));

import { DecayCard } from "./decay-card";

describe("DecayCard", () => {
  it("渲染根容器 + SVG 滤镜 + 图片", () => {
    const { container } = render(<DecayCard image="/x.jpg" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeTruthy();
    // 关键 token 类：边框 / 表面 / 圆角
    const cls = root.getAttribute("class")!;
    expect(cls).toContain("border-border");
    expect(cls).toContain("bg-surface");
    expect(cls).toContain("rounded-xl");
    // SVG 滤镜原语存在
    expect(container.querySelector("feTurbulence")).toBeTruthy();
    expect(container.querySelector("feDisplacementMap")).toBeTruthy();
    expect(container.querySelector("image")?.getAttribute("href")).toBe("/x.jpg");
  });

  it("width/height 落内联尺寸，className/style 透传", () => {
    const { container } = render(
      <DecayCard width={240} height={320} className="shadow-xl" style={{ opacity: 0.5 }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("240px");
    expect(root.style.height).toBe("320px");
    expect(root.style.opacity).toBe("0.5");
    expect(root.getAttribute("class")).toContain("shadow-xl");
  });

  it("filter id 不含冒号且被 image 引用", () => {
    const { container } = render(<DecayCard />);
    const filterEl = container.querySelector("filter")!;
    const id = filterEl.getAttribute("id")!;
    expect(id).not.toContain(":");
    const imageFilter = container.querySelector("image")?.getAttribute("filter");
    expect(imageFilter).toBe(`url(#${id})`);
  });

  it("传入 baseFrequency/numOctaves/seed 透传到 feTurbulence", () => {
    const { container } = render(
      <DecayCard baseFrequency={0.03} numOctaves={3} seed={9} />,
    );
    const turb = container.querySelector("feTurbulence")!;
    expect(turb.getAttribute("baseFrequency")).toBe("0.03");
    expect(turb.getAttribute("numOctaves")).toBe("3");
    expect(turb.getAttribute("seed")).toBe("9");
  });

  it("children 渲染在文字层", () => {
    const { getByText } = render(<DecayCard>瑚琏</DecayCard>);
    expect(getByText("瑚琏")).toBeTruthy();
  });
});
