"use client";
import { useId, useMemo } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import { WORLD_DOTS, VIEWBOX, projectPoint } from "./world-map.dots";
import type { WorldMapPoint, WorldMapProps } from "./world-map.types";

// 独立节点半径（viewBox 单位）：基准 + 按 value 归一化插值到 [NODE_R_MIN, NODE_R_MAX]。
const NODE_R_MIN = 0.7;
const NODE_R_MAX = 2.2;
const NODE_R_BASE = 1.0;
const NODE_LABEL_SIZE = 1.9;

// 吸取自 ui.aceternity.com World Map：点阵世界地图 + 经纬度间的动画弧线。
// 瑚琏化：① 底图点阵预烘成静态坐标(world-map.dots.ts)，运行时渲染内联 <circle>，
//   点色/线色走 token、吃 light/dark 主题，零运行时依赖(不引 dotted-map)；
// ② arc 端点用 projectPoint() 复刻 dotted-map 同款椭球 mercator → 与点阵精确对齐；
// ③ 弧线 pathLength 画入 + 两端渐隐描边(招牌"光线扫过")，端点带脉冲环；
// ④ 几何全在固定 viewBox 内由纯函数算出，不依赖 getBoundingClientRect → SSR/jsdom 安全；
// ⑤ 尊重 prefers-reduced-motion：静态铺满、无动画。

// 二次贝塞尔弧线：控制点抬到两端中点上方(lift 随弦长自适应)，整体上凸。
function arcPath(s: { x: number; y: number }, e: { x: number; y: number }) {
  const mx = (s.x + e.x) / 2;
  const my = (s.y + e.y) / 2;
  const dist = Math.hypot(e.x - s.x, e.y - s.y);
  const lift = dist * 0.22; // 弦越长拱越高
  return `M ${s.x},${s.y} Q ${mx},${my - lift} ${e.x},${e.y}`;
}

function pointKey(p: WorldMapPoint) {
  return `${p.lat},${p.lng}`;
}

function nodeRadius(value: number | undefined, range: { min: number; max: number } | null) {
  if (value == null || !range) return NODE_R_BASE;
  if (range.max === range.min) return (NODE_R_MIN + NODE_R_MAX) / 2;
  const t = (value - range.min) / (range.max - range.min);
  return NODE_R_MIN + t * (NODE_R_MAX - NODE_R_MIN);
}

