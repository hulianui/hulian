import { Profiler, type ReactElement } from "react";
import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "../date-picker/date-picker";
import { TimePicker } from "../time-picker/time-picker";
import { DateTimePicker } from "./date-time-picker";

// 守护的东西只有一条：父级更新时这三个 picker 必须跳过自己的子树。
//
// **别用绝对毫秒阈值断言它。** memo 命中时 Profiler 记到的 actualDuration 是
// 0.004–0.008ms（只剩 Profiler 自身开销），而 baseDuration 是 1.3–10ms —— 差三个
// 数量级。看着余量有上百倍，但这是**挂钟时间**：全量并发跑测试时一次调度延迟或 GC
// 就是毫秒级，能把 0.006ms 的测量抬到 0.5ms 以上。此前的 `< max(0.5, base * 0.1)`
// 就是这样偶发翻红的 —— 红的是 CI 机器的负载，不是组件。
//
// 现在分两层，都不受负载影响：
//   1. 结构断言 —— 组件确实被 memo 包着（memo 一旦被误删，这里立刻红）；
//   2. 行为断言 —— 多次 rerender 取 actualDuration 的**最小值**。抖动是单向的
//      （只会变慢），取最小值等于滤掉被打断的那几次采样。
const cases: Array<[string, () => ReactElement, unknown]> = [
  ["DatePicker", () => <DatePicker aria-label="选择日期" />, DatePicker],
  ["TimePicker", () => <TimePicker aria-label="选择时间" />, TimePicker],
  ["DateTimePicker", () => <DateTimePicker aria-label="选择日期时间" />, DateTimePicker],
];

const SAMPLES = 5;

describe("picker stable parent updates", () => {
  it.each(cases)("%s 被 memo 包着", (_name, _renderPicker, component) => {
    expect((component as { $$typeof?: symbol }).$$typeof).toBe(Symbol.for("react.memo"));
  });

  it.each(cases)("%s skips its subtree", async (name, renderPicker) => {
    const onRender = vi.fn();
    const { rerender } = render(
      <div data-parent-version="0">
        <Profiler id={name} onRender={onRender}>
          {renderPicker()}
        </Profiler>
      </div>,
    );
    await act(async () => undefined);
    onRender.mockClear();

    const actualDurations: number[] = [];
    let baseDuration = 0;
    for (let version = 1; version <= SAMPLES; version++) {
      rerender(
        <div data-parent-version={String(version)}>
          <Profiler id={name} onRender={onRender}>
            {renderPicker()}
          </Profiler>
        </div>,
      );
      const update = onRender.mock.calls.at(-1);
      expect(update?.[1]).toBe("update");
      actualDurations.push((update?.[2] as number) ?? Number.POSITIVE_INFINITY);
      // baseDuration 是 React 对「不做 memoization 时重渲染整棵子树」的估计，
      // 来自挂载期的累积，不随本次采样抖动。
      baseDuration = (update?.[3] as number) ?? 0;
    }

    expect(Math.min(...actualDurations)).toBeLessThan(baseDuration * 0.1);
  });
});
