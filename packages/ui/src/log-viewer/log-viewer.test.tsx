import { describe, it, expect } from "vitest";
import { fireEvent, render } from "@testing-library/react";
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
    expect(levelClass("debug")).toContain("text-muted-foreground");
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

  // 流式日志：长流的两条护栏
  describe("流式", () => {
    const many: LogLine[] = Array.from({ length: 50 }, (_, i) => ({ message: `行 ${i}` }));

    it("maxLines 只渲染最后 N 行，原数组不动", () => {
      const { queryByText, getByText } = render(<LogViewer lines={many} maxLines={5} />);
      expect(queryByText("行 44")).toBeNull();
      expect(getByText("行 45")).toBeTruthy();
      expect(getByText("行 49")).toBeTruthy();
      expect(many).toHaveLength(50);
    });

    it("不传 maxLines 时全渲染", () => {
      const { getByText } = render(<LogViewer lines={many} />);
      expect(getByText("行 0")).toBeTruthy();
      expect(getByText("行 49")).toBeTruthy();
    });

    it("maxLines=0 视为不截", () => {
      const { getByText } = render(<LogViewer lines={many} maxLines={0} />);
      expect(getByText("行 0")).toBeTruthy();
    });

    // 黏底：用户滚上去看历史后，追加新行不该把视口拽回底部
    it("用户滚离底部后，新行不再强制贴底", () => {
      const { container, rerender } = render(<LogViewer lines={many.slice(0, 10)} />);
      const box = container.firstElementChild as HTMLDivElement;
      // jsdom 不做布局，手工喂几何：内容 1000、视口 100
      Object.defineProperty(box, "scrollHeight", { value: 1000, configurable: true });
      Object.defineProperty(box, "clientHeight", { value: 100, configurable: true });

      // 停在底部 → 跟随
      box.scrollTop = 900;
      fireEvent.scroll(box);
      rerender(<LogViewer lines={many.slice(0, 11)} />);
      expect(box.scrollTop).toBe(1000);

      // 主动往上滚 → 不再跟随
      box.scrollTop = 200;
      fireEvent.scroll(box);
      rerender(<LogViewer lines={many.slice(0, 12)} />);
      expect(box.scrollTop).toBe(200);

      // 滚回底部 → 恢复跟随
      box.scrollTop = 900;
      fireEvent.scroll(box);
      rerender(<LogViewer lines={many.slice(0, 13)} />);
      expect(box.scrollTop).toBe(1000);
    });

    it("autoScroll=false 时任何情况都不动 scrollTop", () => {
      const { container, rerender } = render(<LogViewer lines={many.slice(0, 10)} autoScroll={false} />);
      const box = container.firstElementChild as HTMLDivElement;
      Object.defineProperty(box, "scrollHeight", { value: 1000, configurable: true });
      Object.defineProperty(box, "clientHeight", { value: 100, configurable: true });
      box.scrollTop = 900;
      fireEvent.scroll(box);
      rerender(<LogViewer lines={many.slice(0, 11)} autoScroll={false} />);
      expect(box.scrollTop).toBe(900);
    });
  });
});
