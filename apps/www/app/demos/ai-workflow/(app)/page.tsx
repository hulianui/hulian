"use client";
import { copy } from "./page.content";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  Button,
  Flow,
  Input,
  ShimmerButton,
  Spinner,
  Tag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tour,
  toast,
  type FlowApi,
  type FlowConnection,
  type FlowEdge,
  type FlowNode,
} from "@hulianui/ui";
import { Palette } from "../_components/canvas/palette";
import { Inspector } from "../_components/canvas/inspector";
import { NodeCard } from "../_components/canvas/node-card";
import { RunPanel } from "../_components/canvas/run-panel";
import { handlesFor, NODE_KIND_MAP } from "../_data/node-kinds";
import { instantiateTemplate } from "../_data/templates";
import { useFlowRun } from "../_lib/use-flow-run";
import { usePending } from "../../lib/async";
import type { FlowNodeData, NodeKind } from "../_data/types";

type N = FlowNode<FlowNodeData>;

const DEFAULT_TEMPLATE = "t2";

function initialGraph(): { nodes: N[]; edges: FlowEdge[] } {
  return instantiateTemplate(DEFAULT_TEMPLATE) ?? { nodes: [], edges: [] };
}

// Tour 步骤：高亮 Palette → 画布 → 运行钮
const TOUR_STEPS = [
  {
    target: () => document.querySelector<Element>("[data-tour='palette']"),
    title: copy("nodeLibrary"),
    description: copy("buildYourBuildPipelineByDraggingInOrClickingOn"),
    placement: "right" as const,
  },
  {
    target: () => document.querySelector<Element>("[data-tour='canvas']"),
    title: copy("canvas"),
    description: copy("connectNodesOnCanvasDragFromTheDotOnThe"),
    placement: "top" as const,
  },
  {
    target: () => document.querySelector<Element>("[data-tour='run-btn']"),
    title: copy("runWorkflow"),
    description: copy("afterConfiguringTheNodesClickRunAndTheAIWill"),
    placement: "bottom" as const,
  },
];

const TOUR_STORAGE_KEY = "hulian-ai-workflow-tour-done";

