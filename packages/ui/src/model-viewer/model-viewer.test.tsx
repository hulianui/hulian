import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ConfigProvider, enUS } from "../config";
import { ModelViewer } from "./model-viewer";

// jsdom 无真实合成层 / RAF transform，这里只断言结构、token 类、prop 透传与 reduced-motion 路径。
// 不依赖任何 WebGL / canvas。

const rootOf = (c: HTMLElement) => c.firstElementChild as HTMLElement;

// 默认 matchMedia：reduced-motion 关（returns matches=false）
function mockMatchMedia(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: reduced && q.includes("reduce"),
    media: q,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

beforeEach(() => mockMatchMedia(false));
afterEach(() => cleanup());

describe("ModelViewer", () => {
  it("渲染根容器 + 3D 舞台 + 模型层，不抛错", () => {
    const { container } = render(
      <ModelViewer>
        <div data-testid="model">M</div>
      </ModelViewer>,
    );
    const root = rootOf(container);
    expect(root).not.toBeNull();
    expect(root.className).toContain("relative");
    // 模型层带 preserve-3d
    const model = container.querySelector(".\\[transform-style\\:preserve-3d\\]");
    expect(model).not.toBeNull();
    expect(model?.textContent).toBe("M");
  });

  it("根容器带 token 类：border-border + bg-surface + rounded-xl", () => {
    const { container } = render(<ModelViewer />);
    const root = rootOf(container);
    expect(root.className).toContain("border-border");
    expect(root.className).toContain("bg-surface");
    expect(root.className).toContain("rounded-xl");
  });

  it("children 渲染在模型层内", () => {
    const { getByText } = render(
      <ModelViewer>
        <span>瑚琏模型</span>
      </ModelViewer>,
    );
    const el = getByText("瑚琏模型");
    expect(el.closest(".\\[transform-style\\:preserve-3d\\]")).not.toBeNull();
  });

  it("默认显示重置视角按钮；showResetButton=false 时不渲染", () => {
    const { getByRole, queryByRole, rerender } = render(<ModelViewer />);
    expect(getByRole("button", { name: /重置视角/ })).not.toBeNull();
    rerender(<ModelViewer showResetButton={false} />);
    expect(queryByRole("button", { name: /重置视角/ })).toBeNull();
  });

  it("showContactShadow=false 时不渲染接触阴影层", () => {
    const { container: c1 } = render(<ModelViewer showContactShadow />);
    expect(c1.querySelector("[aria-hidden].blur-md")).not.toBeNull();
    cleanup();
    const { container: c2 } = render(<ModelViewer showContactShadow={false} />);
    expect(c2.querySelector("[aria-hidden].blur-md")).toBeNull();
  });

  it("className 与 style 透传到根容器；默认角度写入模型静态 transform", () => {
    const { container } = render(
      <ModelViewer className="test-mv" defaultRotationX={30} defaultRotationY={45} />,
    );
    expect(rootOf(container).className).toContain("test-mv");
    const model = container.querySelector(".\\[transform-style\\:preserve-3d\\]") as HTMLElement;
    expect(model.style.transform).toContain("rotateX(30deg)");
    expect(model.style.transform).toContain("rotateY(45deg)");
  });

  it("reduced-motion 时不渲染重置按钮且根容器不带抓取光标类（交互关闭），但 children 仍在", () => {
    mockMatchMedia(true);
    const { container, getByText, queryByRole } = render(
      <ModelViewer>
        <span>内容仍在</span>
      </ModelViewer>,
    );
    expect(getByText("内容仍在")).not.toBeNull();
    expect(queryByRole("button", { name: /重置视角/ })).toBeNull();
    expect(rootOf(container).className).not.toContain("cursor-grab");
  });

  it("ConfigProvider locale=enUS localizes the reset action", () => {
    const { getByRole } = render(
      <ConfigProvider locale={enUS}>
        <ModelViewer />
      </ConfigProvider>,
    );
    expect(getByRole("button", { name: "Reset view" })).toBeTruthy();
  });
});
