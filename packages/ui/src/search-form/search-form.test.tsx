import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SearchForm } from "./search-form";
import type { SearchField } from "./search-form.types";

afterEach(cleanup);

const baseFields: SearchField[] = [
  { name: "keyword", label: "关键词", placeholder: "kw" },
  { name: "owner", label: "负责人", placeholder: "owner" },
];

describe("SearchForm", () => {
  it("渲染所有可见字段标签 + 查询/重置按钮", () => {
    render(<SearchForm fields={baseFields} onSearch={() => {}} />);
    expect(screen.getByText("关键词")).toBeTruthy();
    expect(screen.getByText("负责人")).toBeTruthy();
    expect(screen.getByText("查询")).toBeTruthy();
    expect(screen.getByText("重置")).toBeTruthy();
  });

  it("编辑 input 触发 onChange 带更新值（非受控）", () => {
    const onChange = vi.fn();
    const { container } = render(<SearchForm fields={baseFields} onChange={onChange} onSearch={() => {}} />);
    const input = container.querySelector('input[placeholder="kw"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "hello" } });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: "hello" });
  });

  it("点查询触发 onSearch 带当前 values", () => {
    const onSearch = vi.fn();
    const { container } = render(<SearchForm fields={baseFields} onSearch={onSearch} />);
    const input = container.querySelector('input[placeholder="kw"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.click(screen.getByText("查询"));
    expect(onSearch).toHaveBeenCalled();
    expect(onSearch.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: "abc" });
  });

  it("点重置触发 onReset 带 defaults", () => {
    const onReset = vi.fn();
    const { container } = render(<SearchForm fields={baseFields} onReset={onReset} onSearch={() => {}} />);
    const input = container.querySelector('input[placeholder="kw"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "xyz" } });
    fireEvent.click(screen.getByText("重置"));
    expect(onReset).toHaveBeenCalled();
    expect(onReset.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: "", owner: "" });
  });

  it("render 逃生舱被调用并渲染自定义控件", () => {
    const fields: SearchField[] = [
      {
        name: "custom",
        label: "自定义",
        render: (ctx) => (
          <input
            data-testid="custom"
            value={String(ctx.value ?? "")}
            onChange={(e) => ctx.onChange(e.target.value)}
          />
        ),
      },
    ];
    const { container } = render(<SearchForm fields={fields} onSearch={() => {}} />);
    expect(container.querySelector('[data-testid="custom"]')).toBeTruthy();
  });

  it("折叠默认只显示一行字段，展开后显示全部", () => {
    const many: SearchField[] = Array.from({ length: 5 }, (_, i) => ({
      name: `f${i}`,
      label: `字段${i}`,
      placeholder: `p${i}`,
    }));
    const { container } = render(<SearchForm fields={many} columns={3} onSearch={() => {}} />);
    // 折叠：columns-1 = 2 个 input
    expect(container.querySelectorAll("input").length).toBe(2);
    fireEvent.click(screen.getByText("展开"));
    expect(container.querySelectorAll("input").length).toBe(5);
    expect(screen.getByText("收起")).toBeTruthy();
  });

  it("select 字段渲染 combobox 触发器", () => {
    const fields: SearchField[] = [
      { name: "status", label: "状态", type: "select", placeholder: "全部", options: [{ value: "a", label: "A" }] },
    ];
    const { container } = render(<SearchForm fields={fields} onSearch={() => {}} />);
    expect(container.querySelector('[role="combobox"]')).toBeTruthy();
  });

  it("字段填不满一行时不渲染折叠按钮", () => {
    render(<SearchForm fields={baseFields} columns={3} onSearch={() => {}} />);
    expect(screen.queryByText("展开")).toBeNull();
    expect(screen.queryByText("收起")).toBeNull();
  });
});
