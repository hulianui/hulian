"use client";
import { useMemo } from "react";
import { useComponentLocale, zhCN } from "../config/locale";
import { cn } from "../lib/cn";
import { groupByLane } from "./queue-lane-utils";
import type { QueueItem, QueueLaneDef, QueueLaneProps } from "./queue-lane.types";

// 优先级泳道队列板（"use client"·零依赖·纯 CSS flex 布局 + 瑚琏 token 皮肤）：
//
//  与既有 Kanban 的差异化（定位边界，勿混用）：
//   · Kanban  = 状态列 + 拖拽工作流。人移动卡片在列间流转，组件回吐 onMove 让消费者对账；
//               强调「谁该往下推进」的人工编排语义。
//   · QueueLane = 按优先级 / 分类的横向泳道队列监视器。每道是一条有序队列（FIFO + aging），
//               顺序由调度器决定（非人拖），卡片默认只读；道头聚合队列指标（深度 / 平均等待 /
//               吞吐）；超 maxVisible 折叠为「还有 N 条」，强调「积压 / 等待」语义。
//   · 故本组件不做拖拽，不持有 onMove，只暴露 onItemClick（查看 / 下钻）。
//
//  布局：orientation="horizontal"（默认）泳道横向并列（flex-row），每道竖向排队；
//        "vertical" 泳道竖向堆叠（flex-col），适合窄屏 / 侧栏。
//  道头左色条由 lane.tone 染（CSS 颜色值，调用方决定优先级配色，组件不做枚举映射）。

function QueueLaneColumn<T extends QueueItem>({
  lane,
  items,
  renderItem,
  renderLaneHeader,
  maxVisible,
  orientation,
  onItemClick,
}: {
  lane: QueueLaneDef;
  items: T[];
  renderItem: QueueLaneProps<T>["renderItem"];
  renderLaneHeader: QueueLaneProps<T>["renderLaneHeader"];
  maxVisible?: number;
  orientation: "horizontal" | "vertical";
  onItemClick: QueueLaneProps<T>["onItemClick"];
}) {
  const locale = useComponentLocale().queueLane ?? zhCN.components!.queueLane!;
  const total = items.length;
  const visible = maxVisible != null ? items.slice(0, maxVisible) : items;
  const hidden = total - visible.length;

  return (
    <section
      className={cn(
        // 泳道用极淡底色圈出，不描边——避免与内部卡片边框叠成「框中框」脏感。
        "flex flex-col rounded-[calc(var(--radius)+0.25rem)] bg-muted/40",
        orientation === "horizontal" ? "w-72 shrink-0" : "w-full",
      )}
      data-lane={lane.id}
    >
      <header className="relative px-3 pt-3">
        {/* tone 左色条：贴泳道头左缘，inline style 接受任意 CSS 颜色 / token 变量 */}
        {lane.tone ? (
          <span
            aria-hidden
            className="absolute inset-y-2 left-0 w-1 rounded-full"
            style={{ background: lane.tone }}
          />
        ) : null}
        {renderLaneHeader ? (
          renderLaneHeader(lane, items)
        ) : (
          <div className="flex items-center justify-between gap-2 pl-2">
            <span className="text-sm font-semibold text-foreground">{lane.label}</span>
            <span className="flex items-center gap-2 text-xs text-muted">
              <span className="tabular-nums">{locale.count(total)}</span>
              {lane.meta != null && <span>{lane.meta}</span>}
            </span>
          </div>
        )}
      </header>

      <ol className="flex min-h-16 flex-1 flex-col gap-2.5 p-3">
        {total === 0 ? (
          <li className="grid flex-1 place-items-center rounded-[var(--radius)] border border-dashed border-border py-6 text-xs text-muted">
            {locale.empty}
          </li>
        ) : (
          <>
            {visible.map((item, index) => {
              const clickable = onItemClick != null;
              return (
                <li
                  key={item.id}
                  {...(clickable
                    ? {
                        role: "button" as const,
                        tabIndex: 0,
                        onClick: () => onItemClick!(item),
                        onKeyDown: (e: React.KeyboardEvent) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onItemClick!(item);
                          }
                        },
                      }
                    : {})}
                  className={cn(
                    "rounded-[var(--radius)] outline-none",
                    clickable && "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  {renderItem(item, index)}
                </li>
              );
            })}
            {hidden > 0 && (
              <li className="pt-0.5 text-center text-xs text-muted">{locale.more(hidden)}</li>
            )}
          </>
        )}
      </ol>
    </section>
  );
}

export function QueueLane<T extends QueueItem = QueueItem>({
  lanes,
  items,
  renderItem,
  renderLaneHeader,
  maxVisible,
  orientation = "horizontal",
  onItemClick,
  className,
}: QueueLaneProps<T>) {
  const groups = useMemo(() => groupByLane(items, lanes), [items, lanes]);

  return (
    <div
      className={cn(
        orientation === "horizontal"
          ? // items-start：道高随各自队列长度收缩，不强行等高，避免短队列拖出大片空泳道灰块。
            "flex items-start gap-4 overflow-x-auto pb-2"
          : "flex flex-col gap-4",
        className,
      )}
    >
      {groups.map((g) => (
        <QueueLaneColumn
          key={g.lane.id}
          lane={g.lane}
          items={g.items}
          renderItem={renderItem}
          renderLaneHeader={renderLaneHeader}
          maxVisible={maxVisible}
          orientation={orientation}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
}
