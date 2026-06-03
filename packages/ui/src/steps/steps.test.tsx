import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Steps } from "./steps";
import type { StepsItem } from "./steps.types";

const ITEMS: StepsItem[] = [
  { title: "一", description: "d1" },
  { title: "二" },
  { title: "三" },
];

describe("Steps", () => {
  it("渲染全部步骤标题与描述", () => {
    const { getByText } = render(<Steps items={ITEMS} current={1} />);
    expect(getByText("一")).toBeTruthy();
    expect(getByText("三")).toBeTruthy();
    expect(getByText("d1")).toBeTruthy();
  });

  it("current 之前为 finish（显示 √ 图标）", () => {
    const { container } = render(<Steps items={ITEMS} current={1} />);
    // 第一步 finish → 含 lucide-check
    expect(container.querySelector(".lucide-check")).toBeTruthy();
  });

  it("current 步标记 aria-current=step", () => {
    const { container } = render(<Steps items={ITEMS} current={1} />);
    const cur = container.querySelector('[aria-current="step"]');
    expect(cur?.textContent).toContain("二");
  });

  it("status=error 时当前步显示 × 图标", () => {
    const { container } = render(<Steps items={ITEMS} current={1} status="error" />);
    expect(container.querySelector(".lucide-x")).toBeTruthy();
  });

  it("item.status 覆盖派生状态", () => {
    const items: StepsItem[] = [{ title: "x", status: "error" }, { title: "y" }];
    const { container } = render(<Steps items={items} current={1} />);
    expect(container.querySelector(".lucide-x")).toBeTruthy();
  });

  it("onChange 提供时点击非禁用步触发，禁用步不触发", () => {
    const fn = vi.fn();
    const items: StepsItem[] = [{ title: "a" }, { title: "b", disabled: true }, { title: "c" }];
    const { getByText } = render(<Steps items={items} current={0} onChange={fn} />);
    fireEvent.click(getByText("c"));
    expect(fn).toHaveBeenCalledWith(2);
    fn.mockClear();
    const bBtn = getByText("b").closest("button") as HTMLButtonElement;
    expect(bBtn.disabled).toBe(true);
  });

  it("无 onChange 时步头不是 button", () => {
    const { getByText } = render(<Steps items={ITEMS} current={0} />);
    expect(getByText("一").closest("button")).toBeNull();
  });

  it("vertical 方向使用纵向连接线（w-0.5）", () => {
    const { container } = render(<Steps direction="vertical" items={ITEMS} current={1} />);
    expect(container.querySelector(".w-0\\.5")).toBeTruthy();
  });

  it("透传 className 到 ol", () => {
    const { container } = render(<Steps items={ITEMS} current={0} className="my-steps" />);
    expect(container.firstElementChild!.classList.contains("my-steps")).toBe(true);
  });
});
