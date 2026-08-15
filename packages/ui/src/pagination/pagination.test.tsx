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

// total（总页数）与后端普遍给的总条数反向，此前每个消费方都在调用处补一次 Math.ceil
describe("totalItems / pageSize（总条数口径）", () => {
  it("totalItems + pageSize 算出页数（向上取整）", () => {
    const { getByLabelText, queryByLabelText } = render(
      <Pagination page={1} totalItems={21} pageSize={10} onPageChange={() => {}} />,
    );
    expect(getByLabelText("第 3 页")).toBeTruthy();
    expect(queryByLabelText("第 4 页")).toBeNull();
  });

  it("pageSize 缺省为 10", () => {
    const { getByLabelText } = render(
      <Pagination page={1} totalItems={15} onPageChange={() => {}} />,
    );
    expect(getByLabelText("第 2 页")).toBeTruthy();
  });

  it("整除时不多出一页", () => {
    const { queryByLabelText } = render(
      <Pagination page={1} totalItems={20} pageSize={10} onPageChange={() => {}} />,
    );
    expect(queryByLabelText("第 3 页")).toBeNull();
  });

  it("0 条也至少 1 页，且末页按钮禁用", () => {
    const { getByLabelText } = render(
      <Pagination page={1} totalItems={0} onPageChange={() => {}} />,
    );
    expect(getByLabelText("第 1 页")).toBeTruthy();
    expect(getByLabelText("下一页").hasAttribute("disabled")).toBe(true);
  });

  it("两者同传时以 total（页数）为准，并在 dev 下告警", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getByLabelText, queryByLabelText } = render(
      <Pagination page={1} total={2} totalItems={999} onPageChange={() => {}} />,
    );
    expect(getByLabelText("第 2 页")).toBeTruthy();
    expect(queryByLabelText("第 3 页")).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("showTotal / showQuickJumper", () => {
  it("showTotal 默认文案「共 N 条」", () => {
    const { getByText } = render(
      <Pagination page={1} totalItems={128} onPageChange={() => {}} showTotal />,
    );
    expect(getByText("共 128 条")).toBeTruthy();
  });

  it("showTotal 传函数拿到总条数与当前页区间", () => {
    const { getByText } = render(
      <Pagination
        page={2}
        totalItems={25}
        pageSize={10}
        onPageChange={() => {}}
        showTotal={(t, [from, to]) => `${from}-${to} / ${t}`}
      />,
    );
    expect(getByText("11-20 / 25")).toBeTruthy();
  });

  it("只给了 total（页数）时算不出条数 → showTotal 静默不渲染", () => {
    const { container } = render(
      <Pagination page={1} total={5} onPageChange={() => {}} showTotal />,
    );
    expect(container.textContent).not.toContain("共");
  });

  it("快捷跳转：回车提交并夹紧到合法范围", () => {
    const onPageChange = vi.fn();
    const { getByLabelText } = render(
      <Pagination page={1} totalItems={30} onPageChange={onPageChange} showQuickJumper />,
    );
    const input = getByLabelText("跳至第几页") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "99" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(input.value).toBe("");
  });

  it("快捷跳转只收数字，敲键期间不跳页", () => {
    const onPageChange = vi.fn();
    const { getByLabelText } = render(
      <Pagination page={1} totalItems={30} onPageChange={onPageChange} showQuickJumper />,
    );
    const input = getByLabelText("跳至第几页") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2a" } });
    expect(input.value).toBe("2");
    expect(onPageChange).not.toHaveBeenCalled();
  });
});

// #271 每页条数切换档。Base UI Select 的 Trigger 渲染 role="combobox" 的 button。
// 这里只验「渲不渲染 / 渲成什么样」—— 切档之后页码怎么走在 pagination.page-size.test.ts 里验：
// Base UI 的选项浮层在 jsdom 下打不开（实测点 Trigger 后 aria-expanded 恒 false、option 数为 0），
// 从这里点选项验回调等于验了个空。
describe("Pagination · 每页条数切换（pageSizeOptions）", () => {
  it("不传 pageSizeOptions 时不渲染切换器（向后兼容）", () => {
    const { queryByRole } = render(
      <Pagination page={1} totalItems={100} onPageChange={() => {}} />,
    );
    expect(queryByRole("combobox")).toBeNull();
  });

  it("只给档不给回调 → 不渲染（切了没人收，不如不给）", () => {
    const { queryByRole } = render(
      <Pagination page={1} totalItems={100} onPageChange={() => {}} pageSizeOptions={[20, 50]} />,
    );
    expect(queryByRole("combobox")).toBeNull();
  });

  it("档 + 回调齐全 → 渲染切换器，显示当前页长，无障碍名是「每页条数」而非当前值", () => {
    const { getByRole } = render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={20}
        onPageChange={() => {}}
        pageSizeOptions={[20, 50, 100]}
        onPageSizeChange={() => {}}
      />,
    );
    const trigger = getByRole("combobox");
    expect(trigger.textContent).toContain("20 条/页");
    expect(trigger.getAttribute("aria-label")).toBe("每页条数");
  });
});
