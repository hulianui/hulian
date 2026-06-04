"use client";
import { useRef, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Flow } from "./flow";
import type { FlowApi, FlowConnection, FlowEdge, FlowHandleSpec, FlowNode } from "./flow.types";

interface NodeData {
  title: string;
  subtitle: string;
  tone: "brand" | "violet" | "amber" | "neutral";
  io: ("in" | "out")[];
}

const TONE: Record<NodeData["tone"], string> = {
  brand: "before:bg-primary",
  violet: "before:bg-chart-4",
  amber: "before:bg-chart-3",
  neutral: "before:bg-muted",
};

const initialNodes: FlowNode<NodeData>[] = [
  { id: "prompt", position: { x: 0, y: 40 }, data: { title: "提示词", subtitle: "赛博朋克城市夜景", tone: "brand", io: ["out"] } },
  { id: "model", position: { x: 300, y: 0 }, data: { title: "生图模型", subtitle: "SDXL · 30 步", tone: "violet", io: ["in", "out"] } },
  { id: "upscale", position: { x: 600, y: 0 }, data: { title: "高清放大", subtitle: "×2 · 面部修复", tone: "amber", io: ["in", "out"] } },
  { id: "output", position: { x: 900, y: 40 }, data: { title: "输出", subtitle: "1 张图片", tone: "neutral", io: ["in"] } },
];

const initialEdges: FlowEdge[] = [
  { id: "e1", source: "prompt", target: "model" },
  { id: "e2", source: "model", target: "upscale" },
  { id: "e3", source: "upscale", target: "output" },
];

function getHandles(node: FlowNode<NodeData>): FlowHandleSpec[] {
  const hs: FlowHandleSpec[] = [];
  if (node.data.io.includes("in")) hs.push({ id: "in", type: "target", label: "输入" });
  if (node.data.io.includes("out")) hs.push({ id: "out", type: "source", label: "输出" });
  return hs;
}

function FlowDemo({ controls = true, animated = false }: { controls?: boolean; animated?: boolean }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selected, setSelected] = useState<string | null>("model");
  const api = useRef<FlowApi | null>(null);

  const onConnect = (c: FlowConnection) => {
    setEdges((prev) => {
      if (prev.some((e) => e.source === c.source && e.target === c.target)) return prev;
      return [...prev, { id: `e${Date.now()}`, source: c.source, target: c.target, sourceHandle: c.sourceHandle, targetHandle: c.targetHandle }];
    });
  };

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-border">
      <Flow<NodeData>
        nodes={nodes}
        edges={edges}
        getHandles={getHandles}
        apiRef={api}
        controls={controls}
        selectedId={selected}
        onSelectNode={setSelected}
        onNodesChange={setNodes}
        onConnect={onConnect}
        onEdgesDelete={(ids) => setEdges((prev) => prev.filter((e) => !ids.includes(e.id)))}
        onNodeDelete={(id) => {
          setNodes((prev) => prev.filter((n) => n.id !== id));
          setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
          setSelected(null);
        }}
        isEdgeAnimated={animated ? () => true : undefined}
        renderNode={(n) => (
          <div className={`relative overflow-hidden rounded-[calc(var(--radius)+0.25rem)] before:absolute before:inset-y-0 before:left-0 before:w-1 ${TONE[n.data.tone]}`}>
            <div className="px-3.5 py-2.5">
              <div className="text-[13px] font-semibold text-foreground">{n.data.title}</div>
              <div className="mt-0.5 text-xs text-muted">{n.data.subtitle}</div>
            </div>
          </div>
        )}
      />
    </div>
  );
}

export const flowShowcase: ShowcaseSpec = {
  controls: [
    { prop: "controls", type: "boolean", defaultValue: true, label: "缩放控制条" },
    { prop: "animated", type: "boolean", defaultValue: false, label: "连线流光" },
  ],
  states: [
    {
      name: "AI 生图流水线（拖节点 / 拖出桩连线 / 滚轮平移 · Ctrl+滚轮缩放）",
      render: () => <FlowDemo />,
    },
    {
      name: "运行中（连线流光）",
      render: () => <FlowDemo animated />,
    },
  ],
  renderWithProps: (p) => <FlowDemo controls={p.controls as boolean} animated={p.animated as boolean} />,
  toCode: () => `<Flow
  nodes={nodes}
  edges={edges}
  getHandles={(n) => [{ id: "in", type: "target" }, { id: "out", type: "source" }]}
  onNodesChange={setNodes}
  onConnect={(c) => setEdges((e) => [...e, { id: uid(), ...c }])}
  renderNode={(n) => <NodeCard data={n.data} />}
/>`,
};
