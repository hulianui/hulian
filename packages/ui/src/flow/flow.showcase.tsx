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
  neutral: "before:bg-muted-foreground",
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
              <div className="mt-0.5 text-xs text-muted-foreground">{n.data.subtitle}</div>
            </div>
          </div>
        )}
      />
    </div>
  );
}

// 官网 360 视口的正文列约 328px，示例预览还有 p-8，画布只剩约 260px。
// 右缘停在 248，桩留在画布里。短边分成三行，不共用一个出口，避免中线标签贴到旁边的曲线上。
const labelNodes: FlowNode<NodeData>[] = [
  { id: "route", position: { x: 8, y: 48 }, width: 80, data: { title: "分流", subtitle: "三条出口", tone: "violet", io: ["out"] } },
  { id: "queue", position: { x: 168, y: 48 }, width: 80, data: { title: "队列", subtitle: "待处理", tone: "amber", io: ["in"] } },
  { id: "watch", position: { x: 8, y: 176 }, width: 80, data: { title: "异常", subtitle: "待处理", tone: "amber", io: ["out"] } },
  { id: "alert", position: { x: 168, y: 176 }, width: 80, data: { title: "告警", subtitle: "异常", tone: "amber", io: ["in"] } },
  { id: "record", position: { x: 8, y: 304 }, width: 80, data: { title: "审计", subtitle: "留痕", tone: "neutral", io: ["out"] } },
  { id: "audit", position: { x: 168, y: 304 }, width: 80, data: { title: "留痕", subtitle: "待处理", tone: "neutral", io: ["in"] } },
  { id: "ingest", position: { x: 8, y: 500 }, width: 80, data: { title: "采集", subtitle: "原始事件", tone: "brand", io: ["out"] } },
  { id: "archive", position: { x: 168, y: 500 }, width: 80, data: { title: "归档", subtitle: "可检索", tone: "neutral", io: ["in"] } },
];

const labelEdges: FlowEdge[] = [
  { id: "long", source: "ingest", target: "archive", label: "把原始事件规范成可检索的归档记录，并保留来源与时间" },
  { id: "queue", source: "route", target: "queue", label: "入队" },
  { id: "alert", source: "watch", target: "alert", label: "告警" },
  { id: "audit", source: "record", target: "audit", label: "留痕" },
];

