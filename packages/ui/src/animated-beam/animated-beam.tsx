"use client";
import { useEffect, useId, useState } from "react";
import { motion } from "motion/react";
import { cn } from "../lib/cn";
import type { AnimatedBeamProps } from "./animated-beam.types";

// 吸取自 magicui.design Animated Beam：在容器内连接两元素，画一条带流光渐变的曲线光束（motion+SVG，必 "use client"）。
// 瑚琏化：底线/流光走 token（border + chart-1/chart-2）；ResizeObserver 带 typeof 守卫（jsdom/SSR 安全）；
// 几何随容器/元素尺寸变化重算。
export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 4,
  delay = 0,
  pathColor = "var(--color-border)",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "var(--color-chart-1)",
  gradientStopColor = "var(--color-chart-2)",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  className,
}: AnimatedBeamProps) {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [dim, setDim] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      const c = containerRef.current;
      const a = fromRef.current;
      const b = toRef.current;
      if (!c || !a || !b) return;
      const cr = c.getBoundingClientRect();
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      setDim({ w: cr.width, h: cr.height });
      const sx = ar.left - cr.left + ar.width / 2 + startXOffset;
      const sy = ar.top - cr.top + ar.height / 2 + startYOffset;
      const ex = br.left - cr.left + br.width / 2 + endXOffset;
      const ey = br.top - cr.top + br.height / 2 + endYOffset;
      const cx = (sx + ex) / 2;
      const cy = (sy + ey) / 2 - curvature;
      setPathD(`M ${sx},${sy} Q ${cx},${cy} ${ex},${ey}`);
    };
    update();
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      const ro = new ResizeObserver(update);
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    }
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  const grad = reverse
    ? { x1: ["90%", "-10%"], x2: ["100%", "0%"] }
    : { x1: ["10%", "110%"], x2: ["0%", "100%"] };

  return (
    <svg
      fill="none"
      width={dim.w}
      height={dim.h}
      viewBox={`0 0 ${dim.w} ${dim.h}`}
      className={cn("pointer-events-none absolute left-0 top-0", className)}
      aria-hidden
    >
      <path d={pathD} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" />
      <path d={pathD} stroke={`url(#${id})`} strokeWidth={pathWidth} strokeLinecap="round" />
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
          animate={{ x1: grad.x1, x2: grad.x2, y1: ["0%", "0%"], y2: ["0%", "0%"] }}
          transition={{ delay, duration, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
        >
          <stop stopColor={gradientStartColor} stopOpacity={0} />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity={0} />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}
