import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tree } from "./tree";
import type { TreeNode } from "./tree-core";

const NODES: TreeNode[] = [
  {
    key: "a",
    label: "甲",
    children: [
      { key: "a1", label: "甲一" },
      { key: "a2", label: "甲二" },
    ],
  },
  { key: "b", label: "乙" },
];

describe("Tree", () => {
  it("渲染 treeitem + aria-level", () => {
    render(<Tree nodes={NODES} defaultExpandedKeys={["a"]} aria-label="t" />);
    const items = screen.getAllByRole("treeitem");
    expect(items.length).toBe(4); // 甲 甲一 甲二 乙
    const jiaYi = screen.getByText("甲一").closest('[role="treeitem"]')!;
    expect(jiaYi.getAttribute("aria-level")).toBe("2");
  });

  it("枝出 aria-expanded，点击切展开（grid-rows 收起：子在 DOM 但容器塌缩）", () => {
    render(<Tree nodes={NODES} aria-label="t" />);
    const jia = screen.getByText("甲").closest('[role="treeitem"]')!;
    expect(jia.getAttribute("aria-expanded")).toBe("false");
    // grid-rows 策略：子始终挂载（便于高度过渡测量），收起时外层容器 grid-rows-[0fr]
    const grid = screen.getByText("甲一").closest('[role="group"]')!.parentElement!.parentElement!;
    expect(grid.className).toContain("grid-rows-[0fr]");
    fireEvent.click(jia);
    expect(jia.getAttribute("aria-expanded")).toBe("true");
    expect(grid.className).toContain("grid-rows-[1fr]");
  });

  it("roving tabindex：仅 active 行 0", () => {
    render(<Tree nodes={NODES} defaultExpandedKeys={["a"]} aria-label="t" />);
    const items = screen.getAllByRole("treeitem");
    const zero = items.filter((el) => el.getAttribute("tabindex") === "0");
    expect(zero.length).toBe(1);
  });

  it("→ 展开枝，← 收起枝（键盘）", () => {
    render(<Tree nodes={NODES} aria-label="t" />);
    const tree = screen.getByRole("tree");
    const jia = screen.getByText("甲").closest('[role="treeitem"]')!;
    fireEvent.focus(jia);
    fireEvent.keyDown(tree, { key: "ArrowRight" });
    expect(jia.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(tree, { key: "ArrowLeft" });
    expect(jia.getAttribute("aria-expanded")).toBe("false");
  });

  it("单选 onSelect", () => {
    const onSelect = vi.fn();
    render(<Tree nodes={NODES} onSelect={onSelect} aria-label="t" />);
    fireEvent.click(screen.getByText("乙").closest('[role="treeitem"]')!);
    expect(onSelect).toHaveBeenCalledWith(["b"], expect.objectContaining({ key: "b" }));
  });

  it("checkable：点父级联子 + 父变 checked", () => {
    const onCheck = vi.fn();
    render(<Tree nodes={NODES} checkable defaultExpandedKeys={["a"]} onCheck={onCheck} aria-label="t" />);
    // 第一个 checkbox = 甲
    const boxes = screen.getAllByRole("checkbox");
    fireEvent.click(boxes[0]);
    expect(onCheck).toHaveBeenCalled();
    const info = onCheck.mock.calls.at(-1)![0];
    expect(info.checkedKeys.sort()).toEqual(["a", "a1", "a2"]);
  });

  it("checkable：点一个子 → 父 indeterminate（aria-checked mixed）", () => {
    render(<Tree nodes={NODES} checkable defaultExpandedKeys={["a"]} aria-label="t" />);
    const boxes = screen.getAllByRole("checkbox");
    // boxes: [甲, 甲一, 甲二, 乙]
    fireEvent.click(boxes[1]); // 甲一
    expect(boxes[0].getAttribute("aria-checked")).toBe("mixed");
  });
});
