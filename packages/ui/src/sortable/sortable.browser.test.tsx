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

/**
 * 起一次拖拽但**不松手**，停在中途 —— 光标与拖拽态样式只在这一段里存在。
 * 返回 finish() 收尾，避免测试之间留下按住的指针和被改过的 body 光标。
 */
async function startDrag(from: Element, to: Element) {
  const start = centerOf(from);
  const end = centerOf(to);
  await actPointer(from, "pointerdown", start.x, start.y);
  const STEPS = 4;
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS;
    await actPointer(
      document,
      "pointermove",
      start.x + (end.x - start.x) * t,
      start.y + (end.y - start.y) * t,
    );
  }
  return async () => {
    await actPointer(document, "pointerup", end.x, end.y);
  };
}

const cursorOf = (el: Element) => getComputedStyle(el).cursor;

describe("Sortable 拖拽中的光标（真实浏览器）", () => {
  /**
   * 回归：原实现把抓握态写成 `active:cursor-grabbing`，即「光标取决于指针**此刻压着谁**」。
   * 拖拽期间指针底下的元素每帧都在换（被拖项的 transform 落后一帧、行间空隙归 ul、
   * 让位动画中的其他行、消费方行内的 input(cursor:text)/button），`:active` 随之通断，
   * 浏览器每个输入事件重算一次光标 —— 表现就是抓手图标持续闪烁。
   * 所以断言的不是「某个元素是 grabbing」，而是「指针可能压到的每一处都是同一个 grabbing」。
   */
  it("拖拽期间：被拖行 / 其他行 / 行间空隙 / 行内按钮 的光标全都是 grabbing", async () => {
    renderSortable(() => {});
    const dragged = rowOf("第一项");
    const other = rowOf("第三项");
    const list = dragged.parentElement!;
    const innerButton = screen.getAllByText("编辑")[0]!;

    const finish = await startDrag(dragged, other);
    try {
      expect(cursorOf(dragged)).toBe("grabbing");
      expect(cursorOf(other)).toBe("grabbing");
      expect(cursorOf(list)).toBe("grabbing");
      expect(cursorOf(innerButton)).toBe("grabbing");
    } finally {
      await finish();
    }
  });

  it("拖拽期间 body 也钉成 grabbing（指针会被拖到列表外），松手后还原", async () => {
    renderSortable(() => {});
    const before = document.body.style.cursor;

    const finish = await startDrag(rowOf("第一项"), rowOf("第三项"));
    try {
      expect(document.body.style.cursor).toBe("grabbing");
    } finally {
      await finish();
    }
    expect(document.body.style.cursor).toBe(before);
  });

  it("静止态回到 grab（不能把 grabbing 焊死）", async () => {
    renderSortable(() => {});
    const row = rowOf("第一项");
    expect(cursorOf(row)).toBe("grab");

    const finish = await startDrag(row, rowOf("第三项"));
    await finish();

    expect(cursorOf(rowOf("第一项"))).toBe("grab");
    expect(cursorOf(rowOf("第一项").parentElement!)).not.toBe("grabbing");
  });
});

describe("Sortable 拖拽中的语义色（真实浏览器）", () => {
  it("被拖那一行吃 primary 语义色，其余行保持中性面", async () => {
    renderSortable(() => {});
    const dragged = rowOf("第一项");
    const other = rowOf("第三项");
    const idleBorder = getComputedStyle(other).borderTopColor;

    const finish = await startDrag(dragged, other);
    try {
      const activeBorder = getComputedStyle(dragged).borderTopColor;
      expect(activeBorder).not.toBe(idleBorder);
      // 就是 --color-primary 本尊，不是随手挑的另一个灰
      const primary = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-primary")
        .trim();
      const probe = document.createElement("span");
      probe.style.color = primary;
      document.body.appendChild(probe);
      const primaryComputed = getComputedStyle(probe).color;
      probe.remove();
      expect(activeBorder).toBe(primaryComputed);
      // 没被拖的行不许跟着变色
      expect(getComputedStyle(other).borderTopColor).toBe(idleBorder);
    } finally {
      await finish();
    }
  });

  it("松手后语义色收回", async () => {
    renderSortable(() => {});
    const idleBorder = getComputedStyle(rowOf("第三项")).borderTopColor;

    const finish = await startDrag(rowOf("第一项"), rowOf("第三项"));
    await finish();

    for (const label of ["第一项", "第二项", "第三项"]) {
      expect(getComputedStyle(rowOf(label)).borderTopColor).toBe(idleBorder);
    }
  });
});
