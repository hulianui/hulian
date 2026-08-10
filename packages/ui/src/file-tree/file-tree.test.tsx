import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, within } from "@testing-library/react";
import { FileTree, fileStatusMeta } from "./file-tree";
import type { FileNode } from "./file-tree.types";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

const nodes: FileNode[] = [
  {
    name: "src",
    type: "folder",
    defaultExpanded: true,
    children: [
      { name: "index.ts", type: "file", status: "modified" },
      { name: "new.ts", type: "file", status: "added" },
    ],
  },
  {
    name: "lib",
    type: "folder",
    children: [{ name: "old.ts", type: "file", status: "deleted" }],
  },
];

describe("statusMeta", () => {
  it("状态 → 字母 + 色类", () => {
    expect(fileStatusMeta("added")).toEqual({ letter: "A", toneClass: "text-success" });
    expect(fileStatusMeta("modified").letter).toBe("M");
    expect(fileStatusMeta("deleted").toneClass).toBe("text-danger");
    expect(fileStatusMeta("renamed").letter).toBe("R");
    expect(fileStatusMeta("untracked").toneClass).toBe("text-muted-foreground");
  });
});

describe("FileTree", () => {
  // 树是递归的：memo 挡在根上，整棵 Row 子树一起跳过。
  // 护栏套整棵树，分母覆盖全部节点，只有真正整树跳过才过。
  it("稳定父更新时跳过整棵文件树", async () => {
    await expectMemoSkipsSubtree(() => <FileTree nodes={nodes} selectedPath="src/index.ts" />);
  });

  it("默认展开的文件夹渲染子节点", () => {
    const { getByText } = render(<FileTree nodes={nodes} />);
    expect(getByText("index.ts")).toBeTruthy();
    expect(getByText("new.ts")).toBeTruthy();
  });
  it("折叠的文件夹不渲染子节点，点击后展开", () => {
    const { getByText, queryByText } = render(<FileTree nodes={nodes} />);
    expect(queryByText("old.ts")).toBeNull();
    fireEvent.click(getByText("lib"));
    expect(getByText("old.ts")).toBeTruthy();
  });
  it("状态角标渲染字母", () => {
    const { getByText } = render(<FileTree nodes={nodes} />);
    expect(getByText("M")).toBeTruthy(); // index.ts modified
    expect(getByText("A")).toBeTruthy(); // new.ts added
  });
  it("onSelect 回传节点与 path", () => {
    const onSelect = vi.fn();
    const { getByText } = render(<FileTree nodes={nodes} onSelect={onSelect} />);
    fireEvent.click(getByText("index.ts"));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: "index.ts" }),
      "src/index.ts",
    );
  });
  it("selectedPath 高亮当前行（精确 token，排除 hover: 前缀假阳性）", () => {
    const sel = render(<FileTree nodes={nodes} selectedPath="src/index.ts" />);
    const selTokens = within(sel.container)
      .getByText("index.ts")
      .closest("button")!
      .className.split(/\s+/);
    expect(selTokens).toContain("bg-surface-hover");
    // 未选中行不应带无前缀的高亮 token（只有 hover: 前缀）
    const unsel = render(<FileTree nodes={nodes} />);
    const unselTokens = within(unsel.container)
      .getByText("index.ts")
      .closest("button")!
      .className.split(/\s+/);
    expect(unselTokens).not.toContain("bg-surface-hover");
  });
});

describe("FileTree 受控 / 搜索 / 右键", () => {
  it("searchable 过滤出命中并自动展开祖先", () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <FileTree nodes={nodes} searchable />,
    );
    fireEvent.change(getByPlaceholderText("搜索文件"), { target: { value: "old" } });
    expect(getByText("old.ts")).toBeTruthy(); // lib 自动展开
    expect(queryByText("index.ts")).toBeNull(); // 未命中隐藏
  });
  it("onContextMenu 右键回传 node+path", () => {
    const onCtx = vi.fn();
    const { getByText } = render(<FileTree nodes={nodes} onContextMenu={onCtx} />);
    fireEvent.contextMenu(getByText("index.ts"));
    expect(onCtx).toHaveBeenCalledWith(
      expect.objectContaining({ name: "index.ts" }),
      "src/index.ts",
      expect.anything(),
    );
  });
  it("受控 expandedPaths 控制展开", () => {
    const { queryByText, rerender } = render(<FileTree nodes={nodes} expandedPaths={[]} />);
    expect(queryByText("index.ts")).toBeNull();
    rerender(<FileTree nodes={nodes} expandedPaths={["src"]} />);
    expect(queryByText("index.ts")).toBeTruthy();
  });
});
