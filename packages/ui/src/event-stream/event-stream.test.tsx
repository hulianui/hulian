import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { EventStream } from "./event-stream";
import type { EventStreamItem } from "./event-stream.types";

afterEach(cleanup);

const items: EventStreamItem[] = [
  { id: 1, ts: "09:12:01", tone: "success", title: "构建通过", meta: "2.1s" },
  { id: 2, ts: "09:12:44", tone: "danger", title: "越权写入被拦", detail: "目标超出允许范围", meta: "1.3ms" },
  { id: 3, ts: "09:13:02", tone: "warning", title: "需人工确认", overridden: "本次确有必要" },
];

describe("EventStream", () => {
  it("渲染全部条目与时间", () => {
    const { getByText } = render(<EventStream items={items} />);
    expect(getByText("构建通过")).toBeTruthy();
    expect(getByText("09:12:44")).toBeTruthy();
  });

  it("空数组渲染空态而非空白", () => {
    const { getByText } = render(<EventStream items={[]} emptyText="还没有事件" />);
    expect(getByText("还没有事件")).toBeTruthy();
  });

  it("detail 默认折起，点击标题后展开", () => {
    const { getByText, queryByText } = render(<EventStream items={items} />);
    expect(queryByText("目标超出允许范围")).toBeNull();
    fireEvent.click(getByText("越权写入被拦"));
    expect(getByText("目标超出允许范围")).toBeTruthy();
  });

  it("defaultExpanded 时 detail 直接可见", () => {
    const { getByText } = render(<EventStream items={items} defaultExpanded />);
    expect(getByText("目标超出允许范围")).toBeTruthy();
  });

  it("onItemClick 被调用并带上原始条目", () => {
    const onItemClick = vi.fn();
    const { getByText } = render(<EventStream items={items} onItemClick={onItemClick} />);
    fireEvent.click(getByText("构建通过"));
    expect(onItemClick).toHaveBeenCalledWith(items[0]);
  });

  it("键盘 Enter 等价于点击（可达性）", () => {
    const onItemClick = vi.fn();
    const { getByText } = render(<EventStream items={items} onItemClick={onItemClick} />);
    fireEvent.keyDown(getByText("构建通过"), { key: "Enter" });
    expect(onItemClick).toHaveBeenCalledTimes(1);
  });

  it("无 detail 且无 onItemClick 时不产生可点击语义", () => {
    const { container } = render(<EventStream items={[{ id: 1, ts: "t", title: "只读" }]} />);
    expect(container.querySelector('[role="button"]')).toBeNull();
  });

  it("overridden 渲染放行说明", () => {
    const { getByText } = render(<EventStream items={items} />);
    expect(getByText(/本次确有必要/)).toBeTruthy();
  });

  it("tone 落到 data-tone 便于测试与外部样式钩子", () => {
    const { container } = render(<EventStream items={items} />);
    expect(container.querySelector('[data-tone="danger"]')).toBeTruthy();
    expect(container.querySelector('[data-tone="success"]')).toBeTruthy();
  });

  it("缺省 tone 落为 neutral", () => {
    const { container } = render(<EventStream items={[{ id: 9, ts: "t", title: "x" }]} />);
    expect(container.querySelector('[data-tone="neutral"]')).toBeTruthy();
  });

  it("maxHeight 时容器可滚动", () => {
    const { container } = render(<EventStream items={items} maxHeight={200} />);
    const ol = container.querySelector("ol")!;
    expect(ol.className).toContain("overflow-y-auto");
    expect(ol.getAttribute("style")).toContain("200px");
  });

  it("side=right 时行方向反转", () => {
    const { container } = render(<EventStream items={items} side="right" />);
    expect(container.querySelector("li")!.className).toContain("flex-row-reverse");
  });

  it("live 首帧不闪（避免初次挂载整屏一起动）", () => {
    const { container } = render(<EventStream items={items} live />);
    expect(container.innerHTML).not.toContain("hulian-event-flash");
  });

  it("live 下新增条目才带淡入", () => {
    const { container, rerender } = render(<EventStream items={items} live />);
    rerender(<EventStream items={[...items, { id: 4, ts: "09:14:00", title: "新事件" }]} live />);
    expect(container.innerHTML).toContain("hulian-event-flash");
  });
});
