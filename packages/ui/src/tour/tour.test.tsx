import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Tour } from "./tour";
import type { TourStep } from "./tour.types";
import {
  computeCardPosition,
  computeSpotlight,
  resolveTarget,
} from "./tour.geometry";

afterEach(cleanup);

// jsdom 无布局：getBoundingClientRect 恒 0、scrollIntoView 缺失（组件已用可选链兜底）。
// 行为测试用「无 target 居中步」避开几何依赖；几何全交纯函数单测。
const steps: TourStep[] = [
  { title: "第一步", description: "开场介绍" },
  { title: "第二步", description: "中间步骤" },
  { title: "第三步", description: "收尾步骤" },
];

describe("tour.geometry 纯函数", () => {
  it("resolveTarget：函数 / 选择器 / null / 非法选择器", () => {
    const el = document.createElement("div");
    expect(resolveTarget(() => el)).toBe(el);
    expect(resolveTarget(null)).toBeNull();
    expect(resolveTarget(undefined)).toBeNull();
    // 函数抛错 → 安全降级 null
    expect(
      resolveTarget(() => {
        throw new Error("boom");
      }),
    ).toBeNull();

    document.body.innerHTML = `<div id="t-target"></div>`;
    expect(resolveTarget("#t-target")).toBe(document.getElementById("t-target"));
    expect(resolveTarget("#missing")).toBeNull();
    expect(resolveTarget("::::bad")).toBeNull(); // 非法选择器不抛
    document.body.innerHTML = "";
  });

  it("computeSpotlight：四周外扩 padding，宽高不为负", () => {
    const sp = computeSpotlight({ top: 100, left: 50, width: 200, height: 40 }, 8);
    expect(sp).toEqual({ top: 92, left: 42, width: 216, height: 56 });
    const neg = computeSpotlight({ top: 0, left: 0, width: 0, height: 0 }, 0);
    expect(neg.width).toBe(0);
    expect(neg.height).toBe(0);
  });

  it("computeCardPosition：bottom 默认在目标下方且水平居中", () => {
    const spot = { top: 100, left: 100, width: 100, height: 40 };
    const pos = computeCardPosition(spot, "bottom", { width: 200, height: 100 }, { width: 1000, height: 800 }, 12);
    expect(pos.placement).toBe("bottom");
    expect(pos.top).toBe(100 + 40 + 12); // 目标底 + gap
    expect(pos.left).toBe(100 + 50 - 100); // 目标水平中心 - 卡片半宽
  });

  it("computeCardPosition：下方放不下 → 翻转到 top", () => {
    // 目标贴近视口底部，bottom 放不下、top 放得下 → 翻转
    const spot = { top: 700, left: 100, width: 100, height: 40 };
    const pos = computeCardPosition(spot, "bottom", { width: 200, height: 200 }, { width: 1000, height: 800 }, 12);
    expect(pos.placement).toBe("top");
  });

  it("computeCardPosition：坐标夹进视口（目标贴边时不溢出）", () => {
    const spot = { top: 100, left: 0, width: 40, height: 40 };
    const pos = computeCardPosition(spot, "bottom", { width: 300, height: 100 }, { width: 1000, height: 800 }, 12);
    expect(pos.left).toBeGreaterThanOrEqual(8); // MARGIN 兜底
    expect(pos.left + 300).toBeLessThanOrEqual(1000 - 8);
  });
});

describe("Tour 行为", () => {
  it("open=false 时不渲染任何遮罩 / 卡片", () => {
    render(<Tour steps={steps} open={false} current={0} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("open=true 渲染 dialog + 标题 + 描述 + 进度 1/N", () => {
    render(<Tour steps={steps} open current={0} />);
    const dlg = screen.getByRole("dialog");
    expect(dlg.getAttribute("aria-modal")).toBe("true");
    expect(screen.getByText("第一步")).toBeTruthy();
    expect(screen.getByText("开场介绍")).toBeTruthy();
    expect(screen.getByText("1/3")).toBeTruthy();
  });

  it("首步隐藏「上一步」；末步「下一步」变为「完成」", () => {
    const { rerender } = render(<Tour steps={steps} open current={0} />);
    expect(screen.queryByRole("button", { name: "上一步" })).toBeNull();
    expect(screen.getByRole("button", { name: "下一步" })).toBeTruthy();

    rerender(<Tour steps={steps} open current={2} />);
    expect(screen.getByRole("button", { name: "上一步" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "下一步" })).toBeNull();
    expect(screen.getByRole("button", { name: "完成" })).toBeTruthy();
    expect(screen.getByText("3/3")).toBeTruthy();
  });

  it("下一步 → onChange(current+1)；上一步 → onChange(current-1)", () => {
    const onChange = vi.fn();
    const { rerender } = render(<Tour steps={steps} open current={0} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "下一步" }));
    expect(onChange).toHaveBeenCalledWith(1);

    rerender(<Tour steps={steps} open current={1} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "上一步" }));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("末步「完成」→ onFinish（未传则 onClose）", () => {
    const onFinish = vi.fn();
    const onClose = vi.fn();
    const { rerender } = render(
      <Tour steps={steps} open current={2} onFinish={onFinish} onClose={onClose} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "完成" }));
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    // 未传 onFinish → 走 onClose
    const onClose2 = vi.fn();
    rerender(<Tour steps={steps} open current={2} onClose={onClose2} />);
    fireEvent.click(screen.getByRole("button", { name: "完成" }));
    expect(onClose2).toHaveBeenCalledTimes(1);
  });

  it("跳过 / 关闭按钮 / Esc 均触发 onClose", () => {
    const onClose = vi.fn();
    render(<Tour steps={steps} open current={1} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "跳过" }));
    fireEvent.click(screen.getByRole("button", { name: "关闭引导" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("maskClosable：点遮罩才关闭（默认不关）", () => {
    const onClose = vi.fn();
    const { rerender } = render(<Tour steps={steps} open current={0} onClose={onClose} />);
    // 遮罩 svg aria-hidden，按 DOM 取
    const mask = () => document.querySelector("svg[aria-hidden]") as SVGElement;
    fireEvent.click(mask());
    expect(onClose).not.toHaveBeenCalled(); // 默认 maskClosable=false

    rerender(<Tour steps={steps} open current={0} onClose={onClose} maskClosable />);
    fireEvent.click(mask());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
