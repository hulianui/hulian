"use client";
import { useRef } from "react";
import { Flow, Tag, type FlowEdge, type FlowHandleSpec, type FlowNode, type FlowApi, } from "@hulianui/ui";
import { FileText, Sparkles, Cpu, Wrench, Download } from "lucide-react";
type NodeKind = "input" | "prompt" | "model" | "tool" | "output";
interface NodeData {
    kind: NodeKind;
    title: string;
    subtitle: string;
}
const KIND_META: Record<NodeKind, {
    Icon: React.ElementType;
    chipCls: string;
    tagTone: "brand" | "success" | "warning" | "neutral" | "danger";
    tagLabel: string;
}> = {
    input: {
        Icon: FileText,
        chipCls: "bg-blue-500/10 text-blue-500",
        tagTone: "neutral",
        tagLabel: "input",
    },
    prompt: {
        Icon: Sparkles,
        chipCls: "bg-brand/10 text-primary",
        tagTone: "brand",
        tagLabel: "Prompt",
    },
    model: {
        Icon: Cpu,
        chipCls: "bg-purple-500/10 text-purple-500",
        tagTone: "warning",
        tagLabel: "Model",
    },
    tool: {
        Icon: Wrench,
        chipCls: "bg-orange-500/10 text-orange-500",
        tagTone: "neutral",
        tagLabel: "Tools",
    },
    output: {
        Icon: Download,
        chipCls: "bg-success/10 text-success",
        tagTone: "success",
        tagLabel: "output",
    },
};
const NODES: FlowNode<NodeData>[] = [
    {
        id: "n-input",
        position: { x: 40, y: 120 },
        width: 200,
        data: { kind: "input", title: "user input", subtitle: "Text / images / files" },
    },
    {
        id: "n-prompt",
        position: { x: 300, y: 120 },
        width: 200,
        data: { kind: "prompt", title: "Prompt template", subtitle: "System instructions + context injection" },
    },
    {
        id: "n-model",
        position: { x: 560, y: 120 },
        width: 200,
        data: { kind: "model", title: "Claude Sonnet 4", subtitle: "Reasoning \u00B7 Step 32 \u00B7 CFG 7" },
    },
    {
        id: "n-tool",
        position: { x: 820, y: 120 },
        width: 200,
        data: { kind: "tool", title: "Web Search", subtitle: "Internet search enhanced answers" },
    },
    {
        id: "n-output",
        position: { x: 1080, y: 120 },
        width: 200,
        data: { kind: "output", title: "Structured output", subtitle: "JSON \u00B7 Markdown \u00B7 Citations" },
    },
];
const EDGES: FlowEdge[] = [
    { id: "e1", source: "n-input", sourceHandle: "out", target: "n-prompt", targetHandle: "in" },
    { id: "e2", source: "n-prompt", sourceHandle: "out", target: "n-model", targetHandle: "in" },
    { id: "e3", source: "n-model", sourceHandle: "out", target: "n-tool", targetHandle: "in" },
    { id: "e4", source: "n-tool", sourceHandle: "out", target: "n-output", targetHandle: "in" },
];
function getHandles(node: FlowNode<NodeData>): FlowHandleSpec[] {
    const handles: FlowHandleSpec[] = [];
    if (node.data.kind !== "input") {
        handles.push({ id: "in", type: "target" });
    }
    if (node.data.kind !== "output") {
        handles.push({ id: "out", type: "source" });
    }
    return handles;
}
function NodeCard({ node }: {
    node: FlowNode<NodeData>;
}) {
    const { kind, title, subtitle } = node.data;
    const meta = KIND_META[kind];
    const Icon = meta.Icon;
    return (<div className="overflow-hidden rounded-[calc(var(--radius)+0.25rem)]">
      <header className="flex items-center gap-2 px-3 pt-2.5 pb-2">
        <span className={[
            "grid size-7 shrink-0 place-items-center rounded-[var(--radius)]",
            meta.chipCls,
        ].join(" ")}>
          <Icon className="size-4"/>
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
          {title}
        </span>
        <Tag size="sm" tone={meta.tagTone} variant="soft">
          {meta.tagLabel}
        </Tag>
      </header>
      <div className="px-3 pb-3">
        <p className="text-xs leading-relaxed text-muted">{subtitle}</p>
      </div>
    </div>);
}
export function FlowCanvasBlock() {
    const apiRef = useRef<FlowApi | null>(null);
    return (<div className="mx-auto w-full max-w-5xl">
      <div className="h-[22rem] overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
        <Flow<NodeData> nodes={NODES} edges={EDGES} apiRef={apiRef} getHandles={getHandles} renderNode={(node) => <NodeCard node={node}/>} controls className="h-full"/>
      </div>
    </div>);
}
