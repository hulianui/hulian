"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import {
  allocateTrack,
  densityGap,
  estimateWidth,
  leastBusyTrack,
  scrollDuration,
  trackFreeTime,
} from "./danmaku-geometry";
import type { DanmakuItem, DanmakuProps } from "./danmaku.types";

const FONT_SIZE = { sm: 14, md: 18, lg: 24 } as const;
const LINE_FACTOR = 1.9;
const STATIC_DWELL = 4000; // top/bottom 停留 ms

interface ActiveScroll {
  key: string;
  item: DanmakuItem;
  top: number;
  fontSize: number;
  distance: number; // 位移 px（负向）
  duration: number; // s
}
interface ActiveStatic {
  key: string;
  item: DanmakuItem;
  fontSize: number;
}

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : 0;
}

function textOf(text: DanmakuItem["text"]): string {
  return typeof text === "string" ? text : "弹幕弹幕弹幕"; // 非字符串按中等宽度估算
}

export function Danmaku({
  items,
  tracks = 4,
  speed = 100,
  density = "normal",
  area = 1,
  opacity = 1,
  paused = false,
  className,
}: DanmakuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [scroll, setScroll] = useState<ActiveScroll[]>([]);
  const [topItems, setTopItems] = useState<ActiveStatic[]>([]);
  const [bottomItems, setBottomItems] = useState<ActiveStatic[]>([]);
  const seen = useRef<Set<string>>(new Set());
  const trackFreeAt = useRef<number[]>([]);
  const seq = useRef(0);

  // 测量容器（首帧 + resize）
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 消费新增弹幕
  useEffect(() => {
    if (size.w === 0) return;
    const gap = densityGap(density);
    const lineH = FONT_SIZE.md * LINE_FACTOR;
    const usable = Math.max(1, Math.min(tracks, Math.floor((size.h * area) / lineH) || 1));
    if (trackFreeAt.current.length !== usable) {
      trackFreeAt.current = Array.from({ length: usable }, () => 0);
    }
    const fresh: ActiveScroll[] = [];
    const freshTop: ActiveStatic[] = [];
    const freshBottom: ActiveStatic[] = [];
    for (const item of items) {
      if (seen.current.has(item.id)) continue;
      seen.current.add(item.id);
      const fontSize = FONT_SIZE[item.size ?? "md"];
      const mode = item.mode ?? "scroll";
      const key = `${item.id}#${seq.current++}`;
      if (mode === "scroll") {
        const t = now();
        let track = allocateTrack(trackFreeAt.current, t);
        if (track === -1) {
          if (density === "high") track = leastBusyTrack(trackFreeAt.current);
          else continue; // 丢弃
        }
        const width = estimateWidth(textOf(item.text), fontSize);
        trackFreeAt.current[track] = trackFreeTime(t, width, speed, gap);
        fresh.push({
          key,
          item,
          top: track * lineH + 4,
          fontSize,
          distance: -(size.w + width),
          duration: scrollDuration(size.w, width, speed),
        });
      } else if (mode === "top") {
        freshTop.push({ key, item, fontSize });
      } else {
        freshBottom.push({ key, item, fontSize });
      }
    }
    if (fresh.length) setScroll((p) => [...p, ...fresh]);
    if (freshTop.length) {
      setTopItems((p) => [...p, ...freshTop]);
      freshTop.forEach((f) =>
        setTimeout(() => setTopItems((p) => p.filter((x) => x.key !== f.key)), STATIC_DWELL),
      );
    }
    if (freshBottom.length) {
      setBottomItems((p) => [...p, ...freshBottom]);
      freshBottom.forEach((f) =>
        setTimeout(() => setBottomItems((p) => p.filter((x) => x.key !== f.key)), STATIC_DWELL),
      );
    }
    // 防 seen 无限膨胀
    if (seen.current.size > 5000) {
      seen.current = new Set(items.map((i) => i.id));
    }
  }, [items, size, tracks, speed, density, area]);

  const removeScroll = (key: string) => setScroll((p) => p.filter((x) => x.key !== key));

  return (
    <div
      ref={ref}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
      aria-hidden
    >
      {scroll.map((s) => (
        <span
          key={s.key}
          onAnimationEnd={() => removeScroll(s.key)}
          className="absolute left-full whitespace-nowrap font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]"
          style={
            {
              top: s.top,
              fontSize: s.fontSize,
              color: s.item.color ?? "white",
              fontWeight: s.item.bold ? 700 : 500,
              "--dm-x": `${s.distance}px`,
              animation: `hulian-danmaku-scroll ${s.duration}s linear forwards`,
              animationPlayState: paused ? "paused" : "running",
            } as CSSProperties
          }
        >
          {s.item.text}
        </span>
      ))}
      {topItems.length > 0 && (
        <div className="absolute inset-x-0 top-1 flex flex-col items-center gap-1">
          {topItems.map((s) => (
            <StaticBadge key={s.key} s={s} />
          ))}
        </div>
      )}
      {bottomItems.length > 0 && (
        <div className="absolute inset-x-0 bottom-2 flex flex-col-reverse items-center gap-1">
          {bottomItems.map((s) => (
            <StaticBadge key={s.key} s={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function StaticBadge({ s }: { s: ActiveStatic }) {
  return (
    <span
      className="rounded-full bg-black/45 px-3 py-0.5 font-semibold backdrop-blur-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
      style={{ fontSize: s.fontSize, color: s.item.color ?? "white" }}
    >
      {s.item.text}
    </span>
  );
}
