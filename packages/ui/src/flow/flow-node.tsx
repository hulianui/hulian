"use client";
import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";
import { handleKey, handleOffsetRatio } from "./flow-geometry";
import type { FlowHandleSpec, FlowNode, FlowSize } from "./flow.types";

// 节点内交互元素：在其上按下不触发节点拖拽（仍选中），让表单控件可用。照 React Flow .nodrag 思路。
const INTERACTIVE = 'input,textarea,select,button,a,[role="slider"],[role="combobox"],[role="switch"],[contenteditable="true"],[data-no-drag]';

function isInteractive(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(INTERACTIVE);
}

interface FlowNodeViewProps<T> {
  node: FlowNode<T>;
  handles: FlowHandleSpec[];
  /** 已被连线接入/接出的桩键集合（handleKey(nodeId, handleId)）→ 据此把已连接的桩染成 primary。 */
  connectedHandles: Set<string>;
  width: number;
  selected: boolean;
  dragging: boolean;
  zoom: number;
  children: ReactNode;
  onSizeChange: (id: string, size: FlowSize) => void;
  /** 在节点本体按下 → 选中（interactive=true 表示落在表单控件上，调用方应只选中不起拖）。 */
  onBodyPointerDown: (id: string, e: ReactPointerEvent, interactive: boolean) => void;
  /** 在某个 source 桩上按下 → 起连线。 */
  onHandlePointerDown: (id: string, handle: FlowHandleSpec, e: ReactPointerEvent) => void;
  onDelete?: (id: string) => void;
}

export function FlowNodeView<T>({
  node,
  handles,
  connectedHandles,
  width,
  selected,
  dragging,
  zoom,
  children,
  onSizeChange,
  onBodyPointerDown,
  onHandlePointerDown,
  onDelete,
}: FlowNodeViewProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  // 测量节点尺寸供连线几何对齐（ResizeObserver 带守卫，SSR/jsdom 安全）。
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const report = () => onSizeChange(node.id, { width: el.offsetWidth, height: el.offsetHeight });
    report();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [node.id, onSizeChange]);

  const targets = handles.filter((h) => h.type === "target");
  const sources = handles.filter((h) => h.type === "source");

  return (
    <div
      ref={ref}
      data-flow-node={node.id}
      role="group"
      aria-label="工作流节点"
      className={cn(
        "absolute select-none rounded-[calc(var(--radius)+0.25rem)] border bg-surface shadow-sm transition-shadow",
        selected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-muted",
        dragging ? "cursor-grabbing shadow-lg" : "cursor-grab",
      )}
      style={{ left: node.position.x, top: node.position.y, width }}
      onPointerDown={(e) => {
        // 桩自己 stopPropagation；这里只处理本体
        if (e.button !== 0) return;
        onBodyPointerDown(node.id, e, isInteractive(e.target));
      }}
    >
      {children}

      {/* 选中态删除钮 */}
      {selected && onDelete && (
        <button
          type="button"
          data-no-drag
          aria-label="删除节点"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          className="absolute -right-2.5 -top-2.5 grid size-5 place-items-center rounded-full border border-border bg-surface text-muted shadow-sm transition-colors hover:border-danger hover:text-danger"
        >
          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* 入桩（左） */}
      {targets.map((h, i) => (
        <Handle
          key={h.id}
          handle={h}
          nodeId={node.id}
          side="left"
          ratio={handleOffsetRatio(i, targets.length)}
          zoom={zoom}
          connected={connectedHandles.has(handleKey(node.id, h.id))}
        />
      ))}
      {/* 出桩（右）·可起连线 */}
      {sources.map((h, i) => (
        <Handle
          key={h.id}
          handle={h}
          nodeId={node.id}
          side="right"
          ratio={handleOffsetRatio(i, sources.length)}
          zoom={zoom}
          connected={connectedHandles.has(handleKey(node.id, h.id))}
          onPointerDown={(e) => {
            e.stopPropagation();
            if (e.button !== 0) return;
            onHandlePointerDown(node.id, h, e);
          }}
        />
      ))}
    </div>
  );
}

function Handle({
  handle,
  nodeId,
  side,
  ratio,
  zoom,
  connected,
  onPointerDown,
}: {
  handle: FlowHandleSpec;
  nodeId: string;
  side: "left" | "right";
  ratio: number;
  zoom: number;
  connected: boolean;
  onPointerDown?: (e: ReactPointerEvent) => void;
}) {
  return (
    <span
      data-flow-handle={handle.id}
      data-node-id={nodeId}
      data-handle-type={handle.type}
      data-connected={connected ? "" : undefined}
      title={handle.label}
      aria-label={handle.label ?? (handle.type === "source" ? "输出" : "输入")}
      onPointerDown={onPointerDown}
      className={cn(
        // 桩 = 不透明实心圆点 + surface 描边环，半压在节点边缘也不被底下 accent 条透色染脏。
        "absolute z-10 block rounded-full border-2 border-surface shadow-sm",
        // 出桩永远 primary（可拖拽的输出口）；入桩已连接→primary（两端同色），未连接→muted 灰。
        handle.type === "source"
          ? "cursor-crosshair bg-primary hover:scale-125"
          : connected
            ? "bg-primary"
            : "bg-muted",
        "transition-transform",
      )}
      style={{
        // 桩视觉尺寸不随缩放变形（除以 zoom 抵消 world 缩放）
        width: 12 / zoom,
        height: 12 / zoom,
        borderWidth: 2 / zoom,
        left: side === "left" ? 0 : "100%",
        top: `${ratio * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}
