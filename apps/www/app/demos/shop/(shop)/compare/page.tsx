"use client";
import React, { useState } from "react";
import { Button, Empty, Chip, Rating, Tag, toast } from "@hulianui/ui";
import { products, productById, productImage, formatPrice } from "../../_data/products";
import { useShop } from "../../_lib/shop-store";
import type { Product } from "../../_data/types";
import { SHOP_BASE } from "../../_components/nav-config";
import Link from "next/link";

// 默认对比 4 件商品（取前 4 种不同品类，演示差异）
const DEFAULT_IDS = ["p-hp-pro", "p-hs-air", "p-hb-x9", "p-hw-fit"];

// 对比维度定义
type Dim = {
  label: string;
  key: keyof Product | "price_block" | "rating_block" | "tags_block" | "highlights_block" | "action";
  highlight?: boolean;
};

const DIMS: Dim[] = [
  { label: "商品图", key: "action" },
  { label: "品牌", key: "brand" },
  { label: "品类", key: "subCategory" },
  { label: "现价", key: "price_block", highlight: true },
  { label: "评分 / 销量", key: "rating_block", highlight: true },
  { label: "库存", key: "stock" },
  { label: "卖点标签", key: "tags_block" },
  { label: "一句话卖点", key: "tagline" },
  { label: "商品亮点", key: "highlights_block" },
];

function cellValue(product: Product, dim: Dim["key"]): React.ReactNode {
  switch (dim) {
    case "price_block":
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-lg font-bold text-danger">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-muted line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      );
    case "rating_block":
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Rating value={product.rating} readOnly size="sm" />
            <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-muted">
            {product.reviewCount.toLocaleString()} 评 · {product.sales > 9999 ? `${(product.sales / 10000).toFixed(1)}万` : product.sales}+ 销
          </span>
        </div>
      );
    case "tags_block":
      return (
        <div className="flex flex-wrap gap-1">
          {product.tags.map((t) => (
            <Chip key={t} size="sm" variant="soft" tone="brand">{t}</Chip>
          ))}
        </div>
      );
    case "highlights_block":
      return (
        <ul className="flex flex-col gap-1">
          {product.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-1 text-xs text-muted">
              <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {h}
            </li>
          ))}
        </ul>
      );
    case "action":
      return null; // 专门处理
    case "stock":
      return product.stock > 0 ? (
        <span className="text-sm text-success">{product.stock} 件</span>
      ) : (
        <Tag tone="neutral" size="sm">售罄</Tag>
      );
    default: {
      const val = product[dim as keyof Product];
      return <span className="text-sm">{String(val ?? "—")}</span>;
    }
  }
}

// 找出某维度所有列里「最优值」索引（用于高亮：price 最低、rating 最高、stock 最多）
function bestIndexes(prods: Product[], dim: Dim["key"]): Set<number> {
  if (dim === "price_block") {
    const min = Math.min(...prods.map((p) => p.price));
    return new Set(prods.map((p, i) => (p.price === min ? i : -1)).filter((i) => i >= 0));
  }
  if (dim === "rating_block") {
    const max = Math.max(...prods.map((p) => p.rating));
    return new Set(prods.map((p, i) => (p.rating === max ? i : -1)).filter((i) => i >= 0));
  }
  if (dim === "stock") {
    const max = Math.max(...prods.map((p) => p.stock));
    if (max === 0) return new Set();
    return new Set(prods.map((p, i) => (p.stock === max ? i : -1)).filter((i) => i >= 0));
  }
  return new Set();
}

export default function ComparePage() {
  const { addToCart } = useShop();
  const [compareIds, setCompareIds] = useState<string[]>(DEFAULT_IDS);

  const compareProducts = compareIds.map((id) => productById[id]).filter(Boolean) as Product[];

  const removeProduct = (id: string) => {
    setCompareIds((prev) => prev.filter((p) => p !== id));
    toast({ title: "已从对比中移除", tone: "info" });
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({ title: "该商品已售罄", tone: "danger" });
      return;
    }
    addToCart({
      productId: product.id,
      color: product.colors[0]?.name ?? "默认",
      size: product.sizes[0] ?? "默认",
      qty: 1,
      price: product.price,
    });
    toast({ title: `已将「${product.name}」加入购物车`, tone: "info" });
  };

  if (compareProducts.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <Empty title="暂无对比商品" description="请先从商品列表中选择要对比的商品">
          <Button tone="brand" onClick={() => (window.location.href = `${SHOP_BASE}/products`)}>
            去选商品
          </Button>
        </Empty>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">商品对比</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">已选 {compareProducts.length} 件商品</span>
          {compareIds.length < products.length && (
            <Link href={`${SHOP_BASE}/products`}>
              <Button variant="outline" size="sm">+ 添加商品</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius)] border border-border bg-surface">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-28" />
            {compareProducts.map((p) => (
              <col key={p.id} style={{ width: `${Math.floor(72 / compareProducts.length)}%` }} />
            ))}
          </colgroup>

          <thead>
            <tr className="border-b border-border bg-surface-hover">
              <th className="p-3 text-left text-xs font-medium text-muted">对比项</th>
              {compareProducts.map((product) => (
                <th key={product.id} className="p-3">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={productImage(product, 0, 200, 200)}
                        alt={product.name}
                        className="size-20 rounded-[var(--radius)] object-cover"
                      />
                      {product.isNew && (
                        <Tag tone="brand" size="sm" className="absolute -right-2 -top-2">新品</Tag>
                      )}
                    </div>
                    <Link href={`${SHOP_BASE}/product/${product.id}`} className="hover:underline">
                      <span className="line-clamp-2 text-sm font-medium text-foreground text-center">
                        {product.name}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="text-xs text-muted hover:text-danger transition-colors"
                      aria-label={`移除 ${product.name}`}
                    >
                      移除
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {DIMS.filter((d) => d.key !== "action").map((dim, dimIdx) => {
              const best = dim.highlight ? bestIndexes(compareProducts, dim.key) : new Set<number>();
              return (
                <tr
                  key={dim.key}
                  className={`border-b border-border last:border-0 ${dimIdx % 2 === 0 ? "bg-surface" : "bg-surface-hover/40"}`}
                >
                  <td className="p-3 text-xs font-medium text-muted align-top">{dim.label}</td>
                  {compareProducts.map((product, colIdx) => (
                    <td
                      key={product.id}
                      className={`p-3 align-top text-sm ${
                        best.has(colIdx) ? "bg-success/8 ring-1 ring-success/20 ring-inset" : ""
                      }`}
                    >
                      {best.has(colIdx) && (
                        <Tag tone="success" size="sm" className="mb-1">最优</Tag>
                      )}
                      {cellValue(product, dim.key)}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* 操作行 */}
            <tr className="border-t border-border bg-surface">
              <td className="p-3 text-xs font-medium text-muted">操作</td>
              {compareProducts.map((product) => (
                <td key={product.id} className="p-3">
                  <div className="flex flex-col gap-2">
                    <Button
                      tone="brand"
                      size="sm"
                      className="w-full"
                      disabled={product.stock <= 0}
                      onClick={() => handleAddToCart(product)}
                    >
                      {product.stock <= 0 ? "已售罄" : "加入购物车"}
                    </Button>
                    <Link href={`${SHOP_BASE}/product/${product.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        查看详情
                      </Button>
                    </Link>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted text-center">
        绿色高亮为该维度最优值 · 价格最低 · 评分最高 · 库存最多
      </p>
    </main>
  );
}
