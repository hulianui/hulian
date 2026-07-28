import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

// 回归护栏：不开 rowDraggable 的消费方，**一个 dnd-kit 的 hook 都不该被执行**。
// 起因是 useSensors 曾写在 Table 顶层（hook 不可条件调用），于是任何用了 Table 的下游都被迫
// 拉起整条 dnd-kit 运行时。下游 vitest 里 @dnd-kit 没有 exports 字段、只有 legacy main/module，
// 解析出第二份 React 后整页崩，而栈顶落在 dnd-kit 内部、几乎无法归因到「表格没开拖拽」。
// 这里对 useSensors / useSortable 装监听，直接盯住「有没有被调用」这件事本身。
const useSensorsSpy = vi.fn();
const useSortableSpy = vi.fn();

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>();
  return {
    ...actual,
    useSensors: (...args: Parameters<typeof actual.useSensors>) => {
      useSensorsSpy();
      return actual.useSensors(...args);
    },
  };
});

vi.mock("@dnd-kit/sortable", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/sortable")>();
  return {
    ...actual,
    useSortable: (...args: Parameters<typeof actual.useSortable>) => {
      useSortableSpy();
      return actual.useSortable(...args);
    },
  };
});

const { Table } = await import("./table");
type ColumnDef = import("./table.types").ColumnDef<Row, unknown>;

interface Row {
  name: string;
}
const data: Row[] = [{ name: "Alice" }, { name: "Bob" }];
const columns: ColumnDef[] = [{ accessorKey: "name", header: "姓名" }];

describe("Table 与 dnd-kit 的隔离", () => {
  beforeEach(() => {
    useSensorsSpy.mockClear();
    useSortableSpy.mockClear();
  });

  it("不开 rowDraggable：useSensors / useSortable 一次都不调用", () => {
    render(<Table columns={columns} data={data} />);
    expect(useSensorsSpy).not.toHaveBeenCalled();
    expect(useSortableSpy).not.toHaveBeenCalled();
  });

  it("不开 rowDraggable：不产出 DndContext 的 a11y live region", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    expect(container.parentElement?.querySelector("[role='status']")).toBeNull();
  });

  it("开了 rowDraggable：两个 hook 都跑起来（sensors 一次，每行一次 sortable）", () => {
    render(<Table columns={columns} data={data} rowDraggable onRowDragEnd={() => {}} />);
    expect(useSensorsSpy).toHaveBeenCalled();
    expect(useSortableSpy).toHaveBeenCalled();
  });
});
