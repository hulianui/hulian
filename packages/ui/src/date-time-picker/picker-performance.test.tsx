import { Profiler, type ReactElement } from "react";
import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "../date-picker/date-picker";
import { TimePicker } from "../time-picker/time-picker";
import { DateTimePicker } from "./date-time-picker";

const cases: Array<[string, () => ReactElement]> = [
  ["DatePicker", () => <DatePicker aria-label="选择日期" />],
  ["TimePicker", () => <TimePicker aria-label="选择时间" />],
  ["DateTimePicker", () => <DateTimePicker aria-label="选择日期时间" />],
];

describe("picker stable parent updates", () => {
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
    rerender(
      <div data-parent-version="1">
        <Profiler id={name} onRender={onRender}>
          {renderPicker()}
        </Profiler>
      </div>,
    );

    const update = onRender.mock.calls.at(-1);
    expect(update?.[1]).toBe("update");
    expect(update?.[2]).toBeLessThan(update?.[3] * 0.1);
  });
});
