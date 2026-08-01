import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, cleanup, screen, waitFor } from "@testing-library/react";
import { Sortable } from "./sortable";

/**
 * Sortable 的真实拖拽排序。
 *
 * 与 Kanban 同一类问题：dnd-kit 的 `closestCenter` 碰撞检测完全依赖
 * `getBoundingClientRect()`，jsdom 下所有 rect 恒为 0 —— 永远算不出 `over`，
 * onDragEnd 里 `if (!over || active.id === over.id) return` 直接短路，
 * **onChange 永远不会被调用**。
 *
 * 同目录 sortable.test.tsx 有 268 行，但只能测到 `shouldStartDragFrom` 这个
 * 纯函数守卫（还得靠手工伪造 React 合成事件对象），排序本身没被验证过。
 *
 * 另外 PointerSensor 配了 `activationConstraint: { distance: 6 }`，
 * 必须有真实坐标位移才会激活。
 */

afterEach(cleanup);

interface Row {
  id: string;
  label: string;
}

const ROWS: Row[] = [
  { id: "a", label: "第一项" },
  { id: "b", label: "第二项" },
  { id: "c", label: "第三项" },
];

function centerOf(el: Element) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function firePointer(
  target: Element | Document,
  type: "pointerdown" | "pointermove" | "pointerup",
  x: number,
  y: number,
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
  target: Element | Document,
  type: "pointerdown" | "pointermove" | "pointerup",
  x: number,
  y: number,
) {
  await act(async () => {
    firePointer(target, type, x, y);
    await nextFrame();
  });
}

async function dragRowTo(from: Element, to: Element) {
  const start = centerOf(from);
  const end = centerOf(to);
  await actPointer(from, "pointerdown", start.x, start.y);
  const STEPS = 8;
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS;
    await actPointer(document, "pointermove", start.x + (end.x - start.x) * t, start.y + (end.y - start.y) * t);
  }
  await actPointer(document, "pointerup", end.x, end.y);
}

function renderSortable(onChange: (rows: Row[]) => void, handle = false) {
  return render(
    <div style={{ width: 480 }}>
      <Sortable
        items={ROWS}
        onChange={onChange}
        handle={handle}
        renderItem={(r: Row) => (
          <div style={{ padding: 12 }}>
            {r.label}
            <button type="button">编辑</button>
          </div>
        )}
      />
    </div>,
  );
}

const rowOf = (label: string) => screen.getByText(label).closest("li")!;

describe("Sortable 拖拽排序（真实浏览器）", () => {
  it("行有真实高度（jsdom 下恒 0，closestCenter 随即失效）", () => {
    renderSortable(() => {});
    const row = rowOf("第一项");
    const rect = row.getBoundingClientRect();
    expect(rect.height).toBeGreaterThan(0);
    expect(rect.width).toBeGreaterThan(0);
  });

  it("把「第一项」拖到「第三项」位置 → onChange 收到重排后的数组", async () => {
    const onChange = vi.fn();
    renderSortable(onChange);

    await dragRowTo(rowOf("第一项"), rowOf("第三项"));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    const next = onChange.mock.calls[0][0] as Row[];
    expect(next.map((r) => r.id)).toEqual(["b", "c", "a"]);
  });

  it("相邻两项互换", async () => {
    const onChange = vi.fn();
    renderSortable(onChange);

    await dragRowTo(rowOf("第一项"), rowOf("第二项"));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    const next = onChange.mock.calls[0][0] as Row[];
    expect(next.map((r) => r.id)).toEqual(["b", "a", "c"]);
  });

  it("按在行内按钮上不发起拖拽（交互元素放行）", async () => {
    const onChange = vi.fn();
    renderSortable(onChange);

    const editBtn = screen.getAllByText("编辑")[0];
    await dragRowTo(editBtn, rowOf("第三项"));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("handle 模式：只有手柄能发起拖拽，按内容区不行", async () => {
    const onChange = vi.fn();
    renderSortable(onChange, true);

    // 内容区按下 → 不排序
    await dragRowTo(screen.getByText("第一项"), rowOf("第三项"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
