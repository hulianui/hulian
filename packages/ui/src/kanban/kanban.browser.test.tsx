import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { Kanban } from "./kanban";
import type { KanbanColumn } from "./kanban.types";

/**
 * 真实浏览器里的整卡拖拽。
 *
 * 为什么这条测试不能待在 jsdom：
 * 1. dnd-kit 的 `closestCorners` 碰撞检测完全依赖 `getBoundingClientRect()`，
 *    jsdom 里所有元素 rect 恒为 0 —— 永远算不出落点，onMove 永远不会带正确的目标列。
 * 2. PointerSensor 配了 `activationConstraint: { distance: 6 }`，要真实坐标位移才激活；
 *    jsdom 的 PointerEvent 是 setup 里用 MouseEvent 打的桩。
 * 3. 拖拽过程调用 `setPointerCapture`，jsdom 里那是个 no-op 桩。
 *
 * 历史教训：整卡拖拽曾经**完全失效**（守卫函数未传边界，`closest` 命中了 dnd-kit 自己挂在卡片上的
 * `role="button"`，于是每张卡都拖不动），而当时 388 个 jsdom 测试全绿 —— 因为它们只拿孤立
 * `createElement` 测纯函数，测不到"真的拖得动吗"。这条测试就是补那个洞。
 */

afterEach(cleanup);

interface Task {
  id: string;
  title: string;
  status: string;
}

const columns: KanbanColumn[] = [
  { id: "todo", title: "待办" },
  { id: "doing", title: "进行中" },
];

const tasks: Task[] = [
  { id: "t1", title: "甲", status: "todo" },
  { id: "t2", title: "乙", status: "todo" },
  { id: "t3", title: "丙", status: "doing" },
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
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

/** 按住 from 元素，分步移动到 to 元素中心后松手。分步是必须的：单跳一步会被 dnd-kit 当成瞬移。 */
async function dragCardTo(from: Element, to: Element) {
  const start = centerOf(from);
  const end = centerOf(to);

  firePointer(from, "pointerdown", start.x, start.y);
  await nextFrame();

  const STEPS = 8;
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS;
    firePointer(document, "pointermove", start.x + (end.x - start.x) * t, start.y + (end.y - start.y) * t);
    await nextFrame();
  }

  firePointer(document, "pointerup", end.x, end.y);
  await nextFrame();
}

function renderBoard(onMove: (e: unknown) => void) {
  return render(
    <div style={{ width: 900, height: 600, display: "flex" }}>
      <Kanban
        columns={columns}
        items={tasks}
        getId={(t: Task) => t.id}
        getColumnId={(t: Task) => t.status}
        onMove={onMove}
        renderItem={(t: Task) => <span>{t.title}</span>}
      />
    </div>,
  );
}

describe("Kanban 整卡拖拽（真实浏览器）", () => {
  it("卡片有真实布局尺寸（jsdom 里这一步就是 0，后续全部失真）", () => {
    const { container } = renderBoard(() => {});
    const card = container.querySelector("li[role='button']")!;
    const rect = card.getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  });

  it("把「甲」从 todo 拖到 doing 列的「丙」上 → onMove 收到跨列移动", async () => {
    const onMove = vi.fn();
    const { container, getByText } = renderBoard(onMove);

    const cardA = getByText("甲").closest("li")!;
    const cardC = getByText("丙").closest("li")!;
    expect(cardA).toBeTruthy();
    expect(cardC).toBeTruthy();

    await dragCardTo(cardA, cardC);

    await waitFor(() => expect(onMove).toHaveBeenCalledTimes(1));
    expect(onMove.mock.calls[0][0]).toMatchObject({
      id: "t1",
      fromColumn: "todo",
      toColumn: "doing",
    });

    // 顺带确认前提没变：dnd-kit 确实给可拖卡片挂了 role="button"
    expect(container.querySelector("li[role='button']")).toBeTruthy();
  });

  it("按在卡内按钮上不发起拖拽（onMove 不触发，click 正常）", async () => {
    const onMove = vi.fn();
    const onArchive = vi.fn();
    const { getByText } = render(
      <div style={{ width: 900, height: 600, display: "flex" }}>
        <Kanban
          columns={columns}
          items={tasks}
          getId={(t: Task) => t.id}
          getColumnId={(t: Task) => t.status}
          onMove={onMove}
          renderItem={(t: Task) => (
            <span>
              {t.title}
              {t.id === "t1" ? (
                <button type="button" onClick={onArchive}>
                  归档
                </button>
              ) : null}
            </span>
          )}
        />
      </div>,
    );

    const archiveBtn = getByText("归档");
    const cardC = getByText("丙").closest("li")!;

    await dragCardTo(archiveBtn, cardC);

    expect(onMove).not.toHaveBeenCalled();
  });
});
