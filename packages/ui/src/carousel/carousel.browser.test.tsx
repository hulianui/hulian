import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@vitest/browser/context";
import { Carousel } from "./carousel";

/**
 * Carousel 的拖拽与滚动几何，只能在真实浏览器里验。
 *
 * 同目录的 carousel.test.tsx（jsdom）开头就写着：
 *
 *   Element.prototype.scrollTo = vi.fn()          // jsdom 未实现，调用即抛 → 桩成 noop
 *   Element.prototype.setPointerCapture = vi.fn() // jsdom 无指针捕获
 *
 * 也就是说这个组件的**核心行为全被桩掉了**：拖拽逻辑是
 * `track.scrollLeft = startLeft - (clientX - startX)`，而 jsdom 没有布局、
 * 没有溢出，scrollLeft 恒为 0 —— 拖动多远都读回 0，断言写不出来也测不出错。
 * 圆点跳转走 scrollTo，在 jsdom 里则是个空函数。
 *
 * 这里补的就是那两块：真实的滚动几何 + 真实的指针捕获。
 */

afterEach(cleanup);

const SLIDES = 3;
const VIEWPORT = 600;

function renderCarousel() {
  const utils = render(
    <div style={{ width: VIEWPORT }}>
      <Carousel aria-label="测试轮播">
        {Array.from({ length: SLIDES }, (_, i) => (
          <div key={i} style={{ height: 200 }}>
            幻灯片 {i + 1}
          </div>
        ))}
      </Carousel>
    </div>,
  );
  // 轨道是幻灯片的直接父节点（组件内部 ref，没有对外的 test id）
  const track = screen.getByRole("group", { name: `第 1 / ${SLIDES} 张` }).parentElement!;
  return { ...utils, track };
}

function firePointer(
  target: Element,
  type: "pointerdown" | "pointermove" | "pointerup",
  x: number,
) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: 1,
      // 组件对 touch 直接 return（交给原生 snap），必须走 mouse 路径
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: type === "pointerup" ? 0 : 1,
      clientX: x,
      clientY: 100,
    }),
  );
}

const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

describe("Carousel 滚动几何与拖拽（真实浏览器）", () => {
  it("轨道真的溢出：scrollWidth ≈ 视口 × 幻灯片数（jsdom 下两者都是 0）", () => {
    const { track } = renderCarousel();
    expect(track.clientWidth).toBeGreaterThan(0);
    expect(track.scrollWidth).toBeGreaterThan(track.clientWidth);
    // 每张 basis-full，总宽约等于 n 倍视口
    expect(track.scrollWidth).toBeCloseTo(track.clientWidth * SLIDES, -1);
  });

  it("拖拽真的改变 scrollLeft，且方向正确（左拖 → 前进）", async () => {
    const { track } = renderCarousel();
    expect(track.scrollLeft).toBe(0);

    firePointer(track, "pointerdown", 500);
    await nextFrame();
    // 向左拖 200px → scrollLeft 应增加约 200
    firePointer(track, "pointermove", 300);
    await nextFrame();

    expect(track.scrollLeft).toBeGreaterThan(0);
    expect(track.scrollLeft).toBeCloseTo(200, -1);

    firePointer(track, "pointerup", 300);
    await nextFrame();
  });

  it("按下时进入拖拽态（关 snap），松手复原", async () => {
    const { track } = renderCarousel();
    expect(track.className).toContain("snap-x");

    firePointer(track, "pointerdown", 400);
    await nextFrame();
    // dragging=true → snap-none + cursor-grabbing
    expect(track.className).toContain("snap-none");
    expect(track.className).not.toContain("snap-x");

    firePointer(track, "pointerup", 400);
    await nextFrame();
    await waitFor(() => expect(track.className).toContain("snap-x"));
  });

  // 边界说明：**指针捕获无法用合成事件验证**。
  // `setPointerCapture(id)` 要求 id 对应一个真实的活跃指针，而 dispatchEvent 造出来的
  // PointerEvent 只是个数据对象，浏览器不认它的 pointerId —— 于是 hasPointerCapture()
  // 恒为 false，断言它只会得到一条假失败。要走真实指针必须用输入设备级的 API：
  it("真实输入设备拖拽（userEvent → playwright 真实鼠标）也能滚动轨道", async () => {
    const { track } = renderCarousel();
    const first = screen.getByRole("group", { name: `第 1 / ${SLIDES} 张` });
    const second = screen.getByRole("group", { name: `第 2 / ${SLIDES} 张` });

    // 把第二张往第一张的位置拖 = 向左拖 → 前进
    await userEvent.dragAndDrop(second, first);

    await waitFor(() => expect(track.scrollLeft).toBeGreaterThan(0), { timeout: 2000 });
  });

  it("点圆点跳转：scrollLeft 落到对应幻灯片（jsdom 下 scrollTo 是空函数）", async () => {
    const { track } = renderCarousel();
    const dots = screen.getAllByRole("button", { name: /转到第/ });
    expect(dots.length).toBe(SLIDES);

    dots[2].click();

    await waitFor(
      () => expect(track.scrollLeft).toBeCloseTo(track.clientWidth * 2, -1),
      { timeout: 2000 },
    );
  });
});
