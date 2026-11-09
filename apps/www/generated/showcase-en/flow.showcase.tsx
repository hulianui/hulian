"use client";
import { useRef, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Flow } from "../../../../packages/ui/src/flow/flow";
import type { FlowApi, FlowConnection, FlowEdge, FlowHandleSpec, FlowNode } from "../../../../packages/ui/src/flow/flow.types";
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
    { id: "prompt", position: { x: 0, y: 40 }, data: { title: "Prompt word", subtitle: "Cyberpunk city night scene", tone: "brand", io: ["out"] } },
    { id: "model", position: { x: 300, y: 0 }, data: { title: "Raw graph model", subtitle: "SDXL \u00B7 30 steps", tone: "violet", io: ["in", "out"] } },
    { id: "upscale", position: { x: 600, y: 0 }, data: { title: "HD zoom", subtitle: "\u00D72 \u00B7 Facial Restoration", tone: "amber", io: ["in", "out"] } },
    { id: "output", position: { x: 900, y: 40 }, data: { title: "Output", subtitle: "1 picture", tone: "neutral", io: ["in"] } },
];
const initialEdges: FlowEdge[] = [
    { id: "e1", source: "prompt", target: "model" },
    { id: "e2", source: "model", target: "upscale" },
    { id: "e3", source: "upscale", target: "output" },
];
function getHandles(node: FlowNode<NodeData>): FlowHandleSpec[] {
    const hs: FlowHandleSpec[] = [];
    if (node.data.io.includes("in"))
        hs.push({ id: "in", type: "target", label: "Enter" });
    if (node.data.io.includes("out"))
        hs.push({ id: "out", type: "source", label: "Output" });
    return hs;
}
function FlowDemo({ controls = true, animated = false }: {
    controls?: boolean;
    animated?: boolean;
}) {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [selected, setSelected] = useState<string | null>("model");
    const api = useRef<FlowApi | null>(null);
    const onConnect = (c: FlowConnection) => {
        setEdges((prev) => {
            if (prev.some((e) => e.source === c.source && e.target === c.target))
                return prev;
            return [...prev, { id: `e${Date.now()}`, source: c.source, target: c.target, sourceHandle: c.sourceHandle, targetHandle: c.targetHandle }];
        });
    };
    return (<div className="h-[420px] w-full overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-border">
      <Flow<NodeData> nodes={nodes} edges={edges} getHandles={getHandles} apiRef={api} controls={controls} selectedId={selected} onSelectNode={setSelected} onNodesChange={setNodes} onConnect={onConnect} onEdgesDelete={(ids) => setEdges((prev) => prev.filter((e) => !ids.includes(e.id)))} onNodeDelete={(id) => {
            setNodes((prev) => prev.filter((n) => n.id !== id));
            setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
            setSelected(null);
        }} isEdgeAnimated={animated ? () => true : undefined} renderNode={(n) => (<div className={`relative overflow-hidden rounded-[calc(var(--radius)+0.25rem)] before:absolute before:inset-y-0 before:left-0 before:w-1 ${TONE[n.data.tone]}`}>
            <div className="px-3.5 py-2.5">
              <div className="text-[13px] font-semibold text-foreground">{n.data.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{n.data.subtitle}</div>
            </div>
          </div>)}/>
    </div>);
}
const labelNodes: FlowNode<NodeData>[] = [
    { id: "route", position: { x: 8, y: 48 }, width: 80, data: { title: "Split", subtitle: "Three outputs", tone: "violet", io: ["out"] } },
    { id: "queue", position: { x: 168, y: 48 }, width: 80, data: { title: "Queue", subtitle: "Pending", tone: "amber", io: ["in"] } },
    { id: "watch", position: { x: 8, y: 176 }, width: 80, data: { title: "Exception", subtitle: "Pending", tone: "amber", io: ["out"] } },
    { id: "alert", position: { x: 168, y: 176 }, width: 80, data: { title: "Alarm", subtitle: "Exception", tone: "amber", io: ["in"] } },
    { id: "record", position: { x: 8, y: 304 }, width: 80, data: { title: "audit", subtitle: "Trace", tone: "neutral", io: ["out"] } },
    { id: "audit", position: { x: 168, y: 304 }, width: 80, data: { title: "Trace", subtitle: "Pending", tone: "neutral", io: ["in"] } },
    { id: "ingest", position: { x: 8, y: 500 }, width: 80, data: { title: "Collection", subtitle: "Raw events", tone: "brand", io: ["out"] } },
    { id: "archive", position: { x: 168, y: 500 }, width: 80, data: { title: "Archive", subtitle: "Searchable", tone: "neutral", io: ["in"] } },
];
const labelEdges: FlowEdge[] = [
    { id: "long", source: "ingest", target: "archive", label: "Normalize raw events into a searchable archive and keep the source and time" },
    { id: "queue", source: "route", target: "queue", label: "Enqueue" },
    { id: "alert", source: "watch", target: "alert", label: "Alarm" },
    { id: "audit", source: "record", target: "audit", label: "Trace" },
];
function FlowLabelDemo() {
    const [nodes, setNodes] = useState(labelNodes);
    const [edges, setEdges] = useState(labelEdges);
    const [selected, setSelected] = useState<string | null>(null);
    const nextEdgeId = useRef(0);
    return (<div className="h-[680px] w-full overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-border">
      <Flow<NodeData> nodes={nodes} edges={edges} getHandles={getHandles} controls={false} selectedId={selected} onSelectNode={setSelected} onNodesChange={setNodes} onConnect={(c) => setEdges((prev) => {
            if (prev.some((e) => e.source === c.source && e.target === c.target))
                return prev;
            nextEdgeId.current += 1;
            return [...prev, { id: `label-edge-${nextEdgeId.current}`, ...c }];
        })} onEdgesDelete={(ids) => setEdges((prev) => prev.filter((e) => !ids.includes(e.id)))} onNodeDelete={(id) => {
            setNodes((prev) => prev.filter((n) => n.id !== id));
            setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
            setSelected(null);
        }} renderNode={(n) => (<div className={`relative overflow-hidden rounded-[calc(var(--radius)+0.25rem)] before:absolute before:inset-y-0 before:left-0 before:w-1 ${TONE[n.data.tone]}`}>
            <div className="px-2.5 py-2">
              <div className="text-[13px] font-semibold text-foreground">{n.data.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{n.data.subtitle}</div>
            </div>
          </div>)}/>
    </div>);
}
const coverageNodes: FlowNode<NodeData>[] = [
    { id: "hub", position: { x: 8, y: 96 }, width: 88, data: { title: "Fan out", subtitle: "One source", tone: "violet", io: ["out"] } },
    { id: "up", position: { x: 156, y: 8 }, width: 88, data: { title: "Upper branch", subtitle: "Fan", tone: "amber", io: ["in"] } },
    { id: "mid", position: { x: 156, y: 112 }, width: 88, data: { title: "Middle branch", subtitle: "Fan", tone: "amber", io: ["in"] } },
    { id: "down", position: { x: 156, y: 216 }, width: 88, data: { title: "Lower branch", subtitle: "Fan", tone: "amber", io: ["in"] } },
    { id: "west", position: { x: 8, y: 340 }, width: 88, data: { title: "West", subtitle: "Cross", tone: "brand", io: ["out"] } },
    { id: "east", position: { x: 156, y: 448 }, width: 88, data: { title: "East", subtitle: "Cross", tone: "neutral", io: ["in"] } },
    { id: "south", position: { x: 8, y: 448 }, width: 88, data: { title: "South", subtitle: "Cross", tone: "brand", io: ["out"] } },
    { id: "north", position: { x: 156, y: 340 }, width: 88, data: { title: "North", subtitle: "Cross", tone: "neutral", io: ["in"] } },
    { id: "nearA", position: { x: 8, y: 560 }, width: 88, data: { title: "Near upper", subtitle: "Adjacent", tone: "neutral", io: ["out"] } },
    { id: "nearB", position: { x: 156, y: 560 }, width: 88, data: { title: "Near upper end", subtitle: "Adjacent", tone: "neutral", io: ["in"] } },
    { id: "nearC", position: { x: 8, y: 640 }, width: 88, data: { title: "Near lower", subtitle: "Adjacent", tone: "neutral", io: ["out"] } },
    { id: "nearD", position: { x: 156, y: 648 }, width: 88, data: { title: "Near lower end", subtitle: "Adjacent", tone: "neutral", io: ["in"] } },
    { id: "ingest", position: { x: 8, y: 820 }, width: 88, data: { title: "Collection", subtitle: "Raw events", tone: "brand", io: ["out"] } },
    { id: "archive", position: { x: 156, y: 820 }, width: 88, data: { title: "Archive", subtitle: "Searchable", tone: "neutral", io: ["in"] } },
];
const coverageLabeled: FlowEdge[] = [
    { id: "fan-up", source: "hub", target: "up", label: "Send up" },
    { id: "fan-mid", source: "hub", target: "mid", label: "Straight" },
    { id: "fan-down", source: "hub", target: "down", label: "Send down" },
    { id: "cross-ab", source: "west", target: "east", label: "Down diagonal" },
    { id: "cross-cd", source: "south", target: "north", label: "Up diagonal" },
    { id: "near-1", source: "nearA", target: "nearB", label: "Close upper" },
    { id: "near-2", source: "nearC", target: "nearD", label: "Close lower" },
    { id: "long", source: "ingest", target: "archive", label: "Normalize raw events into a searchable archive and keep the source and time" },
];
function coverageEdges(mode: "on" | "off" | "blank"): FlowEdge[] {
    if (mode === "off")
        return coverageLabeled.map(({ label: _label, ...edge }) => edge);
    if (mode === "blank")
        return coverageLabeled.map((edge) => ({ ...edge, label: "   " }));
    return coverageLabeled;
}
function CoverageCanvas({ mode }: {
    mode: "on" | "off" | "blank";
}) {
    const [items, setItems] = useState(coverageNodes);
    const [edges, setEdges] = useState(() => coverageEdges(mode));
    const title = mode === "on" ? "Same data, with labels" : mode === "off" ? "Same data, no label" : "Same data, blank label";
    return (<section data-coverage-mode={mode}>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      <div className="h-[960px] w-full overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-border">
        <Flow<NodeData> nodes={items} edges={edges} getHandles={getHandles} controls={false} onNodesChange={setItems} onEdgesDelete={(ids) => setEdges((prev) => prev.filter((edge) => !ids.includes(edge.id)))} renderNode={(item) => (<div className={`relative overflow-hidden rounded-[calc(var(--radius)+0.25rem)] before:absolute before:inset-y-0 before:left-0 before:w-1 ${TONE[item.data.tone]}`}>
              <div className="px-2.5 py-2 text-[13px] font-semibold text-foreground">{item.data.title}</div>
            </div>)}/>
      </div>
    </section>);
}
function FlowCoverageDemo() {
    return (<div className="space-y-6">
      <CoverageCanvas mode="on"/>
      <CoverageCanvas mode="off"/>
      <CoverageCanvas mode="blank"/>
    </div>);
}
export const flowShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic node canvas",
            description: "Controlled nodes/edges; getHandles declares the connection stubs for each node (left target in / right source out). Drag the node to change the position, drag the line from the output pile to the input pile, scroll wheel translation, Ctrl+wheel zoom.",
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
            title: "Edge labels",
            description: "FlowEdge.label is optional. Long copy wraps inside the documentation column, and each short label sits on its own edge. An edge without a label stays as it was. The name sits outside the aria-hidden edge layer so a screen reader can read it. Per-edge keyboard selection is not part of this step. A label on a crossing edge can still sit against a neighbor; this step does not add general collision avoidance.",
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
            title: "Comparison, fan-out, and crossing",
            description: "The same nodes and edges are shown three times: no label, a blank label, and visible text. The labeled copy is a shared-source fan, two crossing curves, two adjacent edges, and one long label. A short label at a crossing can still sit against the neighboring edge; this step does not guarantee they are separated.",
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
            title: "Select and delete",
            description: "selectedId / onSelectNode Controlled radio selection: click on the node to select, click on the blank to cancel. After selecting, click \u00D7 or press Delete to delete the node (and delete its connections as well).",
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
            title: "Running (connected to streamer)",
            description: "isEdgeAnimated returns the connection flow animation of true, which is often used to mark the link being executed.",
            code: `<Flow
  nodes={nodes}
  edges={edges}
  getHandles={getHandles}
  isEdgeAnimated={() => true}
  renderNode={(n) => <NodeCard data={n.data} />}
/>`,
            render: () => <FlowDemo animated/>,
        },
        {
            title: "Hide zoom control bar",
            description: "controls={false} Turn off the zoom/fit toolbar in the lower right corner, suitable for pure display scenarios.",
            code: `<Flow
  nodes={nodes}
  edges={edges}
  getHandles={getHandles}
  controls={false}
  renderNode={(n) => <NodeCard data={n.data} />}
/>`,
            render: () => <FlowDemo controls={false}/>,
        },
    ],
    controls: [
        { prop: "controls", type: "boolean", defaultValue: true, label: "Zoom control bar" },
        { prop: "animated", type: "boolean", defaultValue: false, label: "Connect streamer" },
    ],
    states: [
        {
            name: "AI Drawing pipeline (drag nodes / drag out pile connections / wheel translation \u00B7 Ctrl + wheel zoom)",
            render: () => <FlowDemo />,
        },
        {
            name: "Running (connected to streamer)",
            render: () => <FlowDemo animated/>,
        },
    ],
    renderWithProps: (p) => <FlowDemo controls={p.controls as boolean} animated={p.animated as boolean}/>,
    toCode: () => `<Flow
  nodes={nodes}
  edges={edges}
  getHandles={(n) => [{ id: "in", type: "target" }, { id: "out", type: "source" }]}
  onNodesChange={setNodes}
  onConnect={(c) => setEdges((e) => [...e, { id: uid(), ...c }])}
  renderNode={(n) => <NodeCard data={n.data} />}
/>`,
};
