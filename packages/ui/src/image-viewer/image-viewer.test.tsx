import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { StrictMode } from "react";
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

// ===== 滚轮缩放（#223）=====
//
// 两条独立缺陷：
// 1) 位移算两次 —— 旧实现在 setScale 的 updater 里嵌套 setOffset，而 setOffset 依赖前值。
//    StrictMode 的 dev 检查靠双调用 updater 发现非纯性，于是位移在第一遍的结果上再乘一次
//    ratio（复利），滚几格图就飞出视口。**所以这一组必须在 StrictMode 下跑**，否则测不出来。
// 2) wheel 只挂舞台 —— 顶部条与缩略图条在舞台之外，触控板捏合漏给浏览器缩放整个宿主页面。
describe("ImageViewer 滚轮缩放（#223）", () => {
  const STAGE_RECT = { left: 0, top: 60, width: 1000, height: 700 };

  /** 在 StrictMode 下打开 viewer，并把舞台的 rect 固定成已知值（jsdom 默认全 0）。 */
  function open(count = 2) {
    render(
      <StrictMode>
        <ImageViewer
          open
          images={images.slice(0, count)}
          index={0}
          onOpenChange={vi.fn()}
          onIndexChange={vi.fn()}
        />
      </StrictMode>,
    );
    const img = stageImg()!;
    const stage = img.parentElement as HTMLElement;
    vi.spyOn(stage, "getBoundingClientRect").mockReturnValue({
      ...STAGE_RECT,
      right: STAGE_RECT.left + STAGE_RECT.width,
      bottom: STAGE_RECT.top + STAGE_RECT.height,
      x: STAGE_RECT.left,
      y: STAGE_RECT.top,
      toJSON: () => ({}),
    } as DOMRect);
    return { img, stage, panel: document.querySelector<HTMLElement>('[role="dialog"]')! };
  }

  /**
   * 派发一个真实 WheelEvent 并读回 defaultPrevented。
   * 不用 fireEvent.wheel：那走 React 合成事件，而本组件的监听是原生 addEventListener
   * （要 passive:false 才能 preventDefault）。手工 dispatch 要自己包 act 才能等到重渲染。
   */
  function wheel(target: EventTarget, init: WheelEventInit) {
    const ev = new WheelEvent("wheel", { bubbles: true, cancelable: true, ...init });
    act(() => {
      target.dispatchEvent(ev);
    });
    return ev;
  }

  it("以光标为锚点缩放一格，位移正好是公式值（不被 StrictMode 双调用算成复利）", () => {
    const { img, stage } = open();
    const cx = STAGE_RECT.left + STAGE_RECT.width / 2;
    const cy = STAGE_RECT.top + STAGE_RECT.height / 2;
    // 光标偏离舞台中心 (100, 50)，放大一格 ratio = 1.4
    wheel(stage, { deltaY: -100, clientX: cx + 100, clientY: cy + 50 });
    // px - px*ratio = 100 - 140 = -40；py 同理 = -20。
    // 旧实现在这里给出 -96 / -47.5（把 updater 跑了两遍）。
    expect(img.style.transform).toBe("translate(-40px, -20px) scale(1.4)");
  });

  it("连滚两格仍与逐格公式一致（复利这条 bug 在第二格上放得最大）", () => {
    const { img, stage } = open();
    const cx = STAGE_RECT.left + STAGE_RECT.width / 2;
    const cy = STAGE_RECT.top + STAGE_RECT.height / 2;
    wheel(stage, { deltaY: -100, clientX: cx + 100, clientY: cy + 50 });
    wheel(stage, { deltaY: -100, clientX: cx + 100, clientY: cy + 50 });
    // 第二格：x = 100 - (100 - (-40)) * 1.4 = -96，scale = 1.4 * 1.4（浮点，不写字面量）
    const [x, y, s] = img.style.transform.match(/-?\d+(\.\d+)?/g)!.map(Number);
    expect(x).toBeCloseTo(-96, 5);
    expect(y).toBeCloseTo(-48, 5);
    expect(s).toBeCloseTo(1.4 * 1.4, 5);
  });

  it("缩回 1x 时平移一并归零（不会停在偏移位上）", () => {
    const { img, stage } = open();
    const cx = STAGE_RECT.left + STAGE_RECT.width / 2;
    wheel(stage, { deltaY: -100, clientX: cx + 100, clientY: STAGE_RECT.top + 10 });
    wheel(stage, { deltaY: 100, clientX: cx + 100, clientY: STAGE_RECT.top + 10 });
    expect(img.style.transform).toBe("translate(0px, 0px) scale(1)");
  });

  // 顶部条在舞台之外：旧实现只在舞台上挂 wheel，捏合（ctrlKey+wheel）漏给浏览器 = 缩放宿主页面。
  it("顶部条上的滚轮与捏合都被吃掉（否则触控板捏合会缩放整个宿主页面）", () => {
    const { panel } = open();
    const topBar = panel.firstElementChild!;
    expect(wheel(topBar, { deltaY: -100, clientX: 60, clientY: 30 }).defaultPrevented).toBe(true);
    expect(
      wheel(topBar, { deltaY: -100, clientX: 60, clientY: 30, ctrlKey: true }).defaultPrevented,
    ).toBe(true);
  });

  it("舞台外滚轮以舞台中心为锚点（不拿舞台外的点当不动点把图甩飞）", () => {
    const { img, panel } = open();
    const topBar = panel.firstElementChild!;
    wheel(topBar, { deltaY: -100, clientX: 60, clientY: 30 });
    expect(img.style.transform).toBe("translate(0px, 0px) scale(1.4)");
  });

  // 缩略图条自己是 overflow-x-auto：整层 preventDefault 会把它的横向滚动一起吃掉。
  it("缩略图条：普通滚轮放行（留给它横向滚），捏合仍然吃掉", () => {
    const { panel } = open();
    const strip = panel.querySelector<HTMLElement>(".overflow-x-auto")!;
    expect(wheel(strip, { deltaY: -100, clientX: 60, clientY: 780 }).defaultPrevented).toBe(false);
    expect(
      wheel(strip, { deltaY: -100, clientX: 60, clientY: 780, ctrlKey: true }).defaultPrevented,
    ).toBe(true);
  });
});
