import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Cubes } from "./cubes";

// 结构：根容器(relative·aspect-1) > scene([aria-hidden]·grid·perspective) > N×N 个 [data-cube]，
// 每个立方体内 6 个 [data-face]。jsdom 无真实 3D/RAF 渲染，但 DOM 结构 + 内联样式可断言。
const sceneOf = (c: HTMLElement) =>
  c.querySelector("[aria-hidden]") as HTMLElement;

describe("Cubes", () => {
  it("默认渲染 8×8=64 个立方体，每个 6 面，不抛错", () => {
    const { container } = render(<Cubes />);
    expect(container.firstElementChild).not.toBeNull();
    const cubes = container.querySelectorAll("[data-cube]");
    expect(cubes.length).toBe(64);
    // 每个立方体 6 面 → 64×6 = 384 个 face
    expect(container.querySelectorAll("[data-face]").length).toBe(64 * 6);
  });

  it("gridSize prop 生效：3×3=9 个立方体，scene 为 grid + perspective", () => {
    const { container } = render(<Cubes gridSize={3} />);
    expect(container.querySelectorAll("[data-cube]").length).toBe(9);
    const scene = sceneOf(container);
    expect(scene.style.display).toBe("grid");
    expect(scene.style.perspective).not.toBe("");
    // 立方体携带行列坐标供距离计算
    const first = container.querySelector("[data-cube]") as HTMLElement;
    expect(first.dataset.row).toBe("0");
    expect(first.dataset.col).toBe("0");
  });

  it("token 默认值喂入面：faceColor=surface / edgeColor=border（带 --color- 前缀）", () => {
    const { container } = render(<Cubes gridSize={2} />);
    const face = container.querySelector("[data-face]") as HTMLElement;
    const css = face.getAttribute("style") ?? "";
    expect(css).toContain("var(--color-surface)");
    expect(css).toContain("var(--color-border)");
  });

  it("自定义 faceColor / edgeColor 透传到面内联样式", () => {
    const { container } = render(
      <Cubes gridSize={2} faceColor="oklch(0.3 0.1 200)" edgeColor="oklch(0.8 0 0)" />,
    );
    const face = container.querySelector("[data-face]") as HTMLElement;
    const css = face.getAttribute("style") ?? "";
    expect(css).toContain("oklch(0.3 0.1 200)");
    expect(css).toContain("oklch(0.8 0 0)");
  });

  it("cubeSize 固定尺寸：根容器宽高 = gridSize × cubeSize", () => {
    const { container } = render(<Cubes gridSize={4} cubeSize={20} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("80px");
    expect(root.style.height).toBe("80px");
  });

  it("front 与 back 面的 3D transform 相反（非重叠死面）", () => {
    const { container } = render(<Cubes gridSize={1} />);
    const faces = container.querySelectorAll("[data-face]");
    // 面渲染顺序：top/bottom/left/right/front/back → 索引 4=front，5=back
    const front = faces[4] as HTMLElement;
    const back = faces[5] as HTMLElement;
    expect(front.style.transform).not.toBe("");
    expect(back.style.transform).not.toBe("");
    // back 必须与 front 不同，否则背面与前面重叠 = 少渲染一个背面
    expect(back.style.transform).not.toBe(front.style.transform);
  });

  it("className / style 透传到根容器", () => {
    const { container } = render(
      <Cubes className="test-cubes" style={{ opacity: 0.5 }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-cubes");
    expect(root.style.opacity).toBe("0.5");
    // scene 标记 aria-hidden（纯装饰，不进无障碍树）
    expect(sceneOf(container)).not.toBeNull();
  });
});
