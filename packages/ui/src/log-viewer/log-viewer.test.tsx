import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LogViewer, levelClass } from "./log-viewer";
import type { LogLine } from "./log-viewer.types";

const lines: LogLine[] = [
  { level: "info", message: "Booting runtime", timestamp: "12:00:01" },
  { level: "warn", message: "Cache miss", timestamp: "12:00:02", source: "[fs]" },
  { level: "error", message: "ENOSPC", timestamp: "12:00:03" },
  { level: "success", message: "Done", timestamp: "12:00:04" },
];

describe("levelClass", () => {
  it("级别 → 字面色类", () => {
    expect(levelClass("error")).toContain("text-danger");
    expect(levelClass("warn")).toContain("text-warning");
    expect(levelClass("success")).toContain("text-success");
    expect(levelClass("debug")).toContain("text-muted");
    expect(levelClass("command")).toContain("text-primary"); // 命令行高亮
    expect(levelClass()).toContain("text-foreground"); // 默认 info
  });
});

describe("LogViewer", () => {
  it("渲染所有行", () => {
    const { getByText } = render(<LogViewer lines={lines} />);
    expect(getByText("Booting runtime")).toBeTruthy();
    expect(getByText("ENOSPC")).toBeTruthy();
  });
  it("error 行用 danger 色", () => {
    const { getByText } = render(<LogViewer lines={lines} />);
    expect(getByText("ENOSPC").className).toContain("text-danger");
  });
  it("showTimestamp=false 默认不渲染时间戳", () => {
    const { queryByText } = render(<LogViewer lines={lines} />);
    expect(queryByText("12:00:01")).toBeNull();
  });
  it("showTimestamp=true 渲染时间戳", () => {
    const { getByText } = render(<LogViewer lines={lines} showTimestamp />);
    expect(getByText("12:00:01")).toBeTruthy();
  });
  it("source 前缀渲染", () => {
    const { getByText } = render(<LogViewer lines={lines} />);
    expect(getByText("[fs]")).toBeTruthy();
  });
  it("wrap 切换正文换行类", () => {
    const { getByText } = render(<LogViewer lines={lines} wrap />);
    expect(getByText("Booting runtime").className).toContain("break-words");
  });
});
