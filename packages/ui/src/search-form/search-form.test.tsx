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

// a14：此前只有 input / select / date / date-range 四种，数值与日期时间这类常见查询条件表达不了
describe("SearchForm 控件类型", () => {
  const submit = (onSearch: ReturnType<typeof vi.fn>) => {
    fireEvent.click(screen.getByText("查询"));
    return onSearch.mock.calls.at(-1)![0] as Record<string, unknown>;
  };

  it("number：渲染数字输入并透传 min/max/step", () => {
    const fields: SearchField[] = [
      { name: "age", label: "年龄", type: "number", min: 0, max: 120, step: 5 },
    ];
    const { container } = render(<SearchForm fields={fields} onSearch={() => {}} />);
    const input = container.querySelector('input[type="number"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.min).toBe("0");
    expect(input.max).toBe("120");
    expect(input.step).toBe("5");
  });

  it("number-range：两个数字格子，值是二元组", () => {
    const onSearch = vi.fn();
    const fields: SearchField[] = [{ name: "price", label: "价格", type: "number-range" }];
    const { container } = render(<SearchForm fields={fields} onSearch={onSearch} />);
    const inputs = container.querySelectorAll('input[type="number"]');
    expect(inputs).toHaveLength(2);
    fireEvent.change(inputs[0], { target: { value: "10" } });
    fireEvent.change(inputs[1], { target: { value: "99" } });
    expect(submit(onSearch).price).toEqual(["10", "99"]);
  });

  it("datetime / datetime-range：走原生 datetime-local", () => {
    const fields: SearchField[] = [
      { name: "at", label: "时刻", type: "datetime" },
      { name: "span", label: "区间", type: "datetime-range" },
    ];
    const { container } = render(<SearchForm fields={fields} columns={1} collapsible={false} onSearch={() => {}} />);
    expect(container.querySelectorAll('input[type="datetime-local"]')).toHaveLength(3);
  });

  it("multi-select：初值是空数组而非空串", () => {
    const onSearch = vi.fn();
    const fields: SearchField[] = [
      {
        name: "tags",
        label: "标签",
        type: "multi-select",
        options: [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ],
      },
    ];
    render(<SearchForm fields={fields} onSearch={onSearch} />);
    expect(submit(onSearch).tags).toEqual([]);
  });

  it("remote-select multiple：初值是空数组；单选是空串", () => {
    const onSearch = vi.fn();
    const fetcher = vi.fn(async () => ({ options: [], total: 0 }));
    const fields: SearchField[] = [
      { name: "shopMulti", label: "门店", type: "remote-select", fetcher, multiple: true },
      { name: "shopOne", label: "门店", type: "remote-select", fetcher },
    ];
    render(<SearchForm fields={fields} columns={1} collapsible={false} onSearch={onSearch} />);
    const values = submit(onSearch);
    expect(values.shopMulti).toEqual([]);
    expect(values.shopOne).toBe("");
  });

  it("重置把区间/多值字段各自还原成对应的空形状", () => {
    const onReset = vi.fn();
    const fields: SearchField[] = [
      { name: "price", label: "价格", type: "number-range" },
      { name: "tags", label: "标签", type: "multi-select", options: [{ value: "a", label: "A" }] },
      { name: "kw", label: "关键词" },
    ];
    const { container } = render(<SearchForm fields={fields} columns={1} collapsible={false} onSearch={() => {}} onReset={onReset} />);
    fireEvent.change(container.querySelectorAll('input[type="number"]')[0], { target: { value: "10" } });
    fireEvent.click(screen.getByText("重置"));
    expect(onReset).toHaveBeenCalledWith({ price: ["", ""], tags: [], kw: "" });
  });

  it("defaultValue 优先于类型推出的空形状", () => {
    const onSearch = vi.fn();
    const fields: SearchField[] = [
      { name: "price", label: "价格", type: "number-range", defaultValue: ["1", "9"] },
    ];
    render(<SearchForm fields={fields} onSearch={onSearch} />);
    expect(submit(onSearch).price).toEqual(["1", "9"]);
  });

  // #177：cascader / region 此前不在词表里，组织架构与省市区筛选只能退到 render 逃生舱。
  describe("层级字段（#177）", () => {
    const orgNodes = [
      {
        key: "south",
        label: "华南大区",
        children: [{ key: "gz", label: "广州", children: [{ key: "gz-01", label: "天河店" }] }],
      },
    ];

    it("cascader：渲染级联触发器，选完把路径数组喂回 values", async () => {
      const onChange = vi.fn();
      render(
        <SearchForm
          fields={[{ name: "store", label: "门店", type: "cascader", options: orgNodes }]}
          onChange={onChange}
          onSearch={() => {}}
        />,
      );
      fireEvent.click(screen.getByText("请选择"));
      fireEvent.click(await screen.findByText("华南大区"));
      fireEvent.click(await screen.findByText("广州"));
      fireEvent.click(await screen.findByText("天河店"));
      expect(onChange.mock.calls.at(-1)?.[0]).toMatchObject({ store: ["south", "gz", "gz-01"] });
    });

    it("cascader 的空值形状是 []（重置回到空路径而不是空串）", () => {
      const onReset = vi.fn();
      render(
        <SearchForm
          fields={[{ name: "store", label: "门店", type: "cascader", options: orgNodes }]}
          onReset={onReset}
          onSearch={() => {}}
        />,
      );
      fireEvent.click(screen.getByText("重置"));
      expect(onReset.mock.calls.at(-1)?.[0]).toEqual({ store: [] });
    });

    it("region：按需加载到达后渲染内置省市区选择器", async () => {
      render(
        <SearchForm
          fields={[{ name: "area", label: "地区", type: "region" }]}
          onSearch={() => {}}
        />,
      );
      // lazy chunk 到达前先出占位，到达后才有触发器
      expect(await screen.findByText("请选择")).toBeTruthy();
    });

    it("region 的空值形状同样是 []", () => {
      const onReset = vi.fn();
      render(
        <SearchForm fields={[{ name: "area", label: "地区", type: "region" }]} onReset={onReset} onSearch={() => {}} />,
      );
      fireEvent.click(screen.getByText("重置"));
      expect(onReset.mock.calls.at(-1)?.[0]).toEqual({ area: [] });
    });
  });
});
