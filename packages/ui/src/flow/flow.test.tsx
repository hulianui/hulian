import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Flow, FlowEdgeDeleteButton } from "./flow";
import type { FlowEdge, FlowHandleSpec, FlowNode } from "./flow.types";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

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
    expect(inHandle?.className).toContain("bg-muted-foreground");
  });

  it("enUS localizes conditional delete and auto-layout actions", () => {
    const { getByLabelText } = render(
      <ConfigProvider locale={enUS}>
        <Flow<D>
          {...base}
          selectedId="a"
          onNodeDelete={() => {}}
          onEdgesDelete={() => {}}
          onNodesChange={() => {}}
        />
      </ConfigProvider>,
    );
    expect(getByLabelText("Delete node")).toBeTruthy();
    expect(getByLabelText("Auto layout")).toBeTruthy();
  });

  it("enUS localizes the selected-edge delete action", () => {
    const { getByLabelText } = render(
      <ConfigProvider locale={enUS}>
        <svg>
          <FlowEdgeDeleteButton onDelete={() => {}} />
        </svg>
      </ConfigProvider>,
    );
    expect(getByLabelText("Delete edge", { selector: "button" })).toBeTruthy();
  });

  it("不传 label 时不产生连线标签，连线层仍是 aria-hidden", () => {
    const { container } = render(<Flow<D> {...base} />);
    expect(container.querySelector("[data-flow-edge-label]")).toBeNull();
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("空白 label 与不传一样", () => {
    const { container } = render(
      <Flow<D> {...base} edges={[{ id: "e1", source: "a", target: "b", label: "   " }]} />,
    );
    expect(container.querySelector("[data-flow-edge-label]")).toBeNull();
  });

  it("label 的可访问名称在 aria-hidden 的连线 SVG 之外", () => {
    const { container, getByRole } = render(
      <Flow<D> {...base} edges={[{ id: "e1", source: "a", target: "b", label: "同步到归档" }]} />,
    );
    const label = getByRole("group", { name: "同步到归档" });
    expect(label.getAttribute("data-flow-edge-label")).toBe("e1");
    expect(label.closest("svg")).toBeNull();
    expect(label.closest('[aria-hidden="true"]')).toBeNull();
    expect(label.className).toContain("pointer-events-none");
    expect(container.querySelector("svg")?.querySelector("[data-flow-edge-label]")).toBeNull();
  });

  it("长 label 的可访问名称是全文，未标注的邻边不产生标签", () => {
    const text = "把原始事件规范成可检索的归档记录，并保留来源与时间";
    const nodes3: FlowNode<D>[] = [
      ...nodes,
      { id: "c", position: { x: 300, y: 160 }, data: { label: "丙" } },
    ];
    const handles = (n: FlowNode<D>): FlowHandleSpec[] =>
      n.id === "a" ? [{ id: "out", type: "source" }] : [{ id: "in", type: "target" }];
    const { getByRole, queryByRole, container } = render(
      <Flow<D>
        {...base}
        nodes={nodes3}
        getHandles={handles}
        edges={[
          { id: "long", source: "a", target: "b", label: text },
          { id: "bare", source: "a", target: "c" },
        ]}
      />,
    );
    expect(getByRole("group", { name: text }).textContent).toBe(text);
    expect(queryByRole("group", { name: "bare" })).toBeNull();
    expect(container.querySelectorAll("[data-flow-edge-label]").length).toBe(1);
  });

  it("keeps an explicit handle title exact while localizing only its fallback aria label", () => {
    const explicitHandles = (node: FlowNode<D>): FlowHandleSpec[] =>
      node.id === "a"
        ? [{ id: "out", type: "source", label: "用户出口" }]
        : [{ id: "in", type: "target" }];
    const { container } = render(
      <ConfigProvider locale={enUS}>
        <Flow<D> {...base} edges={[]} getHandles={explicitHandles} />
      </ConfigProvider>,
    );
    const source = container.querySelector('[data-flow-handle="out"]');
    const target = container.querySelector('[data-flow-handle="in"]');
    expect(source?.getAttribute("title")).toBe("用户出口");
    expect(source?.getAttribute("aria-label")).toBe("用户出口");
    expect(target?.hasAttribute("title")).toBe(false);
    expect(target?.getAttribute("aria-label")).toBe("Input");
  });
});
