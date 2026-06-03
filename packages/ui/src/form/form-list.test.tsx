import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { FormList } from "./form-list";

afterEach(cleanup);

// 受控宿主：把 FormList 接到一份本地 state 上
function ControlledHost({ onChange }: { onChange?: (v: string[]) => void }) {
  const [rows, setRows] = useState<string[]>(["A", "B"]);
  return (
    <FormList<string>
      value={rows}
      onChange={(next) => {
        setRows(next);
        onChange?.(next);
      }}
    >
      {(fields, ops, value) => (
        <div>
          {fields.map((f) => (
            <div key={f.key} data-testid="row">
              <span>{value[f.name]}</span>
              <button type="button" onClick={() => ops.remove(f.name)}>
                删 {f.name}
              </button>
            </div>
          ))}
          <button type="button" onClick={() => ops.add("NEW")}>
            增行
          </button>
          <button type="button" onClick={() => ops.move(0, 1)}>
            移
          </button>
        </div>
      )}
    </FormList>
  );
}

describe("FormList 动态数组字段", () => {
  it("渲染初始行，fields.name 为索引", () => {
    render(<ControlledHost />);
    expect(screen.getAllByTestId("row")).toHaveLength(2);
    expect(screen.getByText("A")).toBeTruthy();
    expect(screen.getByText("B")).toBeTruthy();
  });

  it("add 追加一行并回调新数组", () => {
    const onChange = vi.fn();
    render(<ControlledHost onChange={onChange} />);
    fireEvent.click(screen.getByText("增行"));
    expect(onChange).toHaveBeenLastCalledWith(["A", "B", "NEW"]);
    expect(screen.getAllByTestId("row")).toHaveLength(3);
  });

  it("remove 删除指定索引行", () => {
    const onChange = vi.fn();
    render(<ControlledHost onChange={onChange} />);
    fireEvent.click(screen.getByText("删 0"));
    expect(onChange).toHaveBeenLastCalledWith(["B"]);
    expect(screen.getAllByTestId("row")).toHaveLength(1);
  });

  it("move 调换顺序", () => {
    const onChange = vi.fn();
    render(<ControlledHost onChange={onChange} />);
    fireEvent.click(screen.getByText("移"));
    expect(onChange).toHaveBeenLastCalledWith(["B", "A"]);
  });

  it("非受控：defaultValue 起步，内部自管", () => {
    render(
      <FormList<string> defaultValue={["x"]}>
        {(fields, ops, value) => (
          <div>
            {fields.map((f) => (
              <span key={f.key} data-testid="urow">
                {value[f.name]}
              </span>
            ))}
            <button type="button" onClick={() => ops.add("y")}>
              加
            </button>
          </div>
        )}
      </FormList>,
    );
    expect(screen.getAllByTestId("urow")).toHaveLength(1);
    act(() => {
      fireEvent.click(screen.getByText("加"));
    });
    expect(screen.getAllByTestId("urow")).toHaveLength(2);
    expect(screen.getByText("y")).toBeTruthy();
  });
});
