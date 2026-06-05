import { cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { VirtualList } from "./virtual-list";

// jsdom 无 ResizeObserver 且 getBoundingClientRect 恒 0 → tanstack 量不到视口、渲 0 行。
// 这版 observeElementRect 仅靠 RO 回调拿尺寸（无初始 getBoundingClientRect），故 RO 必须在 observe 时
// 立刻回调一个 360px 高的 entry；再补 getBoundingClientRect 兜底，虚拟器才能算出可见区。
class FiringResizeObserver {
  cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
  }
  observe(el: Element) {
    const box = [{ inlineSize: 300, blockSize: 360 }] as unknown as ReadonlyArray<ResizeObserverSize>;
    this.cb(
      [
        {
          target: el,
          contentRect: { width: 300, height: 360, top: 0, left: 0, right: 300, bottom: 360, x: 0, y: 0 } as DOMRectReadOnly,
          borderBoxSize: box,
          contentBoxSize: box,
          devicePixelContentBoxSize: box,
        },
      ],
      this as unknown as ResizeObserver,
    );
  }
  unobserve() {}
  disconnect() {}
}

let rectSpy: ReturnType<typeof vi.spyOn>;
beforeAll(() => {
  vi.stubGlobal("ResizeObserver", FiringResizeObserver);
  rectSpy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    width: 300,
    height: 360,
    top: 0,
    left: 0,
    right: 300,
    bottom: 360,
    x: 0,
    y: 0,
    toJSON() {},
  } as DOMRect);
});
afterAll(() => {
  rectSpy.mockRestore();
  vi.unstubAllGlobals();
});
afterEach(cleanup);

const rows = Array.from({ length: 1000 }, (_, i) => ({ id: i }));

describe("VirtualList", () => {
  it("仅渲染视口内行：首行在、远端行不在", () => {
    const { queryByText } = render(
      <VirtualList
        items={rows}
        itemHeight={40}
        height={360}
        renderItem={(r) => <div>行 {r.id}</div>}
      />,
    );
    expect(queryByText("行 0")).not.toBeNull();
    expect(queryByText("行 999")).toBeNull(); // 被虚拟化裁掉
  });

  it("总高占位为 count × itemHeight", () => {
    const { container } = render(
      <VirtualList items={rows} itemHeight={40} height={360} renderItem={(r) => <div>行 {r.id}</div>} />,
    );
    const spacer = container.querySelector('[style*="position: relative"]') as HTMLElement;
    expect(spacer.style.height).toBe("40000px"); // 1000 * 40
  });

  it("末行可见时触发 onReachEnd", () => {
    const onReachEnd = vi.fn();
    render(
      <VirtualList
        items={[{ id: 0 }, { id: 1 }, { id: 2 }]}
        itemHeight={40}
        height={360}
        onReachEnd={onReachEnd}
        renderItem={(r) => <div>行 {r.id}</div>}
      />,
    );
    expect(onReachEnd).toHaveBeenCalled();
  });
});
