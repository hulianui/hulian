import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import { Command } from "./command";
import type { CommandGroupData } from "./command.types";

// jsdom 未实现 scrollIntoView（高亮项滚动进视口会调用）→ 桩成 noop 防抛。
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

const groups: CommandGroupData[] = [
  {
    heading: "常用",
    items: [
      { value: "new", label: "新建文件", keywords: "create" },
      { value: "search", label: "搜索文档" },
    ],
  },
  {
    heading: "设置",
    items: [
      { value: "settings", label: "偏好设置" },
      { value: "calc", label: "计算器", disabled: true },
    ],
  },
];

const noop = () => {};

describe("Command", () => {
  it("open=false 不渲染列表浮层", () => {
    render(<Command open={false} onOpenChange={noop} groups={groups} />);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("open=true 渲染 combobox + listbox + 全部项 + 分组标题", () => {
    render(<Command open onOpenChange={noop} groups={groups} />);
    expect(screen.getByRole("combobox")).toBeTruthy();
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(screen.getAllByRole("option")).toHaveLength(4);
    expect(screen.getByText("常用")).toBeTruthy();
    expect(screen.getByText("设置")).toBeTruthy();
  });

  it("输入实时过滤（默认子串匹配 label/keywords）", () => {
    render(<Command open onOpenChange={noop} groups={groups} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "搜索" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByText("搜索文档")).toBeTruthy();
    expect(screen.queryByText("新建文件")).toBeNull();
    // 整组被过滤空 → 标题消失
    expect(screen.queryByText("设置")).toBeNull();
  });

  it("keywords 命中（label 不含关键词时）", () => {
    render(<Command open onOpenChange={noop} groups={groups} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "create" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByText("新建文件")).toBeTruthy();
  });

  it("自定义 filter 生效", () => {
    render(
      <Command
        open
        onOpenChange={noop}
        groups={groups}
        filter={(it) => it.value === "settings"}
      />,
    );
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByText("偏好设置")).toBeTruthy();
  });

  it("无匹配 → 空态文案", () => {
    render(<Command open onOpenChange={noop} groups={groups} emptyMessage="啥也没有" />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzzzz" } });
    expect(screen.queryByRole("option")).toBeNull();
    expect(screen.getByText("啥也没有")).toBeTruthy();
  });

  it("初始高亮首个可用项（aria-selected）", () => {
    render(<Command open onOpenChange={noop} groups={groups} />);
    const opts = screen.getAllByRole("option");
    expect(opts[0].getAttribute("aria-selected")).toBe("true");
  });

  it("ArrowDown 下移高亮、跨组、跳过禁用项", () => {
    render(<Command open onOpenChange={noop} groups={groups} />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // 0→1
    let opts = screen.getAllByRole("option");
    expect(opts[1].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // 1→2(跨组到「设置」)
    opts = screen.getAllByRole("option");
    expect(opts[2].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // 2→跳过禁用(3)→回绕到 0
    opts = screen.getAllByRole("option");
    expect(opts[0].getAttribute("aria-selected")).toBe("true");
  });

  it("End/Home 跳到末/首个可用项", () => {
    render(<Command open onOpenChange={noop} groups={groups} />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "End" }); // 末个可用 = index2(index3 禁用)
    let opts = screen.getAllByRole("option");
    expect(opts[2].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(input, { key: "Home" });
    opts = screen.getAllByRole("option");
    expect(opts[0].getAttribute("aria-selected")).toBe("true");
  });

  it("Enter 执行高亮项：onSelect + onSelectItem + 默认关闭", () => {
    const onSelect = vi.fn();
    const onSelectItem = vi.fn();
    const onOpenChange = vi.fn();
    const g: CommandGroupData[] = [{ items: [{ value: "new", label: "新建", onSelect }] }];
    render(<Command open onOpenChange={onOpenChange} groups={g} onSelectItem={onSelectItem} />);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("new");
    expect(onSelectItem).toHaveBeenCalledWith("new");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closeOnSelect=false 执行后不关闭", () => {
    const onOpenChange = vi.fn();
    const g: CommandGroupData[] = [{ items: [{ value: "new", label: "新建" }] }];
    render(<Command open onOpenChange={onOpenChange} groups={g} closeOnSelect={false} />);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("点击项执行 onSelectItem", () => {
    const onSelectItem = vi.fn();
    render(<Command open onOpenChange={noop} groups={groups} onSelectItem={onSelectItem} />);
    fireEvent.click(screen.getByText("搜索文档"));
    expect(onSelectItem).toHaveBeenCalledWith("search");
  });

  it("禁用项 aria-disabled + 点击不执行", () => {
    const onSelectItem = vi.fn();
    render(<Command open onOpenChange={noop} groups={groups} onSelectItem={onSelectItem} />);
    const calc = screen.getByText("计算器").closest('[role="option"]')!;
    expect(calc.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(calc);
    expect(onSelectItem).not.toHaveBeenCalled();
  });
});
