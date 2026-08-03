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
    neutral: "before:bg-muted",
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
              <div className="mt-0.5 text-xs text-muted">{n.data.subtitle}</div>
            </div>
          </div>)}/>
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
