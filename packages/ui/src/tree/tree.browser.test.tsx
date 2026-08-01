import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Tree } from "./tree";
import type { TreeNode } from "./tree-core";

afterEach(cleanup);

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

const rowOf = (label: string) =>
  screen.getByText(label).closest('[role="treeitem"]')! as HTMLElement;
const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

async function dispatchDrag(
  target: Element,
  type: "dragstart" | "dragover" | "drop",
  dataTransfer: DataTransfer,
  clientY: number,
) {
  await act(async () => {
    target.dispatchEvent(
      new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer, clientY }),
    );
    await nextFrame();
  });
}

async function dragAt(from: HTMLElement, to: HTMLElement, ratio: number) {
  const rect = to.getBoundingClientRect();
  const dataTransfer = new DataTransfer();
  await dispatchDrag(from, "dragstart", dataTransfer, from.getBoundingClientRect().top);
  await dispatchDrag(to, "dragover", dataTransfer, rect.top + rect.height * ratio);
  await dispatchDrag(to, "drop", dataTransfer, rect.top + rect.height * ratio);
}

function renderTree(onDrop: (event: unknown) => void, allowDropInside?: (node: TreeNode) => boolean) {
  render(
    <Tree
      nodes={NODES}
      draggable
      onDrop={onDrop}
      allowDropInside={allowDropInside}
      defaultExpandedKeys={["a"]}
      aria-label="t"
    />,
  );
}

describe("Tree 原生拖放（真实浏览器）", () => {
  it("树行有真实纵向尺寸", () => {
    renderTree(() => {});
    const rect = rowOf("乙").getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  });

  it("拖到目标行中部 → inside", async () => {
    const onDrop = vi.fn();
    renderTree(onDrop);
    await dragAt(rowOf("甲一"), rowOf("乙"), 0.5);
    expect(onDrop).toHaveBeenCalledWith({ dragKey: "a1", dropKey: "b", position: "inside" });
  });

  it("拖到目标行顶部 → before", async () => {
    const onDrop = vi.fn();
    renderTree(onDrop);
    await dragAt(rowOf("乙"), rowOf("甲一"), 0.05);
    expect(onDrop).toHaveBeenCalledWith({ dragKey: "b", dropKey: "a1", position: "before" });
  });

  it("丢进自己的子树被拦下", async () => {
    const onDrop = vi.fn();
    renderTree(onDrop);
    await dragAt(rowOf("甲"), rowOf("甲一"), 0.5);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("禁用 inside 时，中部落点退化成 after", async () => {
    const onDrop = vi.fn();
    renderTree(onDrop, () => false);
    await dragAt(rowOf("甲一"), rowOf("乙"), 0.5);
    expect(onDrop).toHaveBeenCalledWith({ dragKey: "a1", dropKey: "b", position: "after" });
  });
});
