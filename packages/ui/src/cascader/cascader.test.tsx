import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Cascader } from "./cascader";
import { flattenLeafPaths, filterLeafPaths } from "./cascader.logic";
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

  it("expandTrigger=hover：叶子节点 hover 即点亮为激活项（无需点击）", () => {
    render(<Cascader nodes={NODES} expandTrigger="hover" placeholder="选择" />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.mouseEnter(screen.getByText("江苏")); // 展开第二列
    const leaf = screen.getByText("南京").closest("button")!; // 叶子
    expect(leaf.getAttribute("aria-selected")).toBe("false");
    fireEvent.mouseEnter(leaf);
    expect(leaf.getAttribute("aria-selected")).toBe("true");
  });

  it("showSearch：搜索命中叶子路径，点击提交全路径", () => {
    const onChange = vi.fn();
    render(<Cascader nodes={NODES} onChange={onChange} showSearch placeholder="选择" />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.change(screen.getByPlaceholderText("搜索…"), { target: { value: "西湖" } });
    const hit = screen.getByText("浙江 / 杭州 / 西湖区");
    fireEvent.click(hit);
    expect(onChange).toHaveBeenCalledWith(["zj", "hz", "xh"], expect.any(Array));
  });
});

describe("cascader.logic（纯逻辑）", () => {
  it("flattenLeafPaths 产出每条叶子的 key/label 全路径", () => {
    const paths = flattenLeafPaths(NODES);
    expect(paths).toEqual([
      { keys: ["zj", "hz", "xh"], labels: ["浙江", "杭州", "西湖区"] },
      { keys: ["js", "nj"], labels: ["江苏", "南京"] },
    ]);
  });
  it("filterLeafPaths 命中任一层 label 或整条路径，空 query 返回空", () => {
    const paths = flattenLeafPaths(NODES);
    expect(filterLeafPaths(paths, "西湖").map((p) => p.keys.join("/"))).toEqual(["zj/hz/xh"]);
    expect(filterLeafPaths(paths, "南京").map((p) => p.keys.join("/"))).toEqual(["js/nj"]);
    expect(filterLeafPaths(paths, "")).toEqual([]);
  });
});
// 见 hulianui/hulian#107：解构默认只认 undefined，null 须显式回落。
describe("Cascader · null 回落", () => {
  it("defaultValue 传 null 不抛错，按未选渲染", () => {
    render(<Cascader nodes={NODES} defaultValue={null as never} placeholder="选择" />);
    expect(screen.getByRole("button").textContent).toContain("选择");
  });
});
