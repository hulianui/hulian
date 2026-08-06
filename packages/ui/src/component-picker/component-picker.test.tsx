import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ComponentPicker } from "./component-picker";
import type { ComponentPickerItem } from "./component-picker.types";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

const ITEMS: ComponentPickerItem[] = [
  {
    slug: "button",
    name: "Button",
    description: "按钮 · 7 变体 + 加载态",
    category: "forms",
    group: "basic",
    props: [
      { name: "variant", type: '"solid" | "ghost"', default: '"solid"', description: "视觉变体" },
      { name: "loading", type: "boolean", default: "false" },
    ],
    examples: [{ title: "基础用法", lang: "tsx", code: "<Button>确定</Button>" }],
  },
  {
    slug: "input",
    name: "Input",
    description: "输入框 · 前后缀插槽",
    category: "forms",
    group: "basic",
    props: [{ name: "invalid", type: "boolean" }],
  },
  {
    slug: "table",
    name: "Table",
    description: "表格 · TanStack 引擎",
    category: "data-display",
    group: "collection",
  },
];

const options = () => screen.getAllByRole("option");
const searchBox = () => screen.getByRole("combobox");

describe("ComponentPicker", () => {
  it("稳定父更新时跳过组件浏览器子树", async () => {
    await expectMemoSkipsSubtree(() => <ComponentPicker items={ITEMS} />);
  });

  it("默认渲染全部条目", () => {
    render(<ComponentPicker items={ITEMS} />);
    expect(options()).toHaveLength(3);
    expect(screen.getByText("Button")).toBeTruthy();
  });

  it("搜索按打分器过滤且命中项排前", () => {
    render(<ComponentPicker items={ITEMS} />);
    fireEvent.change(searchBox(), { target: { value: "btn" } });
    const names = options().map((el) => within(el).getByText(/^(Button|Input|Table)$/).textContent);
    expect(names[0]).toBe("Button");
    expect(names).not.toContain("Table");
  });

  it("无匹配时渲染空态", () => {
    render(<ComponentPicker items={ITEMS} />);
    fireEvent.change(searchBox(), { target: { value: "zzzzz" } });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("没有匹配的组件")).toBeTruthy();
  });

  it("items 为空时渲染目录空态（区别于无结果）", () => {
    render(<ComponentPicker items={[]} />);
    expect(screen.getByText("组件目录为空")).toBeTruthy();
  });

  it("分类树筛选收窄结果", () => {
    render(<ComponentPicker items={ITEMS} defaultFilter={{ category: "cat:data-display" }} />);
    expect(options()).toHaveLength(1);
    expect(screen.getByText("Table")).toBeTruthy();
  });

  it("点分类树节点回传 category（受控出口）", () => {
    const onFilterChange = vi.fn();
    render(<ComponentPicker items={ITEMS} onFilterChange={onFilterChange} />);
    fireEvent.click(within(screen.getByRole("tree")).getByText("data-display"));
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ category: "cat:data-display" }));
  });

  it("showTree=false 不渲染分类树", () => {
    render(<ComponentPicker items={ITEMS} showTree={false} />);
    expect(screen.queryByRole("tree")).toBeNull();
  });

  it("点结果项只高亮，不触发 onSelect", () => {
    const onSelect = vi.fn();
    render(<ComponentPicker items={ITEMS} onSelect={onSelect} />);
    fireEvent.click(options()[1]!);
    expect(options()[1]!.getAttribute("aria-selected")).toBe("true");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("双击结果项回吐 slug + 由文档默认值派生的 props", () => {
    const onSelect = vi.fn();
    render(<ComponentPicker items={ITEMS} onSelect={onSelect} />);
    fireEvent.doubleClick(options()[0]!);
    expect(onSelect).toHaveBeenCalledWith("button", { variant: "solid", loading: false });
  });

  it("详情面板的按钮同样回吐", () => {
    const onSelect = vi.fn();
    render(<ComponentPicker items={ITEMS} onSelect={onSelect} defaultActiveSlug="table" />);
    fireEvent.click(screen.getByRole("button", { name: "选用该组件" }));
    expect(onSelect).toHaveBeenCalledWith("table", {});
  });

  it("键盘：上下键移动高亮、Enter 选中", () => {
    const onSelect = vi.fn();
    render(<ComponentPicker items={ITEMS} onSelect={onSelect} />);
    const box = searchBox();
    fireEvent.keyDown(box, { key: "ArrowDown" });
    expect(options()[0]!.getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(box, { key: "ArrowDown" });
    expect(options()[1]!.getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(box, { key: "ArrowUp" });
    expect(options()[0]!.getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(box, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("button", expect.any(Object));
  });

  it("键盘：高亮项写进 aria-activedescendant", () => {
    render(<ComponentPicker items={ITEMS} />);
    fireEvent.keyDown(searchBox(), { key: "ArrowDown" });
    const id = searchBox().getAttribute("aria-activedescendant");
    expect(id).toBeTruthy();
    expect(options()[0]!.getAttribute("id")).toBe(id);
  });

  it("键盘：上下键循环、不越界", () => {
    render(<ComponentPicker items={ITEMS} />);
    fireEvent.keyDown(searchBox(), { key: "ArrowUp" }); // 未高亮时向上从末条开始
    expect(options()[2]!.getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(searchBox(), { key: "ArrowDown" });
    expect(options()[0]!.getAttribute("aria-selected")).toBe("true");
  });

  it("键盘：Esc 先清搜索词，再清高亮", () => {
    render(<ComponentPicker items={ITEMS} defaultActiveSlug="button" />);
    const box = searchBox() as HTMLInputElement;
    fireEvent.change(box, { target: { value: "btn" } });
    expect(box.value).toBe("btn");
    fireEvent.keyDown(box, { key: "Escape" });
    expect(box.value).toBe("");
    expect(screen.getAllByRole("option").some((o) => o.getAttribute("aria-selected") === "true")).toBe(true);
    fireEvent.keyDown(box, { key: "Escape" });
    expect(screen.getAllByRole("option").every((o) => o.getAttribute("aria-selected") === "false")).toBe(true);
  });

  it("详情面板：showProps 渲染属性表", () => {
    render(<ComponentPicker items={ITEMS} defaultActiveSlug="button" showExamples={false} />);
    expect(screen.getByText("variant")).toBeTruthy();
    expect(screen.getByText('"solid" | "ghost"')).toBeTruthy();
  });

  it("详情面板：showProps=false 不渲染属性表", () => {
    render(
      <ComponentPicker items={ITEMS} defaultActiveSlug="button" showProps={false} showExamples={false} />,
    );
    expect(screen.queryByText("variant")).toBeNull();
  });

  it("详情面板：showExamples 渲染示例代码", () => {
    // CodeBlock 会把代码切成多个高亮 span，所以断言整块文本而非单个节点
    const { container } = render(
      <ComponentPicker items={ITEMS} defaultActiveSlug="button" showProps={false} />,
    );
    expect(container.textContent).toContain("<Button>确定</Button>");
  });

  it("详情面板：三个开关全关则整块不渲染", () => {
    render(
      <ComponentPicker
        items={ITEMS}
        defaultActiveSlug="button"
        showProps={false}
        showExamples={false}
        showPreview={false}
      />,
    );
    expect(screen.queryByRole("region", { name: "组件详情" })).toBeNull();
  });

  it("预览：未传 renderPreview 显示占位而非空白", () => {
    render(
      <ComponentPicker
        items={ITEMS}
        defaultActiveSlug="button"
        showPreview
        showProps={false}
        showExamples={false}
      />,
    );
    expect(screen.getByText("未接入预览渲染")).toBeTruthy();
  });

  it("预览：renderPreview 注入的节点被渲染", () => {
    render(
      <ComponentPicker
        items={ITEMS}
        defaultActiveSlug="button"
        showPreview
        showProps={false}
        showExamples={false}
        renderPreview={(item) => <em>{`预览 ${item.name}`}</em>}
      />,
    );
    expect(screen.getByText("预览 Button")).toBeTruthy();
  });

  it("受控 filter 不接 onFilterChange 时搜索框纹丝不动", () => {
    render(<ComponentPicker items={ITEMS} filter={{ search: "btn" }} />);
    const box = searchBox() as HTMLInputElement;
    fireEvent.change(box, { target: { value: "table" } });
    expect(box.value).toBe("btn");
  });

  it("maxResults 截断结果", () => {
    render(<ComponentPicker items={ITEMS} maxResults={2} />);
    expect(options()).toHaveLength(2);
  });

  it("labels 可逐条覆盖", () => {
    render(<ComponentPicker items={[]} labels={{ emptyCatalogTitle: "空空如也" }} />);
    expect(screen.getByText("空空如也")).toBeTruthy();
  });
});
