import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Segmented } from "./segmented";
import { Field } from "../field";
import type { SegmentedItem } from "./segmented.types";

afterEach(cleanup);

// hulianui/hulian#297：段数变化后选中滑块不重新测量，停在旧宽度。
// 这条只能在真实浏览器里量 —— jsdom 没有布局引擎（offsetWidth 恒 0），
// 「滑块 553px 而段只有 367px」这类结论在 unit project 里一律测不出来。
const COLUMN_WIDTH = 1120;
const LETTERS = ["A", "B", "C", "D"];

const itemsOf = (n: number): SegmentedItem[] =>
  LETTERS.slice(0, n).map((v) => ({ value: v, label: v }));

// Field 竖排是 `flex flex-col`，align-items 默认 stretch，会把 inline-flex 的
// Segmented root 拉满整列宽 —— root 宽度恒定，唯一随段数变的是段宽。
function Shell({ count }: { count: number }) {
  return (
    <div style={{ width: COLUMN_WIDTH }}>
      <Field label="正确答案">
        <Segmented items={itemsOf(count)} defaultValue="A" aria-label="正确答案" />
      </Field>
    </div>
  );
}

const root = () => document.querySelector('[role="radiogroup"]') as HTMLElement;
// 滑块的**内联 width 即测量结果**，读它可以绕开 transition 中间值（我们要验的是测量对不对）。
const indicatorWidth = () =>
  parseFloat((root().querySelector('span[aria-hidden="true"]') as HTMLElement).style.width);
const selectedWidth = () =>
  document.querySelector('[role="radio"][aria-checked="true"]')!.getBoundingClientRect().width;

// ResizeObserver 的回调是下一帧派发的，量之前先让出一帧再加点余量。
const settle = () => new Promise((r) => setTimeout(r, 60));
// 滑块贴合选中段（offsetWidth 取整 vs rect 小数，留 1.5px 容差）。
const expectSnug = () => expect(Math.abs(indicatorWidth() - selectedWidth())).toBeLessThan(1.5);

describe("Segmented 滑块测量（真实浏览器）", () => {
  it("段数增加后滑块跟着变窄（选中段没换过）", async () => {
    const { rerender } = render(<Shell count={2} />);
    await settle();
    expectSnug();

    for (const count of [3, 4]) {
      rerender(<Shell count={count} />);
      await settle();
      expectSnug();
    }
  });

  it("段数减少后滑块跟着变宽", async () => {
    const { rerender } = render(<Shell count={4} />);
    await settle();
    expectSnug();

    rerender(<Shell count={2} />);
    await settle();
    expectSnug();
  });

  it("容器变窄时滑块仍贴合选中段（原 ResizeObserver 行为不回归）", async () => {
    const { rerender } = render(<Shell count={3} />);
    await settle();
    expectSnug();

    rerender(
      <div style={{ width: 420 }}>
        <Field label="正确答案">
          <Segmented items={itemsOf(3)} defaultValue="A" aria-label="正确答案" />
        </Field>
      </div>,
    );
    await settle();
    expectSnug();
  });
});
