import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { splitBlocks } from "./diff-stat.split";
import { DiffStat } from "./diff-stat";

describe("splitBlocks", () => {
  it("全增满绿", () => {
    const r = splitBlocks(10, 0, 5);
    expect(r.green).toBe(5);
    expect(r.red).toBe(0);
    expect(r.empty).toBe(0);
  });
  it("全删满红", () => {
    const r = splitBlocks(0, 8, 5);
    expect(r.green).toBe(0);
    expect(r.red).toBe(5);
  });
  it("增删对半：双色都 >0 且总和 ≤ blocks", () => {
    const r = splitBlocks(5, 5, 4);
    expect(r.green).toBeGreaterThan(0);
    expect(r.red).toBeGreaterThan(0);
    expect(r.green + r.red).toBeLessThanOrEqual(4);
  });
  it("零改动全空", () => {
    expect(splitBlocks(0, 0, 5)).toEqual({ green: 0, red: 0, empty: 5 });
  });
  it("极小占比也保证有删至少 1 红", () => {
    const r = splitBlocks(99, 1, 5);
    expect(r.red).toBeGreaterThanOrEqual(1);
  });
});

describe("DiffStat", () => {
  it("显示 +N −M", () => {
    const { container } = render(<DiffStat additions={12} deletions={3} />);
    expect(container.textContent).toContain("+12");
    expect(container.textContent).toContain("−3");
  });
  it("status 徽标", () => {
    const { getByText } = render(<DiffStat additions={1} deletions={0} status="added" />);
    expect(getByText("新增")).toBeTruthy();
  });
  it("格子条总数 = blocks", () => {
    const { container } = render(<DiffStat additions={3} deletions={2} blocks={5} />);
    expect(container.querySelectorAll(".rounded-\\[2px\\]").length).toBe(5);
  });
  it("showCounts=false 不渲染数字", () => {
    const { container } = render(<DiffStat additions={3} deletions={2} showCounts={false} />);
    expect(container.textContent).not.toContain("+3");
  });
});
