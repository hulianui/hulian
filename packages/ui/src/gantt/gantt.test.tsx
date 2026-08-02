import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { Gantt } from "./gantt";

describe("Gantt locale", () => {
  it("uses ConfigProvider for empty and chart labels", () => {
    const { getByText, rerender, getByRole } = render(
      <ConfigProvider locale={enUS}><Gantt tasks={[]} /></ConfigProvider>,
    );
    expect(getByText("No schedule data")).toBeTruthy();
    rerender(
      <ConfigProvider locale={enUS}>
        <Gantt tasks={[{ id: "task", name: "Build", start: "2026-01-01", end: "2026-01-02" }]} />
      </ConfigProvider>,
    );
    expect(getByRole("table").getAttribute("aria-label")).toBe("Project schedule Gantt chart");
    expect(getByText("Task")).toBeTruthy();
  });
});
