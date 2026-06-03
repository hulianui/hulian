"use client";
import { useId, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { WORLD_DOTS, VIEWBOX, projectPoint } from "./world-map.dots";
import type { WorldMapPoint, WorldMapProps } from "./world-map.types";

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

export function WorldMap({
  dots = [],
  lineColor = "var(--color-chart-1)",
  dotColor = "var(--color-border)",
  duration = 1,
  className,
}: WorldMapProps) {
  const gradId = useId();
  const reduced = useReducedMotion();

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
    <svg
      viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
      className={cn("h-auto w-full select-none", className)}
      style={{ overflow: "visible" }}
      aria-hidden
    >
      {/* 底图点阵 */}
      <g>{dotCircles}</g>

      {/* 弧线 */}
      {resolved.map((d, i) => {
        const s = projectPoint(d.start.lat, d.start.lng);
        const e = projectPoint(d.end.lat, d.end.lng);
        const path = arcPath(s, e);
        return (
          <motion.path
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

      {/* 端点：实心点 + 脉冲环（用各自连线的颜色） */}
      {endpoints.map(({ p, x, y, color }) => (
        <g key={pointKey(p)}>
          <circle cx={x} cy={y} r={0.45} fill={color} />
          {!reduced && (
            <motion.circle
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
  );
}