export function WorldMap({
  dots = [],
  points = [],
  showLabels = false,
  onPointClick,
  lineColor = "var(--color-chart-1)",
  dotColor = "var(--color-border)",
  duration = 1,
  className,
}: WorldMapProps) {
  const gradId = useId();
  const reduced = useReducedMotion();
  const interactive = typeof onPointClick === "function";

  // 节点 value 范围 → 半径归一化
  const valueRange = useMemo(() => {
    const vals = points.map((p) => p.value).filter((v): v is number => typeof v === "number");
    if (!vals.length) return null;
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [points]);

  // 投影后的节点几何（含解析色 + 半径）
  const projectedNodes = useMemo(
    () =>
      points.map((n, i) => ({
        node: n,
        index: i,
        color: n.color ?? "var(--color-chart-1)",
        r: nodeRadius(n.value, valueRange),
        ...projectPoint(n.lat, n.lng),
      })),
    [points, valueRange],
  );

  // 底图圆点只随 dotColor 变化 → memo 掉 1k 个节点的重建
  const dotCircles = useMemo(
    () =>
      WORLD_DOTS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={0.28} fill={dotColor} />
      )),
    [dotColor],
  );

  // 逐条解析颜色：dot.color 优先，回退全局 lineColor → 同组件内可混色
  const resolved = useMemo(
    () => dots.map((d) => ({ ...d, color: d.color ?? lineColor })),
    [dots, lineColor],
  );

  // 出现过的颜色去重 → 每色一条渐变（弧线 stroke 按色引用对应渐变）
  const colors = useMemo(() => [...new Set(resolved.map((d) => d.color))], [resolved]);
  const gradIdFor = (color: string) => `${gradId}-${colors.indexOf(color)}`;

  // 端点去重（多条弧共用同一城市时只画一个脉冲）；颜色取首条触及它的连线
  const endpoints = useMemo(() => {
    const seen = new Map<string, { p: WorldMapPoint; color: string }>();
    for (const d of resolved) {
      if (!seen.has(pointKey(d.start))) seen.set(pointKey(d.start), { p: d.start, color: d.color });
      if (!seen.has(pointKey(d.end))) seen.set(pointKey(d.end), { p: d.end, color: d.color });
    }
    return [...seen.values()].map(({ p, color }) => ({ p, color, ...projectPoint(p.lat, p.lng) }));
  }, [resolved]);

  return (
    <LazyMotionProvider>
    <svg
      viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
      className={cn("h-auto w-full select-none", className)}
      style={{ overflow: "visible" }}
      aria-hidden={interactive ? undefined : true}
      role={interactive ? "group" : undefined}
    >
      {/* 底图点阵（装饰，永远对 AT 隐藏） */}
      <g aria-hidden>{dotCircles}</g>

      {/* 弧线 */}
      <g aria-hidden>
      {resolved.map((d, i) => {
        const s = projectPoint(d.start.lat, d.start.lng);
        const e = projectPoint(d.end.lat, d.end.lng);
        const path = arcPath(s, e);
        return (
          <m.path
            key={i}
            d={path}
            fill="none"
            stroke={`url(#${gradIdFor(d.color)})`}
            strokeWidth={0.28}
            strokeLinecap="round"
            initial={reduced ? false : { pathLength: 0 }}
            animate={reduced ? undefined : { pathLength: 1 }}
            transition={
              reduced
                ? undefined
                : {
                    duration,
                    delay: i * 0.25,
                    repeat: Infinity,
                    repeatDelay: 0.6,
                    ease: "easeOut",
                  }
            }
          />
        );
      })}
      </g>

      {/* 飞线端点：实心点 + 脉冲环（用各自连线的颜色） */}
      <g aria-hidden>
      {endpoints.map(({ p, x, y, color }) => (
        <g key={pointKey(p)}>
          <circle cx={x} cy={y} r={0.45} fill={color} />
          {!reduced && (
            <m.circle
              cx={x}
              cy={y}
              fill="none"
              stroke={color}
              strokeWidth={0.16}
              initial={{ r: 0.45, opacity: 0.7 }}
              animate={{ r: 2.2, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </g>
      ))}
      </g>

      {/* 独立节点：分布 + 可选标签 + 可点击下钻 */}
      {projectedNodes.length > 0 && (
        <g role={interactive ? "list" : undefined}>
          {projectedNodes.map(({ node, index, color, r, x, y }) => {
            const key = node.id ?? `${node.lat},${node.lng},${index}`;
            const activate = () => onPointClick?.(node, index);
            return (
              <g
                key={key}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-label={interactive ? (node.label ?? `节点 ${index + 1}`) : undefined}
                onClick={interactive ? activate : undefined}
                onKeyDown={
                  interactive
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          activate();
                        }
                      }
                    : undefined
                }
                style={interactive ? { cursor: "pointer", outline: "none" } : undefined}
              >
                {/* 隐形大命中区，便于点击小节点 */}
                {interactive && <circle cx={x} cy={y} r={r + 1.6} fill="transparent" />}
                {/* 脉冲环 */}
                {!reduced && (
                  <m.circle
                    cx={x}
                    cy={y}
                    fill="none"
                    stroke={color}
                    strokeWidth={0.18}
                    initial={{ r, opacity: 0.6 }}
                    animate={{ r: r + 2.4, opacity: 0 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                {/* 实心节点 */}
                <circle data-wm-node="" cx={x} cy={y} r={r} fill={color} />
                {showLabels && node.label && (
                  <text
                    x={x}
                    y={y - r - 0.8}
                    fontSize={NODE_LABEL_SIZE}
                    textAnchor="middle"
                    fill="var(--color-muted)"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {node.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}

      <defs>
        {/* 每种连线颜色一条渐变：沿弧线方向(objectBoundingBox)两端渐隐 → "光线扫过"观感 */}
        {colors.map((color) => (
          <linearGradient key={color} id={gradIdFor(color)} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity={0} />
            <stop offset="12%" stopColor={color} stopOpacity={1} />
            <stop offset="88%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
    </svg>
    </LazyMotionProvider>
  );
}
