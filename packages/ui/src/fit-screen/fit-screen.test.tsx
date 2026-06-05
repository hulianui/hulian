import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { FitScreen, computeFit } from "./fit-screen";

// jsdom 无 ResizeObserver → 本地 stub(组件内已 typeof 守卫，渲染不抛即可)。
beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

const DESIGN = { designW: 1920, designH: 1080 };

describe("computeFit", () => {
  it("fit 取较小缩放(等比不裁切)", () => {
    // 宽够高不够 → 取高方向较小者
    const r = computeFit({ outerW: 1920, outerH: 540, ...DESIGN, mode: "fit" });
    expect(r.scaleX).toBe(0.5);
    expect(r.scaleY).toBe(0.5);
  });

  it("cover 取较大缩放(铺满可裁切)", () => {
    const r = computeFit({ outerW: 1920, outerH: 540, ...DESIGN, mode: "cover" });
    expect(r.scaleX).toBe(1);
    expect(r.scaleY).toBe(1);
  });

  it("stretch 各轴独立(可变形)", () => {
    const r = computeFit({ outerW: 960, outerH: 1080, ...DESIGN, mode: "stretch" });
    expect(r.scaleX).toBe(0.5);
    expect(r.scaleY).toBe(1);
  });

  it("等比铺满时 scale=1", () => {
    const r = computeFit({ outerW: 1920, outerH: 1080, ...DESIGN, mode: "fit" });
    expect(r.scaleX).toBe(1);
  });

  it("非法/零尺寸回退 scale=1", () => {
    expect(computeFit({ outerW: 0, outerH: 0, ...DESIGN, mode: "fit" })).toEqual({ scaleX: 1, scaleY: 1 });
    expect(computeFit({ outerW: 100, outerH: 100, designW: 0, designH: 0, mode: "fit" })).toEqual({
      scaleX: 1,
      scaleY: 1,
    });
  });
});

describe("FitScreen", () => {
  it("渲染 children", () => {
    const { getByText } = render(
      <FitScreen>
        <div>大屏内容</div>
      </FitScreen>,
    );
    expect(getByText("大屏内容")).toBeTruthy();
  });

  it("外层 overflow-hidden 钳住", () => {
    const { container } = render(<FitScreen>x</FitScreen>);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.classList.contains("overflow-hidden")).toBe(true);
  });

  it("内层按设计尺寸固定 + transform 缩放", () => {
    const { container } = render(
      <FitScreen designWidth={800} designHeight={600}>
        x
      </FitScreen>,
    );
    const inner = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(inner.style.width).toBe("800px");
    expect(inner.style.height).toBe("600px");
    expect(inner.style.transform).toContain("scale(");
  });

  it("透传 className", () => {
    const { container } = render(<FitScreen className="my-screen">x</FitScreen>);
    expect((container.firstElementChild as HTMLElement).classList.contains("my-screen")).toBe(true);
  });
});
