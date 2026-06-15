"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import { Avatar } from "../avatar";
import { applyGiftEvent } from "./gift-feed-merge";
import type { GiftBanner, GiftFeedProps } from "./gift-feed.types";

export function GiftFeed({ events, max = 3, duration = 4000, className }: GiftFeedProps) {
  const [banners, setBanners] = useState<GiftBanner[]>([]);
  const processed = useRef(0);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    // events 默认 append-only，但消费方可能整体重置成更短数组（清空 / 切直播间）。
    // 此时 length < 已处理高位，从 0 重新消费整条新流，避免新事件被陈旧计数静默吞掉。
    if (events.length < processed.current) processed.current = 0;
    if (events.length <= processed.current) return;
    const fresh = events.slice(processed.current);
    processed.current = events.length;
    setBanners((prev) => fresh.reduce((acc, ev) => applyGiftEvent(acc, ev, max), prev));
    // 每条新事件重置其 id 的消散计时
    for (const ev of fresh) {
      const old = timers.current.get(ev.id);
      if (old) clearTimeout(old);
      const t = setTimeout(() => {
        setBanners((p) => p.filter((b) => b.id !== ev.id));
        timers.current.delete(ev.id);
      }, duration);
      timers.current.set(ev.id, t);
    }
  }, [events, max, duration]);

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  return (
    <div className={cn("pointer-events-none flex flex-col gap-2", className)} aria-hidden>
      {banners.map((b) => (
        <div
          key={b.id}
          className="flex items-center gap-2 rounded-full bg-black/55 py-1 pl-1 pr-3 text-white shadow-lg backdrop-blur-sm"
          style={{ animation: "hulian-gift-in 240ms ease-out both" }}
        >
          <Avatar size="sm" src={b.user.avatar} alt={b.user.name} fallback={b.user.name[0]} />
          <div className="leading-tight">
            <div className="text-xs font-medium">{b.user.name}</div>
            <div className="text-[11px] text-white/75">
              送出 {b.gift.name} {b.gift.icon}
            </div>
          </div>
          <div className="ml-1 flex items-center gap-1">
            <span
              key={b.bounce}
              className="text-xl font-black italic tabular-nums"
              style={
                {
                  color: b.gift.color ?? "var(--color-chart-1)",
                  animation: "hulian-gift-combo 420ms ease-out",
                } as CSSProperties
              }
            >
              ×{b.combo}
            </span>
          </div>
          <span className="text-2xl">{b.gift.icon}</span>
        </div>
      ))}
    </div>
  );
}
