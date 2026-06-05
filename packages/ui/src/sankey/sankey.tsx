"use client";
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { cn } from "../lib/cn";
import { computeSankeyLayout } from "./sankey-geometry";
import type { SankeyLaidLink, SankeyLaidNode, SankeyProps } from "./sankey.types";

const DEFAULT_HEIGHT = 320;
const DEFAULT_NODE_WIDTH = 16;
const DEFAULT_NODE_PADDING = 12;
const DEFAULT_LINK_OPACITY = 0.35;
// jsdom / SSR 下容器宽度测不到（0），用兜底宽度算几何，保证 label 文本可渲染 + 可断言。
const FALLBACK_WIDTH = 600;

type HoverTarget =
  | { type: "node"; node: SankeyLaidNode }
  | { type: "link"; link: SankeyLaidLink }
  | null;

// 桑基图（Sankey · "use client" · 零额外依赖 · 纯 SVG ribbon）：
//   · 拓扑自动分层（source 层 < target 层），流宽按 value 占比，几何全在 computeSankeyLayout 纯函数。
//   · 容器宽度用 ref + ResizeObserver 测量；测不到时（jsdom）回落兜底宽度。
//   · 配色全走 token（var(--*)），per-node / per-link tone 覆盖；hover 高亮关联链路 + 可选 tooltip。
export function Sankey({
  nodes,
  links,
  height = DEFAULT_HEIGHT,
  nodeWidth = DEFAULT_NODE_WIDTH,
  nodePadding = DEFAULT_NODE_PADDING,
  linkOpacity = DEFAULT_LINK_OPACITY,
  renderNodeLabel,
  renderTooltip,
  onNodeClick,
  onLinkClick,
  className,
}: SankeyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<HoverTarget>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    // ResizeObserver 在 jsdom / 老环境可能缺失 —— 缺则只测一次，几何回落兜底宽度。
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const effectiveWidth = width > 0 ? width : FALLBACK_WIDTH;

  const layout = useMemo(
    () =>
      computeSankeyLayout(nodes, links, {
        width: effectiveWidth,
        height,
        nodeWidth,
        nodePadding,
      }),
    [nodes, links, effectiveWidth, height, nodeWidth, nodePadding],
  );

  // hover 高亮：高亮节点关联的所有 link，或高亮 link 本身。
  const isLinkHot = (l: SankeyLaidLink) => {
    if (!hover) return false;
    if (hover.type === "link") return hover.link === l;
    return l.source === hover.node.id || l.target === hover.node.id;
  };
  const isNodeHot = (n: SankeyLaidNode) => {
    if (!hover) return false;
    if (hover.type === "node") return hover.node.id === n.id;
    return hover.link.source === n.id || hover.link.target === n.id;
  };
  const anyHover = hover !== null;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height }}
    >
      <svg
        width={effectiveWidth}
        height={height}
        viewBox={`0 0 ${effectiveWidth} ${height}`}
        className="block h-full w-full overflow-visible"
        role="img"
        aria-label="桑基流向图"
      >
        {/* 连线层（ribbon 描边，先画 → 节点压在上层） */}
        <g fill="none" strokeLinecap="butt">
          {layout.links.map((l, i) => {
            const hot = isLinkHot(l);
            const dimmed = anyHover && !hot;
            const color = l.tone ?? "var(--color-primary)";
            return (
              <path
                key={`${l.source}-${l.target}-${i}`}
                d={l.path}
                stroke={color}
                strokeWidth={l.width}
                strokeOpacity={hot ? 0.6 : dimmed ? linkOpacity * 0.4 : linkOpacity}
                className={cn(
                  "transition-[stroke-opacity]",
                  onLinkClick && "cursor-pointer",
                )}
                onMouseEnter={(e) => {
                  setHover({ type: "link", link: l });
                  setTip(pointerIn(containerRef.current, e));
                }}
                onMouseMove={(e) => setTip(pointerIn(containerRef.current, e))}
                onMouseLeave={() => {
                  setHover(null);
                  setTip(null);
                }}
                onClick={() => onLinkClick?.(l)}
              />
            );
          })}
        </g>

        {/* 节点层（矩形 + label foreignObject） */}
        {layout.nodes.map((n) => {
          const hot = isNodeHot(n);
          const dimmed = anyHover && !hot;
          const fill = n.tone ?? "var(--color-primary)";
          const labelEl = renderNodeLabel ? (
            renderNodeLabel(n)
          ) : (
            <span className="truncate text-foreground">{n.label ?? n.id}</span>
          );
          // label 放在节点矩形外侧：非末层放右侧，末层放左侧。
          const isLast = n.layer === layout.layers - 1;
          const labelX = isLast ? n.x - 132 : n.x + nodeWidth + 6;
          return (
            <g
              key={n.id}
              className={cn(onNodeClick && "cursor-pointer")}
              opacity={dimmed ? 0.45 : 1}
              onMouseEnter={(e) => {
                setHover({ type: "node", node: n });
                setTip(pointerIn(containerRef.current, e));
              }}
              onMouseMove={(e) => setTip(pointerIn(containerRef.current, e))}
              onMouseLeave={() => {
                setHover(null);
                setTip(null);
              }}
              onClick={() => onNodeClick?.(n)}
            >
              <rect
                x={n.x}
                y={n.y}
                width={nodeWidth}
                height={Math.max(n.height, 1)}
                rx={2}
                fill={fill}
                fillOpacity={hot ? 1 : 0.85}
                stroke="var(--color-bg)"
                strokeWidth={1}
              />
              <foreignObject
                x={labelX}
                y={n.y + n.height / 2 - 11}
                width={126}
                height={22}
                className="overflow-visible"
              >
                <div
                  className={cn(
                    "flex h-[22px] items-center text-[12px] font-medium leading-none",
                    isLast ? "justify-end text-right" : "justify-start",
                  )}
                >
                  {labelEl}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* tooltip（复用宿主层 div，跟随指针） */}
      {renderTooltip && hover && tip && (
        <div
          className="pointer-events-none absolute z-10 max-w-[220px] rounded-[var(--radius)] border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground shadow-md"
          style={tooltipStyle(tip)}
        >
          {renderTooltip(hover)}
        </div>
      )}
    </div>
  );
}

function pointerIn(
  el: HTMLDivElement | null,
  e: { clientX: number; clientY: number },
): { x: number; y: number } | null {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function tooltipStyle(tip: { x: number; y: number }): CSSProperties {
  return {
    left: tip.x + 12,
    top: tip.y + 12,
  };
}
