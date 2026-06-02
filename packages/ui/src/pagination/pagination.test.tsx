import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Pagination } from "./pagination";

describe("Pagination 组件", () => {
  it("根元素是 nav，默认 aria-label=pagination", () => {
    const { container } = render(<Pagination page={1} total={5} onPageChange={() => {}} />);
    const nav = container.querySelector("nav");
    expect(nav).toBeTruthy();
    expect(nav!.getAttribute("aria-label")).toBe("pagination");
  });

  it("当前页按钮带 aria-current=page", () => {
    const { getByRole } = render(<Pagination page={3} total={10} onPageChange={() => {}} />);
    const cur = getByRole("button", { name: "第 3 页" });
    expect(cur.getAttribute("aria-current")).toBe("page");
  });

  it("非当前页按钮无 aria-current", () => {
    const { getByRole } = render(<Pagination page={3} total={10} onPageChange={() => {}} />);
    expect(getByRole("button", { name: "第 4 页" }).getAttribute("aria-current")).toBeNull();
  });

  it("点页码按钮 → onPageChange 携带该页", () => {
    const onPageChange = vi.fn();
    const { getByRole } = render(<Pagination page={3} total={10} onPageChange={onPageChange} />);
    fireEvent.click(getByRole("button", { name: "第 4 页" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("点上一页/下一页 → onPageChange(current∓1)", () => {
    const onPageChange = vi.fn();
    const { getByRole } = render(<Pagination page={3} total={10} onPageChange={onPageChange} />);
    fireEvent.click(getByRole("button", { name: "上一页" }));
    fireEvent.click(getByRole("button", { name: "下一页" }));
    expect(onPageChange).toHaveBeenNthCalledWith(1, 2);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 4);
  });

  it("头部边界：上一页 disabled；尾部边界：下一页 disabled", () => {
    const { getByRole, rerender } = render(
      <Pagination page={1} total={10} onPageChange={() => {}} />,
    );
    expect((getByRole("button", { name: "上一页" }) as HTMLButtonElement).disabled).toBe(true);
    expect((getByRole("button", { name: "下一页" }) as HTMLButtonElement).disabled).toBe(false);
    rerender(<Pagination page={10} total={10} onPageChange={() => {}} />);
    expect((getByRole("button", { name: "下一页" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("禁用的上一页点击不触发回调", () => {
    const onPageChange = vi.fn();
    const { getByRole } = render(<Pagination page={1} total={10} onPageChange={onPageChange} />);
    fireEvent.click(getByRole("button", { name: "上一页" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("省略号是 aria-hidden 装饰位，不是按钮", () => {
    const { container } = render(<Pagination page={5} total={20} onPageChange={() => {}} />);
    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    // 至少有省略号字符的 aria-hidden（page=5/total=20 两侧都省略）
    const ellipsis = [...hidden].filter((el) => el.textContent === "…");
    expect(ellipsis.length).toBe(2);
    ellipsis.forEach((el) => expect(el.tagName).not.toBe("BUTTON"));
  });

  it("showFirstLast：渲染首/末页按钮，边界 disabled，点击跳 1/total", () => {
    const onPageChange = vi.fn();
    const { getByRole } = render(
      <Pagination page={5} total={20} showFirstLast onPageChange={onPageChange} />,
    );
    const first = getByRole("button", { name: "跳到首页" }) as HTMLButtonElement;
    const last = getByRole("button", { name: "跳到末页" }) as HTMLButtonElement;
    expect(first.disabled).toBe(false);
    fireEvent.click(first);
    fireEvent.click(last);
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 20);
  });

  it("不传 showFirstLast 时无首/末页按钮", () => {
    const { queryByRole } = render(<Pagination page={5} total={20} onPageChange={() => {}} />);
    expect(queryByRole("button", { name: "跳到首页" })).toBeNull();
  });

  it("disabled 整体禁用：所有按钮 disabled，点击不触发", () => {
    const onPageChange = vi.fn();
    const { getByRole } = render(
      <Pagination page={3} total={10} disabled onPageChange={onPageChange} />,
    );
    expect((getByRole("button", { name: "第 3 页" }) as HTMLButtonElement).disabled).toBe(true);
    expect((getByRole("button", { name: "下一页" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(getByRole("button", { name: "第 4 页" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("siblingCount 透传影响渲染页码数（更宽 → 更多页码按钮）", () => {
    const { getAllByRole, rerender } = render(
      <Pagination page={10} total={20} siblingCount={1} onPageChange={() => {}} />,
    );
    const count1 = getAllByRole("button").length;
    rerender(<Pagination page={10} total={20} siblingCount={3} onPageChange={() => {}} />);
    const count3 = getAllByRole("button").length;
    expect(count3).toBeGreaterThan(count1);
  });

  it("透传 className 与自定义 aria-label 到根 nav", () => {
    const { container } = render(
      <Pagination page={1} total={5} onPageChange={() => {}} className="my-pg" aria-label="翻页" />,
    );
    const nav = container.querySelector("nav")!;
    expect(nav.classList.contains("my-pg")).toBe(true);
    expect(nav.getAttribute("aria-label")).toBe("翻页");
  });
});
