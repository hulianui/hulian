import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { Watermark } from "./watermark";

// jsdom 无 canvas 实现 → 桩一个最小 2D context + toDataURL，
// 让组件的绘制/平铺/防篡改逻辑可在 jsdom 跑通（像素正确性留给 Playwright）。
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 80 })),
    font: "",
    fillStyle: "",
    textAlign: "",
    textBaseline: "",
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,FAKE");
});

afterEach(() => cleanup());

const markSel = "div[style*='pointer-events']";

describe("Watermark", () => {
  it("包裹并渲染 children + 容器 relative", () => {
    const { container, getByText } = render(
      <Watermark content="机密">
        <p>正文内容</p>
      </Watermark>,
    );
    expect(getByText("正文内容")).toBeTruthy();
    expect((container.firstElementChild as HTMLElement).className).toContain("relative");
  });

  it("透传额外 props 与 className 合并", () => {
    const { container } = render(
      <Watermark content="x" className="custom" data-testid="wm" />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("custom");
    expect(el.getAttribute("data-testid")).toBe("wm");
  });

  it("生成水印层：pointer-events:none + 背景图 + z-index + opacity", async () => {
    const { container } = render(
      <Watermark content="瑚琏机密" zIndex={20} opacity={0.2}>
        <div>正文</div>
      </Watermark>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    await waitFor(() => expect(wrapper.querySelector(markSel)).toBeTruthy());
    const mark = wrapper.querySelector(markSel) as HTMLElement;
    const s = mark.getAttribute("style") || "";
    expect(s).toContain("pointer-events:none");
    expect(s).toContain("background-image:url");
    expect(s).toContain("z-index:20");
    expect(s).toContain("opacity:0.2");
    expect(s).toContain("position:absolute");
  });

  it("防篡改：删除水印层后自动还原", async () => {
    const { container } = render(<Watermark content="机密"><div>正文</div></Watermark>);
    const wrapper = container.firstElementChild as HTMLElement;
    await waitFor(() => expect(wrapper.querySelector(markSel)).toBeTruthy());
    wrapper.querySelector(markSel)!.remove();
    expect(wrapper.querySelector(markSel)).toBeNull();
    // MutationObserver 异步回调 → 等待还原
    await waitFor(() => expect(wrapper.querySelector(markSel)).toBeTruthy());
  });

  it("防篡改：水印层样式被改后自动还原（恢复 pointer-events:none）", async () => {
    const { container } = render(<Watermark content="机密"><div>正文</div></Watermark>);
    const wrapper = container.firstElementChild as HTMLElement;
    await waitFor(() => expect(wrapper.querySelector(markSel)).toBeTruthy());
    const mark = wrapper.querySelector(markSel) as HTMLElement;
    mark.setAttribute("style", "display:none");
    await waitFor(() => {
      const restored = wrapper.querySelector(markSel) as HTMLElement | null;
      expect(restored?.getAttribute("style")).toContain("pointer-events:none");
    });
  });

  it("无 content 且无 image → 不生成水印层", async () => {
    const { container } = render(<Watermark><div>正文</div></Watermark>);
    const wrapper = container.firstElementChild as HTMLElement;
    // 给 effect 一拍执行机会
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.querySelector(markSel)).toBeNull();
  });
});
