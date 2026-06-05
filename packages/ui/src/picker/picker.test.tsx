import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Picker } from "./picker";
import type { PickerColumn } from "./picker.types";

const col: PickerColumn = {
  options: [
    { value: "a", label: "甲" },
    { value: "b", label: "乙" },
    { value: "c", label: "丙" },
    { value: "d", label: "丁" },
  ],
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  cleanup();
});

function scroller(c: HTMLElement) {
  return c.querySelector(".snap-y") as HTMLElement;
}

describe("Picker", () => {
  it("渲染所有列选项", () => {
    const { getByText } = render(<Picker columns={[col]} defaultValue={["a"]} />);
    for (const t of ["甲", "乙", "丙", "丁"]) expect(getByText(t)).toBeTruthy();
  });

  it("滚动停稳后取最近项 emit onChange（含列下标）", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Picker columns={[col]} defaultValue={["a"]} onChange={onChange} itemHeight={40} />,
    );
    const el = scroller(container);
    el.scrollTop = 80; // 第 3 项(index2='c')
    fireEvent.scroll(el);
    vi.advanceTimersByTime(150);
    expect(onChange).toHaveBeenCalledWith(["c"], 0);
  });

  it("受控 value 定位到对应行 scrollTop", () => {
    const { container } = render(<Picker columns={[col]} value={["c"]} itemHeight={40} />);
    expect(scroller(container).scrollTop).toBe(80); // index2 * 40
  });

  it("多列各自独立 emit，保留其他列值", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Picker columns={[col, col]} defaultValue={["a", "a"]} onChange={onChange} itemHeight={40} />,
    );
    const cols = container.querySelectorAll<HTMLElement>(".snap-y");
    cols[1].scrollTop = 40; // 第二列 → index1='b'
    fireEvent.scroll(cols[1]);
    vi.advanceTimersByTime(150);
    expect(onChange).toHaveBeenCalledWith(["a", "b"], 1);
  });
});
