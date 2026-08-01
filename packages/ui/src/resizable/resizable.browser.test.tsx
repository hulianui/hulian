import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, cleanup, screen, waitFor } from "@testing-library/react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./resizable";

/**
 * Resizable 的拖拽路径，在 jsdom 里是**彻底的 no-op**。
 *
 * 源码 resizable.tsx:163,178：
 *
 *   const avail = panelEls.reduce((s, p) => s + p.offsetWidth, 0);   // jsdom 下恒 0
 *   const deltaPct = d.avail > 0 ? ((pos - d.startPos) / d.avail) * 100 : 0;
 *
 * `avail` 是所有面板 offsetWidth 之和，jsdom 无布局 → 恒 0 → deltaPct 恒 0 →
 * applyResize 不产生任何变化。拖多远都读回原尺寸，断言写不出来也测不出错。
 * 这就是同目录 resizable.test.tsx（144 行）里一个指针测试都没有的原因：
 * 它只覆盖了 applyResize 纯函数与键盘操作，**真实拖拽从未被验证**。
 */

afterEach(cleanup);

const GROUP_W = 600;

function renderGroup(onSizesChange?: (s: number[]) => void) {
  const utils = render(
    <div style={{ width: GROUP_W, height: 300, display: "flex" }}>
      <ResizablePanelGroup
        direction="horizontal"
        defaultSizes={[50, 50]}
        onSizesChange={onSizesChange}
        style={{ width: "100%", height: "100%" }}
      >
        <ResizablePanel min={20} max={80}>
          <div>左</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel min={20} max={80}>
          <div>右</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>,
  );
  const handle = screen.getByRole("separator");
  const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-panel]"));
  return { ...utils, handle, panels };
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
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: type === "pointerup" ? 0 : 1,
      clientX: x,
      clientY: 150,
    }),
  );
}

const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

async function actPointer(
  target: Element,
  type: "pointerdown" | "pointermove" | "pointerup",
  x: number,
) {
  await act(async () => {
    firePointer(target, type, x);
    await nextFrame();
  });
}

/** 从手柄中心水平拖 dx 像素 */
async function dragHandle(handle: Element, dx: number) {
  const r = handle.getBoundingClientRect();
  const startX = r.left + r.width / 2;
  await actPointer(handle, "pointerdown", startX);
  for (let i = 1; i <= 6; i++) {
    await actPointer(handle, "pointermove", startX + (dx * i) / 6);
  }
  await actPointer(handle, "pointerup", startX + dx);
}

describe("Resizable 拖拽分栏（真实浏览器）", () => {
  it("面板有真实宽度，avail > 0（jsdom 下这里就是 0，拖拽随即变 no-op）", () => {
    const { panels } = renderGroup();
    expect(panels.length).toBe(2);
    const avail = panels.reduce((s, p) => s + p.offsetWidth, 0);
    expect(avail).toBeGreaterThan(0);
    // 初始 50/50，两侧宽度应接近
    expect(Math.abs(panels[0].offsetWidth - panels[1].offsetWidth)).toBeLessThan(4);
  });

  it("向右拖手柄 → 左panel 变宽、右panel 变窄，且 onSizesChange 收到新比例", async () => {
    const onSizesChange = vi.fn();
    const { handle, panels } = renderGroup(onSizesChange);
    const leftBefore = panels[0].offsetWidth;

    await dragHandle(handle, 120);

    await waitFor(() => expect(panels[0].offsetWidth).toBeGreaterThan(leftBefore + 50));
    expect(panels[1].offsetWidth).toBeLessThan(leftBefore);

    expect(onSizesChange).toHaveBeenCalled();
    const last = onSizesChange.mock.calls.at(-1)![0] as number[];
    expect(last[0]).toBeGreaterThan(50);
    expect(last[0] + last[1]).toBeCloseTo(100, 5);
  });

  it("向左拖同样生效（方向对称）", async () => {
    const { handle, panels } = renderGroup();
    const leftBefore = panels[0].offsetWidth;

    await dragHandle(handle, -120);

    await waitFor(() => expect(panels[0].offsetWidth).toBeLessThan(leftBefore - 50));
  });

  it("拖过头被 min/max 约束夹住（不会把面板拖没）", async () => {
    const onSizesChange = vi.fn();
    const { handle, panels } = renderGroup(onSizesChange);

    // 远超容器宽度，试图把右侧压成 0
    await dragHandle(handle, GROUP_W * 2);

    await waitFor(() => expect(onSizesChange).toHaveBeenCalled());
    const last = onSizesChange.mock.calls.at(-1)![0] as number[];
    // 必须真的**顶到**约束边界，不能只断言「没越界」——
    // 那样 deltaPct 恒 0（jsdom 的行为）也能过，测试就白写了。
    expect(last[0]).toBeCloseTo(80, 1); // 夹在 max
    expect(last[1]).toBeCloseTo(20, 1); // 夹在 min
    // 右面板仍有可见宽度
    expect(panels[1].offsetWidth).toBeGreaterThan(0);
  });

  it("拖拽中打上 data-dragging，松手后移除", async () => {
    const { handle } = renderGroup();
    const r = handle.getBoundingClientRect();
    const startX = r.left + r.width / 2;

    await actPointer(handle, "pointerdown", startX);
    expect(handle.hasAttribute("data-dragging")).toBe(true);

    await actPointer(handle, "pointerup", startX);
    await waitFor(() => expect(handle.hasAttribute("data-dragging")).toBe(false));
  });
});
