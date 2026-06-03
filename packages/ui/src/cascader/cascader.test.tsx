import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Cascader } from "./cascader";
import type { TreeNode } from "../tree/tree-core";

const NODES: TreeNode[] = [
  {
    key: "zj",
    label: "浙江",
    children: [{ key: "hz", label: "杭州", children: [{ key: "xh", label: "西湖区" }] }],
  },
  { key: "js", label: "江苏", children: [{ key: "nj", label: "南京" }] },
];

describe("Cascader", () => {
  it("点 Trigger 开浮层显示首列", () => {
    render(<Cascader nodes={NODES} placeholder="选择" />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("浙江")).toBeTruthy();
    expect(screen.getByText("江苏")).toBeTruthy();
  });

  it("逐级下钻 + 叶子提交路径", () => {
    const onChange = vi.fn();
    render(<Cascader nodes={NODES} onChange={onChange} placeholder="选择" />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("浙江"));
    expect(screen.getByText("杭州")).toBeTruthy(); // 第二列出现
    fireEvent.click(screen.getByText("杭州"));
    fireEvent.click(screen.getByText("西湖区"));
    expect(onChange).toHaveBeenCalledWith(["zj", "hz", "xh"], expect.any(Array));
  });
});
