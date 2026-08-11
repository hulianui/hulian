import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { useState } from "react";
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

  // ↓↓ #174：命令面板的核心路径是「打字 → 回车」，默认必须有高亮项。
  it("默认高亮首个可用项：打开后直接 Enter 即执行（不必先按方向键）", () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    const g: CommandGroupData[] = [
      { heading: "项目中的任务", items: [{ value: "t1", label: "TSK-3 第三个任务", onSelect }] },
    ];
    render(<Command open onOpenChange={onOpenChange} groups={g} />);
    const input = screen.getByRole("combobox");
    expect(screen.getAllByRole("option")[0].getAttribute("aria-selected")).toBe("true");
    expect(input.getAttribute("aria-activedescendant")).toBeTruthy();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("t1");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("打字过滤到只剩一条 → Enter 即选中", () => {
    const onSelectItem = vi.fn();
    render(<Command open onOpenChange={noop} groups={groups} onSelectItem={onSelectItem} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "搜索" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelectItem).toHaveBeenCalledWith("search");
  });

  it("首项禁用时默认高亮落到第二项", () => {
    const onSelectItem = vi.fn();
    const g: CommandGroupData[] = [
      {
        items: [
          { value: "off", label: "禁用项", disabled: true },
          { value: "on", label: "可用项" },
        ],
      },
    ];
    render(<Command open onOpenChange={noop} groups={g} onSelectItem={onSelectItem} />);
    const opts = screen.getAllByRole("option");
    expect(opts[0].getAttribute("aria-selected")).not.toBe("true");
    expect(opts[1].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(onSelectItem).toHaveBeenCalledWith("on");
  });

  it("groups 引用每次渲染都变时不丢高亮（按 value 找回，不按数组引用重置）", () => {
    function Parent() {
      const [tick, setTick] = useState(0);
      // 消费方没把 groups 用 useMemo 包稳的常见形态：每次渲染都是新数组。
      const g: CommandGroupData[] = [
        {
          items: [
            { value: "a", label: "第一项" },
            { value: "b", label: "第二项" },
          ],
        },
      ];
      return (
        <>
          <button onClick={() => setTick(tick + 1)}>重渲染 {tick}</button>
          <Command open onOpenChange={noop} groups={g} />
        </>
      );
    }
    render(<Parent />);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" }); // 默认在首项 → 移到第二项
    expect(screen.getAllByRole("option")[1].getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByText(/重渲染/));
    // 高亮仍在第二项：既没被抹掉，也没被拉回首项。
    expect(screen.getAllByRole("option")[1].getAttribute("aria-selected")).toBe("true");
  });

  it("autoHighlight={false} 保持旧行为：初始无高亮，Enter 空操作", () => {
    const onSelectItem = vi.fn();
    render(
      <Command
        open
        onOpenChange={noop}
        groups={groups}
        autoHighlight={false}
        onSelectItem={onSelectItem}
      />,
    );
    const opts = screen.getAllByRole("option");
    expect(opts.every((o) => o.getAttribute("aria-selected") !== "true")).toBe(true);
    const input = screen.getByRole("combobox");
    // 无 activedescendant
    expect(input.getAttribute("aria-activedescendant")).toBeNull();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelectItem).not.toHaveBeenCalled();
  });

  it("ArrowDown 从无高亮起步落首项、下移、跨组、跳过禁用项", () => {
    render(<Command open onOpenChange={noop} groups={groups} autoHighlight={false} />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // -1→0(无高亮→首项)
    let opts = screen.getAllByRole("option");
    expect(opts[0].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // 0→1
    opts = screen.getAllByRole("option");
    expect(opts[1].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // 1→2(跨组到「设置」)
    opts = screen.getAllByRole("option");
    expect(opts[2].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // 2→跳过禁用(3)→回绕到 0
    opts = screen.getAllByRole("option");
    expect(opts[0].getAttribute("aria-selected")).toBe("true");
  });

  it("ArrowUp 从无高亮起步落末个可用项", () => {
    render(<Command open onOpenChange={noop} groups={groups} autoHighlight={false} />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowUp" }); // -1→末个可用(index2，index3 禁用)
    const opts = screen.getAllByRole("option");
    expect(opts[2].getAttribute("aria-selected")).toBe("true");
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
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // 先点亮首项（无默认高亮）
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("new");
    expect(onSelectItem).toHaveBeenCalledWith("new");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closeOnSelect=false 执行后不关闭", () => {
    const onOpenChange = vi.fn();
    const g: CommandGroupData[] = [{ items: [{ value: "new", label: "新建" }] }];
    render(<Command open onOpenChange={onOpenChange} groups={g} closeOnSelect={false} />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // 先点亮首项
    fireEvent.keyDown(input, { key: "Enter" });
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

  it("onQueryChange 播出内部搜索词，且打开面板时播出清空", () => {
    const onQueryChange = vi.fn();
    const { rerender } = render(
      <Command open={false} onOpenChange={noop} groups={groups} onQueryChange={onQueryChange} />,
    );
    rerender(<Command open onOpenChange={noop} groups={groups} onQueryChange={onQueryChange} />);
    // 打开即清空 —— 消费方自管的 groups 不能停在上一次搜索词上。
    expect(onQueryChange).toHaveBeenCalledWith("");
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "搜索" } });
    expect(onQueryChange).toHaveBeenLastCalledWith("搜索");
  });

  // #171：页脚常驻在列表之外 —— 面板是模态的，模式切换这类控件没有别处可放。
  it("footer 渲染在列表之外，不随过滤结果消失", () => {
    render(
      <Command
        open
        onOpenChange={noop}
        groups={groups}
        footer={<button>关联 / 阻塞</button>}
      />,
    );
    const foot = screen.getByText("关联 / 阻塞");
    expect(foot).toBeTruthy();
    // 不在 listbox 内（故不参与列表滚动）
    expect(screen.getByRole("listbox").contains(foot)).toBe(false);
    // 过滤到空态时仍在
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzzzz" } });
    expect(screen.getByText("关联 / 阻塞")).toBeTruthy();
  });

  it("不传 footer 时不渲染页脚容器", () => {
    render(<Command open onOpenChange={noop} groups={groups} />);
    expect(document.querySelector(".border-t")).toBeNull();
  });

  it("filter 恒真时由消费方全权决定 groups（自排序路径不被内部过滤二次裁剪）", () => {
    render(
      <Command open onOpenChange={noop} groups={groups} filter={() => true} />,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "不可能匹配的词" } });
    expect(screen.getByText("搜索文档")).toBeTruthy();
  });
});
