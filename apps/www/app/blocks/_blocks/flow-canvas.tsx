"use client";

// AI 编排画布 Block —— 自包含、可整段复制。
// 只读展示一条工作流链路：输入 → 提示词 → 模型推理 → 工具调用 → 输出。
// Flow 受控 nodes/edges 全内联；renderNode 自定义节点卡；固定高度容器。

import { useRef } from "react";
import {
  Flow,
  Tag,
  type FlowEdge,
  type FlowHandleSpec,
  type FlowNode,
  type FlowApi,
} from "@hulianui/ui";
import { FileText, Sparkles, Cpu, Wrench, Download } from "lucide-react";

// ── 节点数据类型 ─────────────────────────────────────────────
type NodeKind = "input" | "prompt" | "model" | "tool" | "output";

interface NodeData {
  kind: NodeKind;
  title: string;
  subtitle: string;
}

// ── 节点样式映射 ─────────────────────────────────────────────
const KIND_META: Record<
  NodeKind,
  {
    Icon: React.ElementType;
    chipCls: string;
    tagTone: "brand" | "success" | "warning" | "neutral" | "danger";
    tagLabel: string;
  }
> = {
  input: {
    Icon: FileText,
    chipCls: "bg-blue-500/10 text-blue-500",
    tagTone: "neutral",
    tagLabel: "输入",
  },
  prompt: {
    Icon: Sparkles,
    chipCls: "bg-brand/10 text-primary",
    tagTone: "brand",
    tagLabel: "提示词",
  },
  model: {
    Icon: Cpu,
    chipCls: "bg-purple-500/10 text-purple-500",
    tagTone: "warning",
    tagLabel: "模型",
  },
  tool: {
    Icon: Wrench,
    chipCls: "bg-orange-500/10 text-orange-500",
    tagTone: "neutral",
    tagLabel: "工具",
  },
  output: {
    Icon: Download,
    chipCls: "bg-success/10 text-success",
    tagTone: "success",
    tagLabel: "输出",
  },
};

// ── 受控 nodes / edges ───────────────────────────────────────
const NODES: FlowNode<NodeData>[] = [
  {
    id: "n-input",
    position: { x: 40, y: 120 },
    width: 200,
    data: { kind: "input", title: "用户输入", subtitle: "文本 / 图片 / 文件" },
  },
  {
    id: "n-prompt",
    position: { x: 300, y: 120 },
    width: 200,
    data: { kind: "prompt", title: "提示词模板", subtitle: "系统指令 + 上下文注入" },
  },
  {
    id: "n-model",
    position: { x: 560, y: 120 },
    width: 200,
    data: { kind: "model", title: "Claude Sonnet 4", subtitle: "推理 · 步骤 32 · CFG 7" },
  },
  {
    id: "n-tool",
    position: { x: 820, y: 120 },
    width: 200,
    data: { kind: "tool", title: "Web Search", subtitle: "联网检索增强回答" },
  },
  {
    id: "n-output",
    position: { x: 1080, y: 120 },
    width: 200,
    data: { kind: "output", title: "结构化输出", subtitle: "JSON · Markdown · 引用" },
  },
];

const EDGES: FlowEdge[] = [
  { id: "e1", source: "n-input", sourceHandle: "out", target: "n-prompt", targetHandle: "in" },
  { id: "e2", source: "n-prompt", sourceHandle: "out", target: "n-model", targetHandle: "in" },
  { id: "e3", source: "n-model", sourceHandle: "out", target: "n-tool", targetHandle: "in" },
  { id: "e4", source: "n-tool", sourceHandle: "out", target: "n-output", targetHandle: "in" },
];

// ── 桩声明（每个节点：左一入桩 + 右一出桩） ─────────────────
function getHandles(node: FlowNode<NodeData>): FlowHandleSpec[] {
  const handles: FlowHandleSpec[] = [];
  if (node.data.kind !== "input") {
    handles.push({ id: "in", type: "target", label: "输入" });
  }
  if (node.data.kind !== "output") {
    handles.push({ id: "out", type: "source", label: "输出" });
  }
  return handles;
}

// ── 自定义节点渲染 ───────────────────────────────────────────
function NodeCard({ node }: { node: FlowNode<NodeData> }) {
  const { kind, title, subtitle } = node.data;
  const meta = KIND_META[kind];
  const Icon = meta.Icon;

  return (
    <div className="overflow-hidden rounded-[calc(var(--radius)+0.25rem)]">
      <header className="flex items-center gap-2 px-3 pt-2.5 pb-2">
        <span
          className={[
            "grid size-7 shrink-0 place-items-center rounded-[var(--radius)]",
            meta.chipCls,
          ].join(" ")}
        >
          <Icon className="size-4" />
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
    </div>
  );
}

// ── 区块主体 ─────────────────────────────────────────────────
export function FlowCanvasBlock() {
  const apiRef = useRef<FlowApi | null>(null);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="h-[22rem] overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
        <Flow<NodeData>
          nodes={NODES}
          edges={EDGES}
          apiRef={apiRef}
          getHandles={getHandles}
          renderNode={(node) => <NodeCard node={node} />}
          // 只读：不传 onNodesChange / onConnect / onNodeDelete / onEdgesDelete
          controls
          className="h-full"
        />
      </div>
    </div>
  );
}
