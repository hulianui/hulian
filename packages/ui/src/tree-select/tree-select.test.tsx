import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TreeSelect } from "./tree-select";
import type { TreeNode } from "../tree/tree-core";

const NODES: TreeNode[] = [
  { key: "a", label: "甲", children: [{ key: "a1", label: "甲一" }] },
  { key: "b", label: "乙" },
];

describe("TreeSelect", () => {
  it("点 Trigger 开浮层，显示 placeholder", () => {
    render(<TreeSelect nodes={NODES} placeholder="请选择" />);
    expect(screen.getByText("请选择")).toBeTruthy();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("tree")).toBeTruthy();
  });

  it("单选叶子 → onChange(key) + Trigger 显示 label", () => {
    const onChange = vi.fn();
    render(<TreeSelect nodes={NODES} onChange={onChange} placeholder="请选择" />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("乙").closest('[role="treeitem"]')!);
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("多选 → checkable 树，value 为数组", () => {
    const onChange = vi.fn();
    render(<TreeSelect nodes={NODES} multiple onChange={onChange} placeholder="请选择" />);
    fireEvent.click(screen.getByRole("button"));
    const boxes = screen.getAllByRole("checkbox");
    fireEvent.click(boxes.at(-1)!); // 乙
    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining(["b"]));
  });

  it("clearable 受控单选：点清除 → onChange('')，值回到未选态", () => {
    const onChange = vi.fn();
    render(<TreeSelect nodes={NODES} clearable value="b" onChange={onChange} placeholder="请选择" />);
    fireEvent.click(screen.getByRole("button", { name: "清除" }));
    // 未选态与非受控初值同形（空串），不能是 null/undefined
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("clearable 非受控单选：点清除 → 触发器回落 placeholder，清除钮自身消失", () => {
    render(<TreeSelect nodes={NODES} clearable defaultValue="b" placeholder="请选择" />);
    expect(screen.getByText("乙")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "清除" }));
    expect(screen.getByText("请选择")).toBeTruthy();
    // 无值 → 清除按钮不再进 DOM
    expect(screen.queryByRole("button", { name: "清除" })).toBeNull();
  });

  it("clearable 多选：点清除 → onChange([]) 一次清空全部勾选", () => {
    const onChange = vi.fn();
    render(
      <TreeSelect nodes={NODES} multiple clearable value={["a1", "b"]} onChange={onChange} placeholder="请选择" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "清除" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("disabled 时不出清除按钮（有值也不出）", () => {
    render(<TreeSelect nodes={NODES} clearable disabled defaultValue="b" placeholder="请选择" />);
    expect(screen.getByText("乙")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "清除" })).toBeNull();
  });

  it("多选受控传父级 key → chip 与 Tree 勾选态同源（展示叶 chip 而非父 chip）", () => {
    // 父级 "a" 有叶子 "a1"。外部塞父 key，Tree 内部会级联勾到叶；
    // chip 也应归一为叶（显示 "甲一"），不能停留在父级 chip（"甲"）造成显示/勾选脱节。
    render(<TreeSelect nodes={NODES} multiple value={["a"]} placeholder="请选择" />);
    // 触发器（关闭态）里渲染的是 chip：显示叶 label，不显示父 label
    expect(screen.getByText("甲一")).toBeTruthy();
    expect(screen.queryByText("甲")).toBeNull();
  });
});
