import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, fireEvent, within } from "@testing-library/react";
import { EditableTable } from "./editable-table";
import type { EditableColumn } from "./editable-table.types";

interface Row {
  id: number;
  name: string;
  age: number;
}
const columns: EditableColumn<Row>[] = [
  { key: "name", title: "姓名", editable: true },
  { key: "age", title: "年龄", editable: true },
];
const INITIAL: Row[] = [
  { id: 1, name: "甲", age: 20 },
  { id: 2, name: "乙", age: 30 },
];

function Harness({
  initial = INITIAL,
  ...rest
}: {
  initial?: Row[];
  deletable?: boolean;
  addable?: boolean;
  newRow?: () => Row;
  validateRow?: (r: Row) => boolean;
  onChangeSpy?: (d: Row[]) => void;
}) {
  const [data, setData] = useState<Row[]>(initial);
  return (
    <EditableTable<Row>
      columns={columns}
      data={data}
      rowKey={(r) => String(r.id)}
      onChange={(d) => {
        setData(d);
        rest.onChangeSpy?.(d);
      }}
      deletable={rest.deletable}
      addable={rest.addable}
      newRow={rest.newRow}
      validateRow={rest.validateRow}
    />
  );
}

function rowEl(container: HTMLElement, text: string) {
  return Array.from(container.querySelectorAll("tbody tr")).find((tr) =>
    tr.textContent?.includes(text),
  ) as HTMLElement;
}

describe("EditableTable", () => {
  it("渲染数据 + 操作表头 + 编辑按钮", () => {
    const { getByText, getAllByText } = render(<Harness />);
    expect(getByText("甲")).toBeTruthy();
    expect(getByText("操作")).toBeTruthy();
    expect(getAllByText("编辑").length).toBe(2);
  });

  it("空数据显示暂无数据", () => {
    const { getByText } = render(<Harness initial={[]} />);
    expect(getByText("暂无数据")).toBeTruthy();
  });

  it("点编辑进入编辑态（出现输入框），其他行编辑按钮禁用", () => {
    const { container } = render(<Harness />);
    const r1 = rowEl(container, "甲");
    fireEvent.click(within(r1).getByText("编辑"));
    expect(within(r1).getByLabelText("name")).toBeTruthy();
    // 进入编辑后另一行的编辑按钮禁用
    const r2 = rowEl(container, "乙");
    expect((within(r2).getByText("编辑").closest("button") as HTMLButtonElement).disabled).toBe(true);
  });

  it("编辑后保存提交 onChange（新值显示）", () => {
    const spy = vi.fn();
    const { container, getByText } = render(<Harness onChangeSpy={spy} />);
    const r1 = rowEl(container, "甲");
    fireEvent.click(within(r1).getByText("编辑"));
    fireEvent.change(within(r1).getByLabelText("name"), { target: { value: "甲改" } });
    fireEvent.click(within(rowEl(container, "甲改") ?? r1).getByText("保存"));
    expect(spy).toHaveBeenCalled();
    expect(getByText("甲改")).toBeTruthy();
  });

  it("取消还原（不提交）", () => {
    const spy = vi.fn();
    const { container, getByText, queryByLabelText } = render(<Harness onChangeSpy={spy} />);
    const r1 = rowEl(container, "甲");
    fireEvent.click(within(r1).getByText("编辑"));
    fireEvent.change(within(r1).getByLabelText("name"), { target: { value: "废弃" } });
    fireEvent.click(within(r1).getByText("取消"));
    expect(spy).not.toHaveBeenCalled();
    expect(getByText("甲")).toBeTruthy();
    expect(queryByLabelText("name")).toBeNull();
  });

  it("删除行提交 onChange（行消失）", () => {
    const spy = vi.fn();
    const { container, queryByText } = render(<Harness deletable onChangeSpy={spy} />);
    const r1 = rowEl(container, "甲");
    fireEvent.click(within(r1).getByText("删除"));
    expect(spy).toHaveBeenCalled();
    expect(queryByText("甲")).toBeNull();
  });

  it("新增一行追加并进入编辑态", () => {
    const spy = vi.fn();
    const { getByText, container } = render(
      <Harness addable newRow={() => ({ id: 99, name: "", age: 0 })} onChangeSpy={spy} />,
    );
    fireEvent.click(getByText(/新增一行/));
    expect(spy).toHaveBeenCalled();
    // 新行进入编辑态 → 出现保存按钮
    expect(getByText("保存")).toBeTruthy();
    expect(container.querySelectorAll("tbody tr").length).toBe(3);
  });

  it("validateRow 返回 false 拦截保存", () => {
    const spy = vi.fn();
    const { container } = render(<Harness validateRow={() => false} onChangeSpy={spy} />);
    const r1 = rowEl(container, "甲");
    fireEvent.click(within(r1).getByText("编辑"));
    fireEvent.change(within(r1).getByLabelText("name"), { target: { value: "x" } });
    fireEvent.click(within(r1).getByText("保存"));
    expect(spy).not.toHaveBeenCalled();
    // 仍在编辑态
    expect(within(r1).getByLabelText("name")).toBeTruthy();
  });
});
