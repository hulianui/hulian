"use client";
import { copy } from "./page.content";
import React, { useState } from "react";
import { Button, Empty, Chip, Rating, Tag, toast } from "@hulianui/ui";
import { products, productById, productImage, formatCompactCount, formatPrice } from "../../_data/products";
import { useShop } from "../../_lib/shop-store";
import type { Product } from "../../_data/types";
import { SHOP_BASE, SHOP_LOCATION_BASE } from "../../_components/nav-config";
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
  { label: copy("productImage"), key: "action" },
  { label: copy("brand"), key: "brand" },
  { label: copy("category"), key: "subCategory" },
  { label: copy("currentPrice"), key: "price_block", highlight: true },
  { label: copy("ratingSales"), key: "rating_block", highlight: true },
  { label: copy("stock"), key: "stock" },
  { label: copy("features"), key: "tags_block" },
  { label: copy("tagline"), key: "tagline" },
  { label: copy("highlights"), key: "highlights_block" },
];

function cellValue(product: Product, dim: Dim["key"]): React.ReactNode {
  switch (dim) {
    case "price_block":
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-lg font-bold text-danger">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
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
          <span className="text-xs text-muted-foreground">
            {product.reviewCount.toLocaleString()}  {copy("reviews")} {formatCompactCount(product.sales)}{copy("sold")}
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
            <li key={i} className="flex items-start gap-1 text-xs text-muted-foreground">
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
        <span className="text-sm text-success">{product.stock}  {copy("items")}</span>
      ) : (
        <Tag tone="neutral" size="sm">{copy("soldOut")}</Tag>
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
    toast({ title: copy("removedFromComparison"), tone: "info" });
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({ title: copy("thisItemIsSoldOut"), tone: "danger" });
      return;
    }
    addToCart({
      productId: product.id,
      color: product.colors[0]?.name ?? copy("default"),
      size: product.sizes[0] ?? copy("default"),
      qty: 1,
      price: product.price,
    });
    toast({ title: `${copy("added")}${product.name}${copy("toYourCart")}`, tone: "info" });
  };

  if (compareProducts.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <Empty title={copy("noProductsToCompare")} description={copy("chooseProductsFromTheCatalogToCompareThemHere")}>
          <Button tone="brand" onClick={() => (window.location.href = `${SHOP_LOCATION_BASE}/products`)}>

            {copy("chooseProducts")}
          </Button>
        </Empty>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{copy("productComparison")}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{copy("selected")} {compareProducts.length}  {copy("products")}</span>
          {compareIds.length < products.length && (
            <Link href={`${SHOP_BASE}/products`}>
              <Button variant="outline" size="sm">{copy("addProduct")}</Button>
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
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">{copy("comparisonItem")}</th>
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
                        <Tag tone="brand" size="sm" className="absolute -right-2 -top-2">{copy("new")}</Tag>
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
                      className="text-xs text-muted-foreground hover:text-danger transition-colors"
                      aria-label={copy("removeProduct", product.name)}
                    >

                      {copy("remove")}
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
                  <td className="p-3 text-xs font-medium text-muted-foreground align-top">{dim.label}</td>
                  {compareProducts.map((product, colIdx) => (
                    <td
                      key={product.id}
                      className={`p-3 align-top text-sm ${
                        best.has(colIdx) ? "bg-success/8 ring-1 ring-success/20 ring-inset" : ""
                      }`}
                    >
                      {best.has(colIdx) && (
                        <Tag tone="success" size="sm" className="mb-1">{copy("best")}</Tag>
                      )}
                      {cellValue(product, dim.key)}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* 操作行 */}
            <tr className="border-t border-border bg-surface">
              <td className="p-3 text-xs font-medium text-muted-foreground">{copy("actions")}</td>
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
                      {product.stock <= 0 ? copy("soldOut2") : copy("addToCart")}
                    </Button>
                    <Link href={`${SHOP_BASE}/product/${product.id}`}>
                      <Button variant="outline" size="sm" className="w-full">

                        {copy("viewDetails")}
                      </Button>
                    </Link>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground text-center">

        {copy("greenHighlightsMarkTheBestValueInEachRowLowestPriceHighestRatingOrMostStock")}
      </p>
    </main>
  );
}
