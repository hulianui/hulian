import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Kanban, resolveKanbanMove, isInteractiveDragTarget } from "./kanban";
import type { KanbanColumn } from "./kanban.types";

afterEach(cleanup);

interface Task {
  id: string;
  title: string;
  status: string;
}
const columns: KanbanColumn[] = [
  { id: "todo", title: "待办" },
  { id: "doing", title: "进行中" },
  { id: "done", title: "已完成" },
];
const tasks: Task[] = [
  { id: "t1", title: "甲", status: "todo" },
  { id: "t2", title: "乙", status: "todo" },
  { id: "t3", title: "丙", status: "doing" },
  // done 列故意留空，验证空列渲染
];

const baseProps = {
  columns,
  items: tasks,
  getId: (t: Task) => t.id,
  getColumnId: (t: Task) => t.status,
  onMove: () => {},
  renderItem: (t: Task) => <span>{t.title}</span>,
};

describe("Kanban 渲染", () => {
  it("按 getColumnId 把卡片分桶到对应列", () => {
    const { container } = render(<Kanban {...baseProps} />);
    const cols = container.querySelectorAll("section");
    expect(cols.length).toBe(3);
    const todoCards = cols[0].querySelectorAll("[role='button'], li");
    // todo 列含「甲」「乙」
    expect(cols[0].textContent).toContain("甲");
    expect(cols[0].textContent).toContain("乙");
    // doing 列含「丙」，不含「甲」
    expect(cols[1].textContent).toContain("丙");
    expect(cols[1].textContent).not.toContain("甲");
    expect(todoCards.length).toBeGreaterThanOrEqual(2);
  });

  it("空列渲染占位区（done 列无卡片）", () => {
    const { container } = render(<Kanban {...baseProps} />);
    const done = container.querySelectorAll("section")[2];
    expect(done.textContent).toContain("拖拽卡片到此");
  });

  it("renderColumnHeader 拿到该列卡片做统计", () => {
    const { container } = render(
      <Kanban {...baseProps} renderColumnHeader={(c, its) => <div>{`${c.title}-${its.length}`}</div>} />,
    );
    const cols = container.querySelectorAll("section");
    expect(cols[0].textContent).toContain("待办-2");
    expect(cols[1].textContent).toContain("进行中-1");
    expect(cols[2].textContent).toContain("已完成-0");
  });

  it("挂载时不触发 onMove", () => {
    const onMove = vi.fn();
    render(<Kanban {...baseProps} onMove={onMove} />);
    expect(onMove).not.toHaveBeenCalled();
  });
});

describe("resolveKanbanMove", () => {
  const getId = (t: Task) => t.id;
  const getColumnId = (t: Task) => t.status;

  it("拖到另一列的卡片之前：toColumn 切换，toIndex 为该卡在目标列(剔除自身)的下标", () => {
    // 把 t1(todo) 拖到 t3(doing) 之前
    const e = resolveKanbanMove("t1", "t3", columns, tasks, getId, getColumnId);
    expect(e).toEqual({ id: "t1", fromColumn: "todo", toColumn: "doing", toIndex: 0 });
  });

  it("拖到空列（over 是列容器 id）：追加到列尾", () => {
    const e = resolveKanbanMove("t1", "kbcol:done", columns, tasks, getId, getColumnId);
    expect(e).toEqual({ id: "t1", fromColumn: "todo", toColumn: "done", toIndex: 0 });
  });

  it("列内重排：拖到同列另一卡之前", () => {
    // t2(todo) 拖到 t1(todo) 之前 → 目标列剔除 t2 后为 [t1]，t1 下标 0
    const e = resolveKanbanMove("t2", "t1", columns, tasks, getId, getColumnId);
    expect(e).toEqual({ id: "t2", fromColumn: "todo", toColumn: "todo", toIndex: 0 });
  });

  it("拖回自身 / over 为空 → 返回 null（不触发移动）", () => {
    expect(resolveKanbanMove("t1", "t1", columns, tasks, getId, getColumnId)).toBeNull();
    expect(resolveKanbanMove("t1", null, columns, tasks, getId, getColumnId)).toBeNull();
  });

  it("未知目标列 → null", () => {
    expect(resolveKanbanMove("t1", "kbcol:ghost", columns, tasks, getId, getColumnId)).toBeNull();
  });
});

describe("isInteractiveDragTarget（卡片内交互元素放行拖拽）", () => {
  it("链接/按钮/表单控件 → true（不发起拖拽，让 click/输入工作）", () => {
    for (const tag of ["a", "button", "input", "textarea", "select", "label"]) {
      const el = document.createElement(tag);
      expect(isInteractiveDragTarget(el)).toBe(true);
    }
  });

  it("交互元素的内层子节点也算（closest 命中祖先）", () => {
    const link = document.createElement("a");
    const span = document.createElement("span");
    link.appendChild(span);
    expect(isInteractiveDragTarget(span)).toBe(true);
  });

  it("data-no-drag 逃生舱 → true", () => {
    const el = document.createElement("div");
    el.setAttribute("data-no-drag", "");
    expect(isInteractiveDragTarget(el)).toBe(true);
  });

  it("普通卡片内容（div/span）→ false（整卡可拖）", () => {
    expect(isInteractiveDragTarget(document.createElement("div"))).toBe(false);
    expect(isInteractiveDragTarget(null)).toBe(false);
  });

  // 上面几条都拿孤立 createElement 测，测不到真实渲染出来的卡片长什么样 —— 而问题恰恰出在那里：
  // dnd-kit 给可拖卡片挂了 role="button"，它本身就在交互元素选择器里。不传边界时守卫会命中
  // 卡片自己，于是**每张卡都拖不动**（症状是整个看板失灵，容易误判成 dnd-kit 坏了）。
  it("真实渲染的卡片：按在普通内容上仍可拖（边界不含卡片自身）", () => {
    const columns = [{ id: "todo", title: "待办" }];
    const items = [{ id: "1", col: "todo", text: "卡片甲" }];
    const { container, getByText } = render(
      <Kanban
        columns={columns}
        items={items}
        getId={(i) => i.id}
        getColumnId={(i) => i.col}
        onMove={() => {}}
        renderItem={(i) => <span>{i.text}</span>}
      />,
    );
    const card = container.querySelector("li[role='button']")!;
    expect(card).toBeTruthy(); // 前提成立：dnd-kit 确实挂了 role="button"
    // 传边界 → 卡片自身不参与判定 → 可拖
    expect(isInteractiveDragTarget(getByText("卡片甲"), card)).toBe(false);
  });

  it("真实渲染的卡片：按在行内按钮上不发起拖拽", () => {
    const columns = [{ id: "todo", title: "待办" }];
    const items = [{ id: "1", col: "todo", text: "卡片甲" }];
    const { container, getByText } = render(
      <Kanban
        columns={columns}
        items={items}
        getId={(i) => i.id}
        getColumnId={(i) => i.col}
        onMove={() => {}}
        renderItem={(i) => (
          <span>
            {i.text}
            <button type="button">归档</button>
          </span>
        )}
      />,
    );
    const card = container.querySelector("li[role='button']")!;
    expect(isInteractiveDragTarget(getByText("归档"), card)).toBe(true);
  });
});
