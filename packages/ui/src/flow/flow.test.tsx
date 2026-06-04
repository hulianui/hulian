import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Flow } from "./flow";
import type { FlowEdge, FlowHandleSpec, FlowNode } from "./flow.types";

afterEach(cleanup);

interface D {
  label: string;
}
const nodes: FlowNode<D>[] = [
  { id: "a", position: { x: 0, y: 0 }, data: { label: "甲" } },
  { id: "b", position: { x: 300, y: 0 }, data: { label: "乙" } },
];
const edges: FlowEdge[] = [{ id: "e1", source: "a", target: "b" }];

const getHandles = (n: FlowNode<D>): FlowHandleSpec[] =>
  n.id === "a"
    ? [{ id: "out", type: "source" }]
    : [{ id: "in", type: "target" }];

const base = {
  nodes,
  edges,
  getHandles,
  renderNode: (n: FlowNode<D>) => <div>{n.data.label}</div>,
};

describe("Flow 渲染", () => {
  it("渲染每个节点本体", () => {
    const { container } = render(<Flow<D> {...base} />);
    expect(container.querySelectorAll("[data-flow-node]").length).toBe(2);
  });

  it("按 getHandles 渲染连接桩（source/target）", () => {
    const { container } = render(<Flow<D> {...base} />);
    expect(container.querySelector('[data-flow-handle][data-handle-type="source"]')).not.toBeNull();
    expect(container.querySelector('[data-flow-handle][data-handle-type="target"]')).not.toBeNull();
  });

  it("controls=false 不渲染缩放控制条", () => {
    const { container } = render(<Flow<D> {...base} controls={false} />);
    expect(container.querySelector('[aria-label="放大"]')).toBeNull();
  });

  it("选中节点渲染删除钮", () => {
    const { container } = render(<Flow<D> {...base} selectedId="a" onNodeDelete={() => {}} />);
    expect(container.querySelector('[aria-label="删除节点"]')).not.toBeNull();
  });

  it("已被连线接入的入桩标记 connected 并染 primary（缺省 handle 取首个）", () => {
    const { container } = render(<Flow<D> {...base} />);
    const inHandle = container.querySelector('[data-flow-handle="in"]');
    expect(inHandle).not.toBeNull();
    expect(inHandle?.hasAttribute("data-connected")).toBe(true);
    expect(inHandle?.className).toContain("bg-primary");
  });

  it("无连线时入桩保持灰（muted·无 connected 标记）", () => {
    const { container } = render(<Flow<D> {...base} edges={[]} />);
    const inHandle = container.querySelector('[data-flow-handle="in"]');
    expect(inHandle?.hasAttribute("data-connected")).toBe(false);
    expect(inHandle?.className).toContain("bg-muted");
  });
});
