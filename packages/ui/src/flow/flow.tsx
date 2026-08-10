"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";
import { DotPattern } from "../dot-pattern";
import { FlowNodeView } from "./flow-node";
import {
  bezierPath,
  fitViewport,
  handleKey,
  handlePoint,
  layeredLayout,
  nodesBounds,
  screenToCanvas,
  zoomAtPoint,
} from "./flow-geometry";
import type {
  FlowApi,
  FlowHandleSpec,
  FlowNode,
  FlowPoint,
  FlowProps,
  FlowSize,
  FlowViewport,
} from "./flow.types";
import { useComponentLocale } from "../config/locale-context";

const DEFAULT_WIDTH = 240;
const ZOOM_STEP = 1.2;

// 节点画布编排器（"use client"·零额外依赖·原生 Pointer Events + SVG）：
//  · 受控 nodes/edges，组件只回吐变更（onNodesChange/onConnect/...），不偷改业务 data（照 Kanban 范式）。
//  · 三类手势经 ref 状态机分流：拖空白=平移、拖节点本体=移动、拖出桩=连线（橡皮筋预览 + elementFromPoint 命中入桩）。
//  · 连线端点由 flow-geometry.handlePoint 算，与 flow-node 桩 DOM 同一比例公式 → 端点贴合桩中心。
type Gesture =
  | { kind: "pan"; startX: number; startY: number; vp: FlowViewport }
  | { kind: "node"; id: string; startX: number; startY: number; pos: FlowPoint }
  | { kind: "connect"; source: string; sourceHandle?: string };