export default function AiWorkflowCanvasPage() {
  const first = useMemo(initialGraph, []);
  const [nodes, setNodes] = useState<N[]>(first.nodes);
  const [edges, setEdges] = useState<FlowEdge[]>(first.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState(copy("unnamedWorkflow"));
  const [showRun, setShowRun] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const idSeq = useRef(0);
  const api = useRef<FlowApi | null>(null);

  // Tour 受控态
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const { running, activeId, log, progress, run, reset } = useFlowRun(nodes, edges, setNodes);
  const [savePending, runSave] = usePending();

  // 挂载后：读 ?template 覆盖初始图，并适配视图；首次进入触发 Tour
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("template");
    if (t) {
      const g = instantiateTemplate(t);
      if (g) {
        setNodes(g.nodes);
        setEdges(g.edges);
      }
    }
    const timer = setTimeout(() => api.current?.fitView(), 90);

    // 首次进入引导
    if (typeof window !== "undefined" && !localStorage.getItem(TOUR_STORAGE_KEY)) {
      const tourTimer = setTimeout(() => {
        setTourOpen(true);
      }, 500);
      return () => {
        clearTimeout(timer);
        clearTimeout(tourTimer);
      };
    }
    return () => clearTimeout(timer);
  }, []);

  const addNode = useCallback((kind: NodeKind) => {
    const meta = NODE_KIND_MAP[kind];
    setNodes((prev) => {
      const maxX = prev.length ? Math.max(...prev.map((n) => n.position.x)) : 0;
      const minY = prev.length ? Math.min(...prev.map((n) => n.position.y)) : 80;
      const id = `${kind}-${++idSeq.current}-${prev.length}`;
      const node: N = {
        id,
        position: prev.length ? { x: maxX + 80, y: minY } : { x: 80, y: 80 },
        width: meta.width,
        data: meta.makeDefault(),
      };
      setSelectedId(id);
      return [...prev, node];
    });
  }, []);

  const updateNode = useCallback((id: string, patch: Partial<FlowNodeData>) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } as FlowNodeData } : n)),
    );
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
    toast({ title: copy("nodeDeleted"), tone: "neutral" });
  }, []);

  const connect = useCallback((c: FlowConnection) => {
    setEdges((prev) => {
      if (prev.some((e) => e.source === c.source && e.target === c.target)) return prev;
      return [
        ...prev,
        {
          id: `e-${c.source}-${c.target}-${prev.length}`,
          source: c.source,
          target: c.target,
          sourceHandle: c.sourceHandle,
          targetHandle: c.targetHandle,
        },
      ];
    });
  }, []);

  const confirmClearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedId(null);
    setShowRun(false);
    setClearOpen(false);
    toast({ title: copy("canvasCleared"), tone: "neutral" });
  }, []);

  const handleRun = () => {
    setShowRun(true);
    run();
  };

  const handleSave = () => {
    void runSave(() => {
      toast({ title: copy("saved", name), tone: "success" });
    });
  };

  const handleReset = () => {
    reset();
    toast({ title: copy("runningStatusReset"), tone: "neutral" });
  };

  // 运行中的链路连线走流光（端点连到当前活动节点）
  const isEdgeAnimated = useCallback(
    (edge: FlowEdge) => running && (edge.source === activeId || edge.target === activeId),
    [running, activeId],
  );

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  return (
    <TooltipProvider delay={200}>
      <div className="flex h-full min-h-0">
        <div data-tour="palette">
          <Palette onAdd={addNode} />
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col">
          {/* 画布工具条 */}
          <div className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label={copy("workflowName")}
              className="h-8 w-52 font-medium"
            />
            <Tag size="sm" tone="neutral" variant="outline">
              {nodes.length} {copy("node")}
            </Tag>
            <div className="ml-auto flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      disabled={savePending || running}
                      aria-label={copy("saveWorkflow")}
                    />
                  }
                >
                  {savePending ? <Spinner size="sm" /> : <Save className="size-4" />}
                  <span className="hidden sm:inline">{copy("save")}</span>
                </TooltipTrigger>
                <TooltipContent side="bottom">{copy("saveCurrentWorkflow")}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      disabled={running}
                      aria-label={copy("resetRunningState")}
                    />
                  }
                >
                  <RotateCcw className="size-4" />
                  <span className="hidden sm:inline">{copy("reset")}</span>
                </TooltipTrigger>
                <TooltipContent side="bottom">{copy("resetNodeRunningState")}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      tone="danger"
                      size="sm"
                      onClick={() => setClearOpen(true)}
                      disabled={running || nodes.length === 0}
                      aria-label={copy("emptyCanvas")}
                    />
                  }
                >
                  <Trash2 className="size-4" />
                  <span className="hidden sm:inline">{copy("clear")}</span>
                </TooltipTrigger>
                <TooltipContent side="bottom">{copy("emptyAllNodesOnCanvas")}</TooltipContent>
              </Tooltip>

              <div data-tour="run-btn">
                <ShimmerButton
                  onClick={handleRun}
                  disabled={running || nodes.length === 0}
                  className="h-8 px-4 text-sm"
                  aria-label={copy("runWorkflow")}
                >
                  {running ? <Spinner size="sm" /> : <Play className="size-4 fill-current" />}
                  {running ? copy("generating") : copy("run")}
                </ShimmerButton>
              </div>
            </div>
          </div>

          {/* 画布 */}
          <div className="relative min-h-0 flex-1" data-tour="canvas">
            <Flow<FlowNodeData>
              nodes={nodes}
              edges={edges}
              apiRef={api}
              getHandles={(n) => handlesFor(n.data.kind)}
              selectedId={selectedId}
              onSelectNode={setSelectedId}
              onNodesChange={setNodes}
              onConnect={connect}
              onEdgesDelete={(ids) => setEdges((prev) => prev.filter((e) => !ids.includes(e.id)))}
              onNodeDelete={deleteNode}
              isEdgeAnimated={isEdgeAnimated}
              renderNode={(n) => <NodeCard node={n} />}
            />
            {showRun && (
              <RunPanel
                running={running}
                progress={progress}
                log={log}
                onClose={() => setShowRun(false)}
              />
            )}
          </div>
        </div>

        <Inspector
          node={selectedNode}
          nodes={nodes}
          edges={edges}
          onUpdate={updateNode}
          onDelete={deleteNode}
        />
      </div>

      {/* 清空画布确认弹窗 */}
      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent
          title={copy("emptyCanvas")}
          description={copy("thisWillRemoveAllNodesAndConnectionsOnTheCanvas")}
        >
          <AlertDialogClose render={<Button variant="outline" size="sm" />}>
            {copy("cancel")}
          </AlertDialogClose>
          <Button tone="danger" size="sm" onClick={confirmClearAll}>
            {copy("confirmEmpty")}
          </Button>
        </AlertDialogContent>
      </AlertDialog>

      {/* 首进 Tour 引导 */}
      <Tour
        steps={TOUR_STEPS}
        open={tourOpen}
        current={tourStep}
        onChange={setTourStep}
        onClose={() => {
          setTourOpen(false);
          localStorage.setItem(TOUR_STORAGE_KEY, "1");
        }}
        onFinish={() => {
          setTourOpen(false);
          localStorage.setItem(TOUR_STORAGE_KEY, "1");
          toast({ title: copy("onboardingCompleteStartBuildingYourAIWorkflow"), tone: "info" });
        }}
      />
    </TooltipProvider>
  );
}
