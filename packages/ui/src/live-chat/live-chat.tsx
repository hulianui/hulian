"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import { Avatar } from "../avatar";
import type { LiveChatItem, LiveChatProps } from "./live-chat.types";

/** 距底 px 阈值内即视为「在底部」。 */
const BOTTOM_THRESHOLD = 24;

export function LiveChat({
  items,
  pinned,
  autoScroll = true,
  maxItems = 200,
  renderItem,
  overlay = false,
  className,
}: LiveChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const [unread, setUnread] = useState(0);

  const windowed = items.length > maxItems ? items.slice(-maxItems) : items;

  // 新消息到达：在底部则贴底；否则累计未读、浮出恢复钮。
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (autoScroll && atBottom.current) {
      el.scrollTop = el.scrollHeight;
      setUnread(0);
    } else {
      setUnread((u) => u + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    atBottom.current = dist <= BOTTOM_THRESHOLD;
    if (atBottom.current && unread) setUnread(0);
  };

  const resume = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    atBottom.current = true;
    setUnread(0);
  };

  return (
    <div className={cn("relative flex min-h-0 flex-col", className)}>
      {pinned && pinned.length > 0 && (
        <div className="mb-1 space-y-1">
          {pinned.map((it) => (
            <div
              key={it.id}
              className="rounded-[var(--radius)] border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs text-foreground"
            >
              <span className="mr-1 font-semibold text-primary">置顶</span>
              {it.text}
            </div>
          ))}
        </div>
      )}
      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {windowed.map((it) => (
          <div key={it.id}>{renderItem ? renderItem(it) : <DefaultRow item={it} overlay={overlay} />}</div>
        ))}
      </div>
      {unread > 0 && (
        <button
          type="button"
          onClick={resume}
          className="absolute inset-x-0 bottom-1 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-md transition hover:bg-primary-hover"
        >
          {unread} 条新消息 ↓
        </button>
      )}
    </div>
  );
}

function LevelBadge({ level }: { level: number }) {
  return (
    <span className="mr-1 inline-flex shrink-0 items-center rounded bg-chart-2/85 px-1 text-[10px] font-bold leading-4 text-white">
      {level}
    </span>
  );
}

function DefaultRow({ item, overlay }: { item: LiveChatItem; overlay?: boolean }) {
  // 浅色态（叠加在视频上）：主文字白、次要文字半透白，带文字阴影。
  const nameMuted = overlay ? "text-white/65" : "text-muted";
  const body = overlay ? "text-white" : "text-foreground";
  const shadow = overlay ? "[text-shadow:0_1px_3px_rgba(0,0,0,0.6)]" : "";

  if (item.type === "system") {
    return <div className={cn("text-center text-xs", overlay ? "text-white/70" : "text-muted", shadow)}>{item.text}</div>;
  }
  if (item.type === "enter") {
    return (
      <div className={cn("text-xs", nameMuted, shadow)}>
        <span className="text-chart-3">{item.user?.name}</span> 来了
      </div>
    );
  }
  if (item.type === "follow") {
    return (
      <div className={cn("text-xs", shadow)}>
        <span className="font-medium text-chart-1">{item.user?.name}</span>
        <span className={nameMuted}> 关注了主播 ❤</span>
      </div>
    );
  }
  if (item.type === "gift") {
    return (
      <div className={cn("flex items-center gap-1.5 rounded-[var(--radius)] bg-chart-4/15 px-2 py-1 text-xs", shadow)}>
        <span className={cn("font-medium", body)}>{item.user?.name}</span>
        <span className={nameMuted}>送出</span>
        <span className="font-semibold text-chart-4">
          {item.gift?.icon} {item.gift?.name}
        </span>
        {item.gift?.combo && item.gift.combo > 1 && (
          <span className="font-bold text-chart-1">×{item.gift.combo}</span>
        )}
      </div>
    );
  }
  // message
  return (
    <div className={cn("flex items-start gap-2 text-sm", shadow)}>
      {item.user?.avatar !== undefined && (
        <Avatar size="sm" src={item.user.avatar} alt={item.user.name} fallback={item.user.name?.[0]} />
      )}
      <div className="min-w-0 leading-snug">
        {item.user?.level != null && <LevelBadge level={item.user.level} />}
        {item.user?.badge}
        <span className={cn("mr-1", nameMuted)}>{item.user?.name}：</span>
        <span className={body}>{item.text}</span>
      </div>
    </div>
  );
}