export function Flow<T>({
  nodes,
  edges,
  getHandles,
  renderNode,
  onNodesChange,
  onConnect,
  onEdgesDelete,
  onNodeDelete,
  selectedId,
  onSelectNode,
  defaultNodeWidth = DEFAULT_WIDTH,
  minZoom = 0.35,
  maxZoom = 2,
  controls = true,
  background,
  isEdgeAnimated,
  className,
  apiRef,
}: FlowProps<T>) {
  const labels = useComponentLocale().flow ?? {
    canvas: "工作流画布",
    node: "工作流节点",
    source: "输出",
    target: "输入",
    zoomIn: "放大",
    zoomOut: "缩小",
    fitView: "适配视图",
    deleteNode: "删除节点",
    deleteEdge: "删除连线",
    autoLayout: "智能排版",
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState<FlowViewport>({ x: 0, y: 0, zoom: 1 });
  const [sizes, setSizes] = useState<Record<string, FlowSize>>({});
  const [dragDelta, setDragDelta] = useState<FlowPoint | null>(null);
  const [connectTo, setConnectTo] = useState<FlowPoint | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  const gesture = useRef<Gesture | null>(null);
  const moved = useRef(false);

  // 选中：受控优先，否则内部态
  const [innerSel, setInnerSel] = useState<string | null>(null);
  const sel = selectedId !== undefined ? selectedId : innerSel;
  const selectNode = useCallback(
    (id: string | null) => {
      setSelectedEdge(null);
      if (selectedId === undefined) setInnerSel(id);
      onSelectNode?.(id);
    },
    [selectedId, onSelectNode],
  );

  const nodeById = useMemo(() => {
    const m = new Map<string, FlowNode<T>>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  // 已连接的桩集合：边的两端各占一个桩；handle 缺省取该侧首个桩（与 handleWorld 的默认一致）。
  // 用于把已连接的入桩从灰染成 primary，让一根连线两端同色。
  const connectedHandles = useMemo(() => {
    const set = new Set<string>();
    const firstHandleId = (nodeId: string, type: "source" | "target") => {
      const n = nodeById.get(nodeId);
      return n ? getHandles(n).find((h) => h.type === type)?.id : undefined;
    };
    for (const e of edges) {
      const sh = e.sourceHandle ?? firstHandleId(e.source, "source");
      const th = e.targetHandle ?? firstHandleId(e.target, "target");
      if (sh) set.add(handleKey(e.source, sh));
      if (th) set.add(handleKey(e.target, th));
    }
    return set;
  }, [edges, nodeById, getHandles]);

  const onSizeChange = useCallback((id: string, size: FlowSize) => {
    setSizes((prev) => {
      const cur = prev[id];
      if (cur && cur.width === size.width && cur.height === size.height) return prev;
      return { ...prev, [id]: size };
    });
  }, []);

  // 节点显示位置（拖拽中的节点叠加增量）
  const displayPos = useCallback(
    (n: FlowNode<T>): FlowPoint => {
      const g = gesture.current;
      if (dragDelta && g?.kind === "node" && g.id === n.id) {
        return { x: n.position.x + dragDelta.x, y: n.position.y + dragDelta.y };
      }
      return n.position;
    },
    [dragDelta],
  );

  // 桩世界坐标（handleId 缺省取该侧首个桩）
  const handleWorld = useCallback(
    (nodeId: string, handleId: string | undefined, type: "source" | "target"): FlowPoint | null => {
      const n = nodeById.get(nodeId);
      const size = sizes[nodeId];
      if (!n || !size) return null;
      const same = getHandles(n).filter((h) => h.type === type);
      if (same.length === 0) return null;
      const idx = handleId ? same.findIndex((h) => h.id === handleId) : 0;
      const i = idx < 0 ? 0 : idx;
      return handlePoint(displayPos(n), size, type === "source" ? "right" : "left", i, same.length);
    },
    [nodeById, sizes, getHandles, displayPos],
  );

  // ─── 手势 ──────────────────────────────────────────────────────
  // 最新值快照：window 监听是一次性稳定函数，靠这个 ref 读到最新 vp/nodes/回调，杜绝过期闭包。
  const latest = useRef({ vp, nodes, dragDelta, onNodesChange, onConnect });
  latest.current = { vp, nodes, dragDelta, onNodesChange, onConnect };

  const pointerRel = (clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  // 一次性创建、互相引用以便彼此解绑（稳定身份，全程不重建）。
  const handlers = useRef<{
    move: (e: PointerEvent) => void;
    up: (e: PointerEvent) => void;
  } | null>(null);
  if (!handlers.current) {
    const move = (e: PointerEvent) => {
      const g = gesture.current;
      if (!g) return;
      moved.current = true;
      const cur = latest.current.vp;
      if (g.kind === "pan") {
        setVp({ ...g.vp, x: g.vp.x + (e.clientX - g.startX), y: g.vp.y + (e.clientY - g.startY) });
      } else if (g.kind === "node") {
        setDragDelta({
          x: (e.clientX - g.startX) / cur.zoom,
          y: (e.clientY - g.startY) / cur.zoom,
        });
      } else if (g.kind === "connect") {
        const rel = pointerRel(e.clientX, e.clientY);
        setConnectTo(screenToCanvas(rel.x, rel.y, cur));
      }
    };
    const up = (e: PointerEvent) => {
      const g = gesture.current;
      const { nodes: ns, dragDelta: dd, onNodesChange: onNC, onConnect: onC } = latest.current;
      if (g?.kind === "connect") {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const handleEl = el?.closest<HTMLElement>('[data-flow-handle][data-handle-type="target"]');
        const target = handleEl?.dataset.nodeId;
        if (target && target !== g.source) {
          onC?.({
            source: g.source,
            sourceHandle: g.sourceHandle,
            target,
            targetHandle: handleEl?.dataset.flowHandle,
          });
        }
      } else if (g?.kind === "node" && dd && (dd.x !== 0 || dd.y !== 0)) {
        onNC?.(
          ns.map((n) =>
            n.id === g.id
              ? { ...n, position: { x: n.position.x + dd.x, y: n.position.y + dd.y } }
              : n,
          ),
        );
      }
      gesture.current = null;
      setDragDelta(null);
      setConnectTo(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    handlers.current = { move, up };
  }

  useEffect(() => {
    return () => {
      const h = handlers.current;
      if (h) {
        window.removeEventListener("pointermove", h.move);
        window.removeEventListener("pointerup", h.up);
      }
    };
  }, []);

  const arm = () => {
    const h = handlers.current!;
    window.addEventListener("pointermove", h.move);
    window.addEventListener("pointerup", h.up);
  };

  const onBackgroundPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as Element).closest("[data-flow-node]")) return; // 节点自己处理
    selectNode(null);
    moved.current = false;
    gesture.current = { kind: "pan", startX: e.clientX, startY: e.clientY, vp };
    arm();
  };

  const onBodyPointerDown = (id: string, e: ReactPointerEvent, interactive: boolean) => {
    selectNode(id);
    if (interactive) return; // 落在控件上：仅选中，不起拖
    const n = nodeById.get(id);
    if (!n) return;
    moved.current = false;
    gesture.current = { kind: "node", id, startX: e.clientX, startY: e.clientY, pos: n.position };
    setDragDelta({ x: 0, y: 0 });
    arm();
  };

  const onHandlePointerDown = (id: string, handle: FlowHandleSpec, e: ReactPointerEvent) => {
    gesture.current = { kind: "connect", source: id, sourceHandle: handle.id };
    const rel = pointerRel(e.clientX, e.clientY);
    setConnectTo(screenToCanvas(rel.x, rel.y, vp));
    arm();
  };

  // ─── 缩放 / 视口控制 ────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        // 缩放量与滚动幅度成比例（指数映射，平滑且不会触控板捏合时几帧就缩到底）。
        // 归一 deltaMode：行模式(×~16)/页模式(×容器高)折算成像素，跨鼠标/触控板手感一致。
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rect.height : 1;
        const factor = Math.exp(-e.deltaY * unit * 0.0012);
        setVp((cur) =>
          zoomAtPoint(cur, factor, e.clientX - rect.left, e.clientY - rect.top, minZoom, maxZoom),
        );
      } else {
        setVp((cur) => ({ ...cur, x: cur.x - e.deltaX, y: cur.y - e.deltaY }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [minZoom, maxZoom]);

  const zoomBy = useCallback(
    (factor: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setVp((cur) => zoomAtPoint(cur, factor, rect.width / 2, rect.height / 2, minZoom, maxZoom));
    },
    [minZoom, maxZoom],
  );

  const fitView = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const b = nodesBounds(nodes, sizes, defaultNodeWidth);
    if (!b) return;
    setVp(fitViewport(b, { width: el.clientWidth, height: el.clientHeight }, 48, minZoom, maxZoom));
  }, [nodes, sizes, defaultNodeWidth, minZoom, maxZoom]);

  const reset = useCallback(() => setVp({ x: 0, y: 0, zoom: 1 }), []);

  // 智能排版：按拓扑分层重排，回吐新位置后基于新坐标立即适配视图（不等受控回流）。
  const autoLayout = useCallback(() => {
    const pos = layeredLayout(nodes, edges, sizes, { defaultWidth: defaultNodeWidth });
    if (Object.keys(pos).length === 0) return;
    const next = nodes.map((n) => (pos[n.id] ? { ...n, position: pos[n.id] } : n));
    onNodesChange?.(next);
    const el = containerRef.current;
    const b = nodesBounds(next, sizes, defaultNodeWidth);
    if (el && b)
      setVp(
        fitViewport(b, { width: el.clientWidth, height: el.clientHeight }, 48, minZoom, maxZoom),
      );
  }, [nodes, edges, sizes, defaultNodeWidth, onNodesChange, minZoom, maxZoom]);

  useEffect(() => {
    if (apiRef) {
      apiRef.current = {
        fitView,
        zoomIn: () => zoomBy(ZOOM_STEP),
        zoomOut: () => zoomBy(1 / ZOOM_STEP),
        reset,
        autoLayout,
      } satisfies FlowApi;
    }
  }, [apiRef, fitView, zoomBy, reset, autoLayout]);

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key !== "Delete" && e.key !== "Backspace") return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.closest('input,textarea,[contenteditable="true"]'))
      return;
    if (selectedEdge) {
      e.preventDefault();
      onEdgesDelete?.([selectedEdge]);
      setSelectedEdge(null);
    } else if (sel) {
      e.preventDefault();
      onNodeDelete?.(sel);
    }
  };

  // ─── 渲染 ──────────────────────────────────────────────────────
  const worldStyle = {
    transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`,
    transformOrigin: "0 0" as const,
  };

  // 默认底纹 dogfood DotPattern：传 viewport 让点阵随画布平移/缩放（视差对齐），themeable 走 text-border。
  const dotSpacing = 22 * vp.zoom;
  const bg =
    background === false
      ? null
      : background ?? (
          <DotPattern
            className="text-border"
            width={dotSpacing}
            height={dotSpacing}
            cx={dotSpacing / 2}
            cy={dotSpacing / 2}
            cr={1.1}
            x={vp.x}
            y={vp.y}
          />
        );

  // 连线预览源点
  const previewFrom =
    gesture.current?.kind === "connect"
      ? handleWorld(gesture.current.source, gesture.current.sourceHandle, "source")
      : null;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="application"
      aria-label={labels.canvas}
      onPointerDown={onBackgroundPointerDown}
      onKeyDown={onKeyDown}
      className={cn(
        "relative h-full w-full overflow-hidden bg-bg outline-none focus-visible:ring-2 focus-visible:ring-ring",
        gesture.current?.kind === "pan" && "cursor-grabbing",
        className,
      )}
    >
      {bg}

      <div className="absolute left-0 top-0 h-0 w-0" style={worldStyle}>
        {/* 连线层（世界坐标，stroke 不随缩放变粗） */}
        <svg
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
          width={1}
          height={1}
          aria-hidden
        >
          {edges.map((edge) => {
            const from = handleWorld(edge.source, edge.sourceHandle, "source");
            const to = handleWorld(edge.target, edge.targetHandle, "target");
            if (!from || !to) return null;
            const d = bezierPath(from, to);
            const active = selectedEdge === edge.id;
            const animated = isEdgeAnimated?.(edge);
            return (
              <g key={edge.id}>
                {/* 透明粗线作点击命中区 */}
                <path
                  d={d}
                  className="pointer-events-[visibleStroke] cursor-pointer"
                  stroke="transparent"
                  strokeWidth={16}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSelectedEdge(edge.id);
                    selectNode(null);
                  }}
                />
                <path
                  d={d}
                  className={cn(
                    active ? "text-primary" : "text-muted-foreground",
                    animated &&
                      "[stroke-dasharray:6_6] motion-safe:animate-[hulian-flow-dash_0.6s_linear_infinite] motion-reduce:[stroke-dasharray:none]",
                  )}
                  stroke="currentColor"
                  strokeWidth={active ? 3 : 2}
                  fill="none"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                {active && onEdgesDelete && (
                  <foreignObject
                    x={(from.x + to.x) / 2 - 9}
                    y={(from.y + to.y) / 2 - 9}
                    width={18}
                    height={18}
                    className="pointer-events-auto overflow-visible"
                  >
                    <FlowEdgeDeleteButton
                      onDelete={() => {
                        onEdgesDelete([edge.id]);
                        setSelectedEdge(null);
                      }}
                    />
                  </foreignObject>
                )}
              </g>
            );
          })}

          {/* 橡皮筋预览 */}
          {previewFrom && connectTo && (
            <path
              d={bezierPath(previewFrom, connectTo)}
              className="text-primary"
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="none"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {/* 节点层 */}
        {nodes.map((n) => (
          <FlowNodeView
            key={n.id}
            node={{ ...n, position: displayPos(n) }}
            handles={getHandles(n)}
            connectedHandles={connectedHandles}
            width={n.width ?? defaultNodeWidth}
            selected={sel === n.id}
            dragging={gesture.current?.kind === "node" && gesture.current.id === n.id}
            zoom={vp.zoom}
            onSizeChange={onSizeChange}
            onBodyPointerDown={onBodyPointerDown}
            onHandlePointerDown={onHandlePointerDown}
            onDelete={onNodeDelete}
          >
            {renderNode(n, { selected: sel === n.id })}
          </FlowNodeView>
        ))}
      </div>

      {/* 缩放控制条 */}
      {controls && (
        <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-[var(--radius)] border border-hairline bg-surface shadow-sm">
          <ControlBtn label={labels.zoomIn} onClick={() => zoomBy(ZOOM_STEP)}>
            <svg
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path d="M10 5v10M5 10h10" strokeLinecap="round" />
            </svg>
          </ControlBtn>
          <ControlBtn label={labels.zoomOut} onClick={() => zoomBy(1 / ZOOM_STEP)}>
            <svg
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path d="M5 10h10" strokeLinecap="round" />
            </svg>
          </ControlBtn>
          <ControlBtn label={labels.fitView} onClick={fitView}>
            <svg
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                d="M4 7V4h3M16 7V4h-3M4 13v3h3M16 13v3h-3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </ControlBtn>
          {onNodesChange && (
            <ControlBtn label={labels.autoLayout} onClick={autoLayout}>
              <svg
                viewBox="0 0 20 20"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden
              >
                <rect x="2.5" y="7.5" width="5" height="5" rx="1.2" />
                <rect x="12.5" y="3" width="5" height="4" rx="1.2" />
                <rect x="12.5" y="13" width="5" height="4" rx="1.2" />
                <path
                  d="M7.5 10h2.5M10 10V5h2.5M10 10v5h2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </ControlBtn>
          )}
        </div>
      )}
    </div>
  );
}

/** Internal edge action extracted so its conditional locale contract is directly testable. */
export function FlowEdgeDeleteButton({ onDelete }: { onDelete: () => void }) {
  const labels = useComponentLocale().flow ?? {
    canvas: "工作流画布",
    node: "工作流节点",
    source: "输出",
    target: "输入",
    zoomIn: "放大",
    zoomOut: "缩小",
    fitView: "适配视图",
    deleteNode: "删除节点",
    deleteEdge: "删除连线",
    autoLayout: "智能排版",
  };
  return (
    <button
      type="button"
      aria-label={labels.deleteEdge}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onDelete}
      className="grid size-[18px] place-items-center rounded-full border border-hairline bg-surface text-muted-foreground shadow-sm hover:border-danger hover:text-danger"
    >
      <svg
        viewBox="0 0 16 16"
        className="size-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden
      >
        <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function ControlBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      className="grid size-8 place-items-center text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground [&+button]:border-t [&+button]:border-border"
    >
      {children}
    </button>
  );
}
