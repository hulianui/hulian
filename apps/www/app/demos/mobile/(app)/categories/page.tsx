"use client";
import Link from "next/link";
import { useState } from "react";
import { Avatar, CardSkeleton, Divider, Rating, Tag } from "@hulian/ui";
import { useMockData } from "../../../lib/async";
import { CATEGORIES, services } from "../../_data/services";
import type { ServiceCategory } from "../../_data/types";
import { serviceCover } from "../../_lib/cover";

const TAG_TONE = { 爆款: "danger", 好评: "success", 热门: "warning", 急修: "primary", 包搬运: "neutral", 快速上门: "primary", 保修: "success", 超值: "warning" } as const;

const CATEGORY_ICON: Record<ServiceCategory, string> = {
  家政保洁: "🧹",
  家电维修: "🔧",
  上门美甲: "💅",
  管道疏通: "🔩",
  搬家搬运: "📦",
  开锁换锁: "🔑",
};

export default function CategoriesPage() {
  const [selected, setSelected] = useState<ServiceCategory>("家政保洁");
  const { data, loading } = useMockData(services, { delay: 500 });

  const filtered = (data ?? services).filter((s) => s.category === selected);

  return (
    <div className="flex h-[580px] overflow-hidden">
      {/* 左侧分类导航 */}
      <div className="w-[88px] shrink-0 overflow-y-auto border-r border-border bg-surface-hover">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelected(cat)}
            className={`flex w-full flex-col items-center gap-1 px-2 py-3 text-center text-[11px] transition-colors ${selected === cat ? "bg-surface font-semibold text-primary" : "text-muted hover:text-foreground"}`}
          >
            <span className="text-2xl leading-none">{CATEGORY_ICON[cat]}</span>
            <span className="leading-tight">{cat}</span>
            {selected === cat && (
              <div className="h-0.5 w-6 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* 右侧服务列表 */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">{CATEGORY_ICON[selected]}</span>
          <span className="text-sm font-semibold">{selected}</span>
          <Tag tone="neutral" size="sm">{filtered.length} 个服务</Tag>
        </div>
        <Divider className="mb-3" />
        {loading ? (
          <CardSkeleton count={3} />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((s) => (
              <Link
                key={s.id}
                href={`/demos/mobile/services/${s.id}`}
                className="flex gap-3 rounded-xl border border-border bg-surface p-3 hover:bg-surface-hover transition-colors"
              >
                <div className="size-14 shrink-0 overflow-hidden rounded-lg">
                  <img src={serviceCover(s.category, s.title)} alt={s.title} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.title}</div>
                  <div className="mt-0.5 flex items-center gap-1">
                    <Rating value={s.rating} readOnly size="sm" />
                    <span className="text-xs text-muted">{s.reviewCount} 评</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Avatar fallback={s.workerAvatar} size="sm" />
                      <span className="text-xs text-muted">{s.workerName}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">¥{s.price}/{s.unit}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
