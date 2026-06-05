"use client";
import { Statistic, Tag, Heading, Text, Skeleton } from "@hulianui/ui";
import { Clock } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "../product-card";
import type { Product } from "../../_data/types";
import { SHOP_BASE } from "../nav-config";

interface Props {
  products: Product[];
  /** 秒杀截止时间戳（ms），由父组件 useState 初始化避免 hydration mismatch */
  deadline: number;
  loading: boolean;
}

/** 限时秒杀专区：倒计时 + ProductCard 列 */
export function HomeFlashSale({ products, deadline, loading }: Props) {
  return (
    <section aria-labelledby="home-flash-title">
      {/* 标题区：左侧标题 + 倒计时，右侧"查看全部" */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Tag tone="danger" size="sm" className="shrink-0">
            限时秒杀
          </Tag>
          <Heading level={2} size="lg" id="home-flash-title">
            今日秒杀
          </Heading>
          <div className="flex items-center gap-1.5 rounded-[var(--radius)] bg-danger/10 px-2.5 py-1 text-danger">
            <Clock className="size-3.5 shrink-0" aria-hidden />
            <Text size="xs" className="text-danger font-medium">
              距结束
            </Text>
            {deadline > 0 && (
              <Statistic.Countdown
                deadline={deadline}
                format="HH:mm:ss"
                valueStyle={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-danger)" }}
              />
            )}
          </div>
        </div>
        <Link
          href={`${SHOP_BASE}/products?flash=1`}
          className="text-sm text-primary hover:underline"
        >
          查看全部 →
        </Link>
      </div>

      {/* 商品卡片区 */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded-[var(--radius)]" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
