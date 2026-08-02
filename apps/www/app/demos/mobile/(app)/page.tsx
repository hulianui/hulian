"use client";
import { copy } from "./page.content";
import { demoHref } from "../../_components/demo-locale";
import Link from "next/link";
import { useState } from "react";
import { Avatar, Fab, ListSkeleton, PullToRefresh, Rating, Tag, toast } from "@hulianui/ui";
import { useMockData, sleep } from "../../lib/async";
import { services } from "../_data/services";

// 一键下单图标
function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden>
      <path d="M7 2v11h3v9l7-12h-4l4-8z" />
    </svg>
  );
}
// 客服图标
function HeadsetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="20" height="20" aria-hidden>
      <path d="M3 18v-6a9 9 0 0118 0v6" />
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
    </svg>
  );
}
// 收藏图标
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="20" height="20" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

const TAG_TONE: Record<string, "neutral" | "brand" | "success" | "warning" | "danger"> = { 爆款: "danger", 好评: "success", 热门: "warning", 急修: "danger", 包搬运: "neutral", 快速上门: "danger", 保修: "success", 超值: "warning" };

export default function HomePage() {
  const { data, loading } = useMockData(services, { delay: 600 });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = async () => {
    await sleep(900);
    setRefreshKey((k) => k + 1);
    toast({ title: copy("serviceListRefreshed"), tone: "neutral" });
  };

  return (
    <div className="relative h-full">
      <PullToRefresh onRefresh={handleRefresh} className="h-full">
        {/* 顶部搜索栏 */}
        <div className="sticky top-0 z-10 bg-surface px-4 pb-3 pt-2">
          <div className="flex items-center gap-2 rounded-xl bg-surface-hover px-3 py-2 text-sm text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16" aria-hidden>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span>{copy("searchCleaningRepairsManicures")}</span>
          </div>
        </div>

        {/* Banner */}
        <div className="mx-4 mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/70 px-5 py-4 text-primary-foreground">
          <div className="text-lg font-bold">{copy("atHomeServicesBookWithConfidence")}</div>
          <div className="mt-0.5 text-sm opacity-85">{copy("verifiedProfessionalsAtHomeServiceSatisfactionGuaranteed")}</div>
          <div className="mt-2 inline-block rounded-lg bg-primary-foreground/20 px-3 py-1 text-xs font-medium">

            {copy("newCustomersSave20")}
          </div>
        </div>

        {/* 服务列表 */}
        <div className="px-4 pb-4">
          <div className="mb-3 text-sm font-semibold text-foreground">{copy("popularServices")}</div>
          {loading ? (
            <ListSkeleton rows={4} />
          ) : (
            <div key={refreshKey} className="flex flex-col gap-3">
              {(data ?? services).map((s) => (
                <Link
                  key={s.id}
                  href={demoHref(`/demos/mobile/services/${s.id}`)}
                  className="flex gap-3 rounded-2xl border border-border bg-surface p-3 hover:bg-surface-hover transition-colors"
                >
                  {/* 封面 */}
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl">
                    <img src={s.cover} alt={s.title} className="h-full w-full object-cover" />
                  </div>
                  {/* 信息 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-1.5">
                      <span className="truncate text-sm font-medium">{s.title}</span>
                      <Tag tone={TAG_TONE[s.tag] ?? "neutral"} size="sm" className="shrink-0">
                        {s.tag}
                      </Tag>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <Rating value={s.rating} readOnly size="sm" />
                      <span className="text-xs text-muted">{s.rating} ({s.reviewCount})</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Avatar fallback={s.workerAvatar} size="sm" />
                        <span className="text-xs text-muted">{s.workerName}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        ¥{s.price}
                        <span className="text-xs font-normal text-muted">/{s.unit}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* FAB：多动作展开（底部偏移避与 TabBar 重叠） */}
      <Fab
        aria-label={copy("quickActions")}
        size="sm"
        className="bottom-24 right-4"
        actions={[
          {
            key: "order",
            icon: <BoltIcon />,
            label: copy("bookInstantly"),
            onClick: () => toast({ title: copy("openingTheBookingPage"), tone: "neutral" }),
          },
          {
            key: "service",
            icon: <HeadsetIcon />,
            label: copy("liveSupport"),
            onClick: () => toast({ title: copy("connectingYouWithSupport"), tone: "info" }),
          },
          {
            key: "collect",
            icon: <HeartIcon />,
            label: copy("myFavorites"),
            onClick: () => toast({ title: copy("viewFavorites"), tone: "neutral" }),
          },
        ]}
        position="bottom-right"
      />
    </div>
  );
}
