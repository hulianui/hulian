import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ConfigProvider, enUS } from "../config";
import { Listbox } from "./listbox";
import type { ListboxItemData } from "./listbox.types";

const items: ListboxItemData[] = [
  { key: "a", label: "Apple" },
  { key: "b", label: "Banana", disabled: true },
  { key: "c", label: "Cherry" },
];

describe("Listbox", () => {
  it("渲染 role=listbox + 每项 role=option", () => {
    const { getByRole, getAllByRole } = render(<Listbox items={items} />);
    expect(getByRole("listbox")).toBeTruthy();
    expect(getAllByRole("option")).toHaveLength(3);
  });

  it("single 模式点击选中并回调单键", () => {
    const onChange = vi.fn();
    const { getByText } = render(<Listbox items={items} onSelectionChange={onChange} />);
    fireEvent.click(getByText("Cherry"));
    expect(onChange).toHaveBeenLastCalledWith(["c"]);
  });

  it("single 模式再点另一项替换选中", () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <Listbox items={items} defaultSelectedKeys={["a"]} onSelectionChange={onChange} />,
    );
    fireEvent.click(getByText("Cherry"));
    expect(onChange).toHaveBeenLastCalledWith(["c"]);
  });

  it("multiple 模式点击切换累加", () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <Listbox
        items={items}
        selectionMode="multiple"
        defaultSelectedKeys={["a"]}
        onSelectionChange={onChange}
      />,
    );
    fireEvent.click(getByText("Cherry"));
    expect(onChange).toHaveBeenLastCalledWith(["a", "c"]);
  });

  it("multiple 模式再点已选项取消", () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <Listbox
        items={items}
        selectionMode="multiple"
        defaultSelectedKeys={["a", "c"]}
        onSelectionChange={onChange}
      />,
    );
    fireEvent.click(getByText("Apple"));
    expect(onChange).toHaveBeenLastCalledWith(["c"]);
  });

  it("禁用项不可点、不触发选中 + aria-disabled", () => {
    const onChange = vi.fn();
    const { getByText } = render(<Listbox items={items} onSelectionChange={onChange} />);
    const banana = getByText("Banana").closest('[role="option"]')!;
    expect(banana.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(banana);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("none 模式不持有选中态但触发 onAction", () => {
    const onAction = vi.fn();
    const onChange = vi.fn();
    const { getByText } = render(
      <Listbox
        items={items}
        selectionMode="none"
        onAction={onAction}
        onSelectionChange={onChange}
      />,
    );
    fireEvent.click(getByText("Cherry"));
    expect(onAction).toHaveBeenCalledWith("c");
    expect(onChange).not.toHaveBeenCalled();
    expect(
      getByText("Cherry").closest('[role="option"]')!.getAttribute("aria-selected"),
    ).toBeNull();
  });

  it("方向键跳过禁用项漫游", () => {
    const { getAllByRole } = render(<Listbox items={items} />);
    const list = getAllByRole("option")[0].parentElement!;
    fireEvent.keyDown(list, { key: "ArrowDown" });
    // a(0) → 跳过 b(禁用) → c(2)
    expect(getAllByRole("option")[2].getAttribute("tabindex")).toBe("0");
  });

  it("Enter 激活当前项", () => {
    const onChange = vi.fn();
    const { getAllByRole } = render(<Listbox items={items} onSelectionChange={onChange} />);
    const list = getAllByRole("option")[0].parentElement!;
    fireEvent.keyDown(list, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith(["a"]);
  });

  it("typeahead 单字符跳到匹配项", () => {
    const { getAllByRole } = render(<Listbox items={items} />);
    const list = getAllByRole("option")[0].parentElement!;
    fireEvent.keyDown(list, { key: "c" });
    expect(getAllByRole("option")[2].getAttribute("tabindex")).toBe("0");
  });

  it("ConfigProvider locale=enUS localizes the default accessible name", () => {
    const { getByRole } = render(
      <ConfigProvider locale={enUS}>
        <Listbox items={items} />
      </ConfigProvider>,
    );
    expect(getByRole("listbox", { name: "Options" })).toBeTruthy();
  });
});
// 见 hulianui/hulian#107：解构默认只认 undefined，null 须显式回落。
describe("Listbox · null 回落", () => {
  it("defaultSelectedKeys/disabledKeys 传 null 不抛错", () => {
    const { getAllByRole } = render(
      <Listbox items={items} defaultSelectedKeys={null as never} disabledKeys={null as never} />,
    );
    expect(getAllByRole("option")).toHaveLength(3);
  });
});
