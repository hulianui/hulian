import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { InterceptCard } from "./intercept-card";

afterEach(cleanup);

const base = {
  severity: "block" as const,
  title: "并行子任务上限",
  message: "同一会话最多允许 2 个并行子任务",
  source: "团队约定 · 硬约束 4",
};

describe("InterceptCard", () => {
  it("渲染标题、说明与溯源", () => {
    const { getByText } = render(<InterceptCard {...base} />);
    expect(getByText("并行子任务上限")).toBeTruthy();
    expect(getByText("同一会话最多允许 2 个并行子任务")).toBeTruthy();
    expect(getByText(/团队约定 · 硬约束 4/)).toBeTruthy();
  });

  it("severity 落到 data-severity 且三档文案不同", () => {
    const { container: b } = render(<InterceptCard {...base} severity="block" />);
    expect(b.querySelector('[data-severity="block"]')).toBeTruthy();
    expect(b.textContent).toContain("已拦截");

    cleanup();
    const { container: c } = render(<InterceptCard {...base} severity="confirm" />);
    expect(c.textContent).toContain("待确认");

    cleanup();
    const { container: n } = render(<InterceptCard {...base} severity="notice" />);
    expect(n.textContent).toContain("提醒");
  });

  it("违反点与建议缺省不渲染", () => {
    const { queryByText } = render(<InterceptCard {...base} />);
    expect(queryByText("违反点")).toBeNull();
    expect(queryByText("建议改法")).toBeNull();
  });

  it("给了违反点与建议就渲染", () => {
    const { getByText } = render(
      <InterceptCard {...base} violation="/repo/src/a.ts" suggestion="改用 engine 提供的接口" />,
    );
    expect(getByText("违反点")).toBeTruthy();
    expect(getByText("/repo/src/a.ts")).toBeTruthy();
    expect(getByText("改用 engine 提供的接口")).toBeTruthy();
  });

  it("无 onOverride 时不渲染放行入口", () => {
    const { queryByText } = render(<InterceptCard {...base} />);
    expect(queryByText("放行本次")).toBeNull();
  });

  it("点击放行先展开理由输入而非直接放行", () => {
    const onOverride = vi.fn();
    const { getByText, getByPlaceholderText } = render(
      <InterceptCard {...base} onOverride={onOverride} />,
    );
    fireEvent.click(getByText("放行本次"));
    expect(getByPlaceholderText(/为什么这次可以放行/)).toBeTruthy();
    expect(onOverride).not.toHaveBeenCalled();
  });

  it("理由为空时确认按钮禁用 —— 无理由的放行等于没有治理", () => {
    const onOverride = vi.fn();
    const { getByText } = render(<InterceptCard {...base} onOverride={onOverride} />);
    fireEvent.click(getByText("放行本次"));

    const confirm = getByText("确认放行") as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.click(confirm);
    expect(onOverride).not.toHaveBeenCalled();
  });

  it("只有空白字符也算没写理由", () => {
    const onOverride = vi.fn();
    const { getByText, getByPlaceholderText } = render(
      <InterceptCard {...base} onOverride={onOverride} />,
    );
    fireEvent.click(getByText("放行本次"));
    fireEvent.change(getByPlaceholderText(/为什么/), { target: { value: "   " } });
    expect((getByText("确认放行") as HTMLButtonElement).disabled).toBe(true);
  });

  it("填了理由后放行，回调收到 trim 过的理由", async () => {
    const onOverride = vi.fn();
    const { getByText, getByPlaceholderText } = render(
      <InterceptCard {...base} onOverride={onOverride} />,
    );
    fireEvent.click(getByText("放行本次"));
    fireEvent.change(getByPlaceholderText(/为什么/), { target: { value: "  这次确有必要  " } });
    fireEvent.click(getByText("确认放行"));
    await waitFor(() => expect(onOverride).toHaveBeenCalledWith("这次确有必要"));
  });

  it("取消后收起输入并清空已填理由", () => {
    const { getByText, queryByPlaceholderText, getByPlaceholderText } = render(
      <InterceptCard {...base} onOverride={vi.fn()} />,
    );
    fireEvent.click(getByText("放行本次"));
    fireEvent.change(getByPlaceholderText(/为什么/), { target: { value: "写了一半" } });
    fireEvent.click(getByText("取消"));
    expect(queryByPlaceholderText(/为什么/)).toBeNull();

    fireEvent.click(getByText("放行本次"));
    expect((getByPlaceholderText(/为什么/) as HTMLTextAreaElement).value).toBe("");
  });

  it("已放行时展示既有理由且不再提供放行入口", () => {
    const { getByText, queryByText } = render(
      <InterceptCard
        {...base}
        onOverride={vi.fn()}
        overridden={{ reason: "本次确有必要", at: "09:13" }}
      />,
    );
    expect(getByText("已放行")).toBeTruthy();
    expect(getByText("本次确有必要")).toBeTruthy();
    expect(getByText("09:13")).toBeTruthy();
    expect(queryByText("放行本次")).toBeNull();
  });

  it("异步 onOverride 期间按钮进入处理中态", async () => {
    let resolve!: () => void;
    const onOverride = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    const { getByText, getByPlaceholderText } = render(
      <InterceptCard {...base} onOverride={onOverride} />,
    );
    fireEvent.click(getByText("放行本次"));
    fireEvent.change(getByPlaceholderText(/为什么/), { target: { value: "ok" } });
    fireEvent.click(getByText("确认放行"));

    await waitFor(() => expect(getByText("处理中…")).toBeTruthy());
    resolve();
  });
});