function FlowLabelDemo() {
  const [nodes, setNodes] = useState(labelNodes);
  const [edges, setEdges] = useState(labelEdges);
  const [selected, setSelected] = useState<string | null>(null);
  const nextEdgeId = useRef(0);

  return (
    <div className="h-[680px] w-full overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-border">
      <Flow<NodeData>
        nodes={nodes}
        edges={edges}
        getHandles={getHandles}
        controls={false}
        selectedId={selected}
        onSelectNode={setSelected}
        onNodesChange={setNodes}
        onConnect={(c) =>
          setEdges((prev) => {
            if (prev.some((e) => e.source === c.source && e.target === c.target)) return prev;
            nextEdgeId.current += 1;
            return [...prev, { id: `label-edge-${nextEdgeId.current}`, ...c }];
          })
        }
        onEdgesDelete={(ids) => setEdges((prev) => prev.filter((e) => !ids.includes(e.id)))}
        onNodeDelete={(id) => {
          setNodes((prev) => prev.filter((n) => n.id !== id));
          setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
          setSelected(null);
        }}
        renderNode={(n) => (
          <div className={`relative overflow-hidden rounded-[calc(var(--radius)+0.25rem)] before:absolute before:inset-y-0 before:left-0 before:w-1 ${TONE[n.data.tone]}`}>
            <div className="px-2.5 py-2">
              <div className="text-[13px] font-semibold text-foreground">{n.data.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{n.data.subtitle}</div>
            </div>
          </div>
        )}
      />
    </div>
  );
}

const coverageNodes: FlowNode<NodeData>[] = [
  { id: "hub", position: { x: 8, y: 96 }, width: 88, data: { title: "汇出", subtitle: "一共出", tone: "violet", io: ["out"] } },
  { id: "up", position: { x: 156, y: 8 }, width: 88, data: { title: "上支", subtitle: "扇出", tone: "amber", io: ["in"] } },
  { id: "mid", position: { x: 156, y: 112 }, width: 88, data: { title: "中支", subtitle: "扇出", tone: "amber", io: ["in"] } },
  { id: "down", position: { x: 156, y: 216 }, width: 88, data: { title: "下支", subtitle: "扇出", tone: "amber", io: ["in"] } },
  { id: "west", position: { x: 8, y: 340 }, width: 64, data: { title: "西", subtitle: "交叉", tone: "brand", io: ["out"] } },
  { id: "east", position: { x: 184, y: 480 }, width: 64, data: { title: "东", subtitle: "交叉", tone: "neutral", io: ["in"] } },
  { id: "south", position: { x: 8, y: 480 }, width: 64, data: { title: "南", subtitle: "交叉", tone: "brand", io: ["out"] } },
  { id: "north", position: { x: 184, y: 340 }, width: 64, data: { title: "北", subtitle: "交叉", tone: "neutral", io: ["in"] } },
  { id: "nearA", position: { x: 8, y: 560 }, width: 88, data: { title: "近上", subtitle: "相邻", tone: "neutral", io: ["out"] } },
  { id: "nearB", position: { x: 156, y: 560 }, width: 88, data: { title: "近上的", subtitle: "相邻", tone: "neutral", io: ["in"] } },
  { id: "nearC", position: { x: 8, y: 640 }, width: 88, data: { title: "近下", subtitle: "相邻", tone: "neutral", io: ["out"] } },
  { id: "nearD", position: { x: 156, y: 648 }, width: 88, data: { title: "近下的", subtitle: "相邻", tone: "neutral", io: ["in"] } },
  { id: "ingest", position: { x: 8, y: 820 }, width: 88, data: { title: "采集", subtitle: "原始事件", tone: "brand", io: ["out"] } },
  { id: "archive", position: { x: 156, y: 820 }, width: 88, data: { title: "归档", subtitle: "可检索", tone: "neutral", io: ["in"] } },
];

const coverageLabeled: FlowEdge[] = [
  { id: "fan-up", source: "hub", target: "up", label: "上送" },
  { id: "fan-mid", source: "hub", target: "mid", label: "直行" },
  { id: "fan-down", source: "hub", target: "down", label: "下送" },
  { id: "cross-ab", source: "west", target: "east", label: "斜下" },
  { id: "cross-cd", source: "south", target: "north", label: "斜上" },
  { id: "near-1", source: "nearA", target: "nearB", label: "贴上" },
  { id: "near-2", source: "nearC", target: "nearD", label: "贴下" },
  { id: "long", source: "ingest", target: "archive", label: "把原始事件规范成可检索的归档记录，并保留来源与时间" },
];

function coverageEdges(mode: "on" | "off" | "blank"): FlowEdge[] {
  if (mode === "off") return coverageLabeled.map(({ label: _label, ...edge }) => edge);
  if (mode === "blank") return coverageLabeled.map((edge) => ({ ...edge, label: "   " }));
  return coverageLabeled;
}

function CoverageCanvas({ mode }: { mode: "on" | "off" | "blank" }) {
  const [items, setItems] = useState(coverageNodes);
  const [edges, setEdges] = useState(() => coverageEdges(mode));
  const title = mode === "on" ? "同数据 · 有文案" : mode === "off" ? "同数据 · 无 label" : "同数据 · 空白 label";
  return (
    <section data-coverage-mode={mode} className="w-full">
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      <div className="h-[960px] w-full overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-border">
        <Flow<NodeData>
          nodes={items}
          edges={edges}
          getHandles={getHandles}
          controls={false}
          onNodesChange={setItems}
          onEdgesDelete={(ids) => setEdges((prev) => prev.filter((edge) => !ids.includes(edge.id)))}
          renderNode={(item) => (
            <div className={`relative overflow-hidden rounded-[calc(var(--radius)+0.25rem)] before:absolute before:inset-y-0 before:left-0 before:w-1 ${TONE[item.data.tone]}`}>
              <div className="px-2.5 py-2 text-[13px] font-semibold text-foreground">{item.data.title}</div>
            </div>
          )}
        />
      </div>
    </section>
  );
}

function FlowCoverageDemo() {
  return (
    <div className="w-full basis-full space-y-6">
      <CoverageCanvas mode="on" />
      <CoverageCanvas mode="off" />
      <CoverageCanvas mode="blank" />
    </div>
  );
}

export const flowShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础节点画布",
      description:
        "受控 nodes/edges；getHandles 声明每个节点的连接桩（左 target 入 / 右 source 出）。拖节点改位置、从输出桩拖到输入桩连线、滚轮平移、Ctrl+滚轮缩放。",
      code: `const [nodes, setNodes] = useState(initialNodes);
const [edges, setEdges] = useState(initialEdges);

<Flow
  nodes={nodes}
  edges={edges}
  getHandles={(n) => [
    ...(n.data.io.includes("in") ? [{ id: "in", type: "target" as const }] : []),
    ...(n.data.io.includes("out") ? [{ id: "out", type: "source" as const }] : []),
  ]}
  onNodesChange={setNodes}
  onConnect={(c) => setEdges((e) => [...e, { id: uid(), ...c }])}
  renderNode={(n) => <NodeCard data={n.data} />}
/>`,
      render: () => <FlowDemo />,
    },
    {
      title: "连线标签",
      description:
        "FlowEdge.label 可选。长文案在文档列宽里换行，短标签各自落在自己的边上。不写 label 的连线保持原样。名字挂在 aria-hidden 连线层之外，读屏能读到；键盘逐条选中连线不在这一步。交叉边上的标签仍可能贴到邻边，这一步不做通用避碰。",
      code: `<Flow
  nodes={nodes}
  edges={[
    { id: "e1", source: "ingest", target: "archive", label: "Normalize raw events into a searchable archive" },
    { id: "e2", source: "router", target: "queue", label: "Enqueue" },
    { id: "e3", source: "router", target: "alert" },
  ]}
  getHandles={getHandles}
  renderNode={(n) => <NodeCard data={n.data} />}
/>`,
      render: () => <FlowLabelDemo />,
    },
    {
      title: "对照、扇出与交叉",
      description:
        "同一份节点和连线排三遍：不写 label、只写空白、写上文案。有文案的那份是共享源扇出、两条交叉曲线、两条相邻近线，再加一条长文案。交叉处的短标签仍可能贴到邻边，这一步不保证把它们分开。",
      code: `<Flow
  nodes={nodes}
  edges={labeled}
  getHandles={getHandles}
  renderNode={(n) => <NodeCard data={n.data} />}
/>
<Flow nodes={nodes} edges={unlabeled} getHandles={getHandles} renderNode={(n) => <NodeCard data={n.data} />} />
<Flow nodes={nodes} edges={blankLabels} getHandles={getHandles} renderNode={(n) => <NodeCard data={n.data} />} />`,
      render: () => <FlowCoverageDemo />,
    },
    {
      title: "选中与删除",
      description:
        "selectedId / onSelectNode 受控单选：点节点选中，点空白取消。选中后点 × 或按 Delete 删除节点（连带删除其连线）。",
      code: `<Flow
  nodes={nodes}
  edges={edges}
  getHandles={getHandles}
  selectedId={selected}
  onSelectNode={setSelected}
  onNodeDelete={(id) => {
    setNodes((p) => p.filter((n) => n.id !== id));
    setEdges((p) => p.filter((e) => e.source !== id && e.target !== id));
    setSelected(null);
  }}
  onEdgesDelete={(ids) => setEdges((p) => p.filter((e) => !ids.includes(e.id)))}
  renderNode={(n) => <NodeCard data={n.data} />}
/>`,
      render: () => <FlowDemo />,
    },
    {
      title: "运行中（连线流光）",
      description:
        "isEdgeAnimated 返回 true 的连线走流光动画，常用于标记正在执行的链路。",
      code: `<Flow
  nodes={nodes}
  edges={edges}
  getHandles={getHandles}
  isEdgeAnimated={() => true}
  renderNode={(n) => <NodeCard data={n.data} />}
/>`,
      render: () => <FlowDemo animated />,
    },
    {
      title: "隐藏缩放控制条",
      description: "controls={false} 关闭右下角缩放 / 适配工具条，适合纯展示场景。",
      code: `<Flow
  nodes={nodes}
  edges={edges}
  getHandles={getHandles}
  controls={false}
  renderNode={(n) => <NodeCard data={n.data} />}
/>`,
      render: () => <FlowDemo controls={false} />,
    },
  ],
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
