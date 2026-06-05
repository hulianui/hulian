import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { QueueLane } from "./queue-lane";
import type { QueueLaneDef, QueueItem } from "./queue-lane.types";

afterEach(cleanup);

interface Job extends QueueItem {
  title: string;
}

const lanes: QueueLaneDef[] = [
  { id: "p0", label: "P0 紧急", tone: "var(--chart-3)" },
  { id: "p1", label: "P1 高" },
  { id: "p2", label: "P2 普通" }, // 故意留空，验证空道
];

const jobs: Job[] = [
  { id: "j1", laneId: "p0", title: "甲" },
  { id: "j2", laneId: "p0", title: "乙" },
  { id: "j3", laneId: "p0", title: "丙" },
  { id: "j4", laneId: "p1", title: "丁" },
];

const baseProps = {
  lanes,
  items: jobs,
  renderItem: (j: Job) => <span>{j.title}</span>,
};

describe("QueueLane 渲染", () => {
  it("渲染各道 label 并按 laneId 分组卡片", () => {
    const { container } = render(<QueueLane<Job> {...baseProps} />);
    const cols = container.querySelectorAll("section");
    expect(cols.length).toBe(3);
    // p0 道含「甲乙丙」
    expect(cols[0].textContent).toContain("P0 紧急");
    expect(cols[0].textContent).toContain("甲");
    expect(cols[0].textContent).toContain("丙");
    // p1 道含「丁」，不含「甲」
    expect(cols[1].textContent).toContain("丁");
    expect(cols[1].textContent).not.toContain("甲");
  });

  it("道头默认展示条数聚合", () => {
    const { container } = render(<QueueLane<Job> {...baseProps} />);
    const cols = container.querySelectorAll("section");
    expect(cols[0].textContent).toContain("3 条");
    expect(cols[1].textContent).toContain("1 条");
  });

  it("空道渲染占位（p2 无卡片）", () => {
    const { container } = render(<QueueLane<Job> {...baseProps} />);
    const p2 = container.querySelectorAll("section")[2];
    expect(p2.textContent).toContain("队列空闲");
  });

  it("renderLaneHeader 拿到该道队列做指标聚合", () => {
    const { container } = render(
      <QueueLane<Job>
        {...baseProps}
        renderLaneHeader={(l, its) => <div>{`${l.id}-深度${its.length}`}</div>}
      />,
    );
    const cols = container.querySelectorAll("section");
    expect(cols[0].textContent).toContain("p0-深度3");
    expect(cols[2].textContent).toContain("p2-深度0");
  });

  it("maxVisible 折叠超出项并显示「还有 N 条」", () => {
    const { container } = render(<QueueLane<Job> {...baseProps} maxVisible={2} />);
    const p0 = container.querySelectorAll("section")[0];
    // 直显前 2 条（甲乙），丙折叠
    expect(p0.textContent).toContain("甲");
    expect(p0.textContent).toContain("乙");
    expect(p0.textContent).not.toContain("丙");
    expect(p0.textContent).toContain("还有 1 条");
  });

  it("点击卡片触发 onItemClick", () => {
    const onItemClick = vi.fn();
    const { container } = render(<QueueLane<Job> {...baseProps} onItemClick={onItemClick} />);
    const firstCard = container.querySelector("[role='button']") as HTMLElement;
    fireEvent.click(firstCard);
    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith(jobs[0]);
  });

  it("未提供 onItemClick 时卡片不是按钮（只读）", () => {
    const { container } = render(<QueueLane<Job> {...baseProps} />);
    expect(container.querySelector("[role='button']")).toBeNull();
  });
});
