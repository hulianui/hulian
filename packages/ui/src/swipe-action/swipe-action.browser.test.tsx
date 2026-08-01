import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, cleanup, screen, waitFor } from "@testing-library/react";
import { SwipeAction } from "./swipe-action";

/**
 * SwipeAction 的跟手与吸附，取决于动作面板的**真实宽度**。
 *
 * 源码 swipe-action.tsx:31-34,67,77-78：
 *
 *   const widths = () => ({ left: leftRef.current?.offsetWidth ?? 0, right: ... });
 *   setOffset(Math.max(-rw, Math.min(lw, start.current.offset + dx)));   // rw/lw 为 0 → 恒 0
 *   if (offset < 0 && rw > 0 && -offset > rw * threshold) next = -rw;    // rw > 0 不成立 → 永不吸附
 *
 * jsdom 下 offsetWidth 恒 0，于是**拖不动、也永远不吸附**。同目录的 jsdom 测试因此
 * 不得不 `vi.spyOn(HTMLElement.prototype, "offsetWidth").mockReturnValue(80)` —— 那是
 * 全局 mock，连内容层自己也变成 80，测的是「假设面板宽 80 时的算术」，而不是
 * 「真实布局下能不能滑开」。这里用真实渲染宽度重测。
 */

afterEach(cleanup);

/** 内容层是带 transform 的那个 div（动作面板是 absolute） */
const contentEl = () => document.querySelector('[style*="translateX"]') as HTMLElement;

/** 从 style.transform 里取出当前偏移像素 */
function offsetOf(el: HTMLElement): number {
  const m = /translateX\((-?[\d.]+)px\)/.exec(el.style.transform);
  return m ? Number(m[1]) : NaN;
}

function firePointer(
  target: Element,
  type: "pointerdown" | "pointermove" | "pointerup",
  x: number,
  y = 30,
) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: type === "pointerup" ? 0 : 1,
      clientX: x,
      clientY: y,
    }),
  );
}

const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

async function actPointer(
  target: Element,
  type: "pointerdown" | "pointermove" | "pointerup",
  x: number,
  y = 30,
) {
  await act(async () => {
    firePointer(target, type, x, y);
    await nextFrame();
  });
}

/** 从 (x0,y0) 拖到 (x0+dx, y0+dy)，分步走，最后松手 */
async function swipe(el: Element, dx: number, dy = 0) {
  const x0 = 200;
  const y0 = 30;
  await actPointer(el, "pointerdown", x0, y0);
  for (let i = 1; i <= 6; i++) {
    await actPointer(el, "pointermove", x0 + (dx * i) / 6, y0 + (dy * i) / 6);
  }
  await actPointer(el, "pointerup", x0 + dx, y0 + dy);
}

function renderSwipe(onOpenChange?: (s: "left" | "right" | null) => void) {
  const utils = render(
    <div style={{ width: 400 }}>
      <SwipeAction
        right={[{ key: "r", label: "删除", tone: "danger" }]}
        onOpenChange={onOpenChange}
      >
        <div style={{ padding: 16 }}>会话内容</div>
      </SwipeAction>
    </div>,
  );
  const panel = screen.getByText("删除").parentElement as HTMLElement;
  return { ...utils, panel, content: contentEl() };
}

describe("SwipeAction 跟手与吸附（真实浏览器）", () => {
  it("动作面板有真实宽度（jsdom 下是 0，得靠全局 mock 才能跑）", () => {
    const { panel } = renderSwipe();
    expect(panel.offsetWidth).toBeGreaterThan(0);
  });

  it("向左拖过阈值 → 松手吸附到面板真实宽度", async () => {
    const onOpenChange = vi.fn();
    const { panel, content } = renderSwipe(onOpenChange);
    const rw = panel.offsetWidth;
    expect(offsetOf(content)).toBe(0);

    // 拖满面板宽度（远超 threshold 0.5）
    await swipe(content, -rw - 20);

    await waitFor(() => expect(offsetOf(contentEl())).toBeCloseTo(-rw, 0));
    expect(onOpenChange).toHaveBeenLastCalledWith("right");
  });

  it("拖不过阈值 → 回弹归零", async () => {
    const onOpenChange = vi.fn();
    const { panel, content } = renderSwipe(onOpenChange);
    const rw = panel.offsetWidth;

    // 只拖面板宽度的三成（< threshold 0.5），但要大于主轴判定的 6px
    await swipe(content, -Math.max(8, Math.round(rw * 0.3)));

    await waitFor(() => expect(offsetOf(contentEl())).toBe(0));
    expect(onOpenChange).toHaveBeenLastCalledWith(null);
  });

  it("跟手过程中偏移随指针实时变化（不是只在松手时跳变）", async () => {
    const { panel, content } = renderSwipe();
    const rw = panel.offsetWidth;

    await actPointer(content, "pointerdown", 200, 30);
    await actPointer(content, "pointermove", 200 - Math.round(rw * 0.4), 30);

    const mid = offsetOf(contentEl());
    expect(mid).toBeLessThan(0);
    expect(mid).toBeGreaterThan(-rw - 1); // 被 clamp 在面板宽度内

    await actPointer(content, "pointerup", 200 - Math.round(rw * 0.4), 30);
  });

  it("纵向手势不接管（保持关闭，放行原生滚动）", async () => {
    const { content } = renderSwipe();
    // 纵向位移远大于横向 → decided=false
    await swipe(content, -10, 80);
    expect(offsetOf(contentEl())).toBe(0);
  });
});
