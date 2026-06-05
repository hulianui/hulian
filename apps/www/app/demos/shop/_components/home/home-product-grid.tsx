"use client";
import { Skeleton, Heading, Text, Result, Button } from "@hulianui/ui";
import { ProductCard } from "../product-card";
import type { Product } from "../../_data/types";

interface Props {
  products: Product[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
}

/** 猜你喜欢 / 全部好物商品网格（带完整加载/错误态） */
export function HomeProductGrid({ products, loading, error, onReload }: Props) {
  return (
    <section aria-labelledby="home-goods-title">
      <div className="mb-4 flex items-baseline justify-between">
        <Heading level={2} size="lg" id="home-goods-title">
          猜你喜欢
        </Heading>
        <Text size="sm" tone="muted">
          全部好物 · {products.length} 件
        </Text>
      </div>

      {/* 错误态 */}
      {error && !loading && (
        <Result
          status="error"
          title="加载失败"
          subTitle={error}
        >
          <Button onClick={onReload}>重新加载</Button>
        </Result>
      )}

      {/* 加载态：Skeleton 占位 */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded-[var(--radius)]" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* 数据态 */}
      {!loading && !error && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
