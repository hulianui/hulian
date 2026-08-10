"use client";
import { copy } from "./control-board.content";
import { useEffect, useRef, useState } from "react";
import { Eye, Heart, MessageSquare, Wallet } from "lucide-react";
import {
  AreaChart,
  Danmaku,
  GiftFeed,
  LiveChat,
  LivePlayer,
  NumberTicker,
  Stat,
} from "@hulianui/ui";
import { useLiveSim } from "../../_lib/use-live-sim";
import { STREAMER } from "../../_data/content";
import { CopilotPanel } from "./copilot-panel";

interface TrendPoint {
  t: string;
  viewers: number;
  sales: number;
}

export function ControlBoard() {
  const { state, send } = useLiveSim();
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const idx = useRef(0);

  // 滚动趋势：每次在线人数变化采样一点（实时迷你折线）。
  useEffect(() => {
    setTrend((prev) => {
      const next = [...prev, { t: `${idx.current++}`, viewers: state.viewers, sales: Math.round(state.sales / 100) }];
      return next.length > 24 ? next.slice(next.length - 24) : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.viewers]);

  const askSeq = useRef(0);
  const ask = (q: string) => send({ type: "ASK_AI", id: `ask-${askSeq.current++}`, question: q });

  return (
    // xl 下整盘填满视口高度、各列内部滚动（弹幕/副驾不再撑高整页）；窄屏回退为自然流。
    <div className="grid gap-4 p-4 xl:h-full xl:min-h-0 xl:overflow-hidden xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.95fr)_minmax(0,1.05fr)]">
      {/* 左列：预览 + KPI + 趋势 */}
      <div className="space-y-4 xl:min-h-0 xl:overflow-y-auto xl:pr-1">
        <LivePlayer
          src="/demo/sample-video.mp4"
          viewers={state.viewers}
          qualities={[copy("bluRay1080p"), copy("ultraHd"), copy("hd")]}
          host={{ name: STREAMER.name, meta: STREAMER.meta, followed: true, onFollow: () => {} }}
          overlay={
            <>
              <Danmaku items={state.danmaku} tracks={4} speed={96} area={0.7} />
              <GiftFeed events={state.gifts} className="absolute bottom-16 left-3 w-60" />
            </>
          }
          footer={
            <div className="flex items-center gap-3 bg-gradient-to-t from-black/55 to-transparent px-3 pb-2.5 pt-8 text-[11px] text-white/85">
              <span>{copy("chat")} {state.comments.toLocaleString()}</span>
              <span>·</span>
              <span>{copy("like")} {Math.round(state.likes / 1000)}k</span>
              <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5">{copy("hostPreview")}</span>
            </div>
          }
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard icon={<Eye className="size-4" />} label={copy("liveViewers")} value={state.viewers} delta={3.2} />
          <KpiCard icon={<Heart className="size-4" />} label={copy("totalLikes")} value={state.likes} delta={5.1} />
          <KpiCard icon={<MessageSquare className="size-4" />} label={copy("chatMessages")} value={state.comments} delta={2.4} />
          <KpiCard icon={<Wallet className="size-4" />} label={copy("revenueCny")} value={state.sales} delta={8.7} />
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-surface p-4">
          <div className="mb-2 text-sm font-medium text-foreground">{copy("viewersSalesTrend")}</div>
          <AreaChart
            data={trend}
            xKey="t"
            height={180}
            series={[
              { key: "viewers", label: copy("viewers"), color: "var(--color-chart-1)" },
              { key: "sales", label: copy("salesCnyHundreds"), color: "var(--color-chart-4)" },
            ]}
          />
        </div>
      </div>

      {/* 中列：弹幕监看（定高 + 内部滚动，弹幕只在框内滚不撑高整页） */}
      <div className="flex h-[70vh] min-h-0 flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-surface xl:h-full">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-3.5 py-3">
          <span className="text-sm font-semibold text-foreground">{copy("liveChatMonitor")}</span>
          <span className="text-[11px] text-muted-foreground">{copy("live")}</span>
        </div>
        <LiveChat
          items={state.chat}
          pinned={[{ id: "rule", type: "system", text: copy("shopResponsiblyBewareOfScamsGiveawayOpensAt800") }]}
          className="min-h-0 flex-1 p-3"
        />
      </div>

      {/* 右列：AI 副驾（定高 + 内部滚动） */}
      <div className="h-[70vh] min-h-0 overflow-hidden xl:h-full">
        <CopilotPanel
          suggestions={state.suggestions}
          comments={state.comments}
          onAdopt={(id) => send({ type: "ADOPT_SUGGESTION", id })}
          onAsk={ask}
        />
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  delta,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  delta: number;
}) {
  return (
    <Stat
      label={
        <span className="flex items-center gap-1.5">
          <span className="text-muted-foreground">{icon}</span>
          {label}
        </span>
      }
      value={<NumberTicker value={value} className="tabular-nums" />}
      delta={delta}
    />
  );
}
