"use client";
import { copy } from "./product-card.content";
import Link from "next/link";
import { Card, CardBody, Rating, Tag, Chip, toast } from "@hulianui/ui";
import { Heart, ShoppingCart } from "lucide-react";
import { productImage, formatCompactCount, formatPrice } from "../_data/products";
import type { Product } from "../_data/types";
import { useShop } from "../_lib/shop-store";
import { SHOP_BASE } from "./nav-config";

function discountPct(price: number, original: number) {
  if (original <= price) return null;
  return Math.round((price / original) * 10 * 10) / 10; // 如 6.9 折
}

/** 商品卡片：图 + 名 + 评分 + 价格(现价/划线/折扣) + 卖点 chip + 收藏/加购。共享于首页/列表/收藏/对比。 */
export function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite, addToCart } = useShop();
  const fav = isFavorite(product.id);
  const pct = discountPct(product.price, product.originalPrice);
  const soldOut = product.stock <= 0;

  const onFav = (e: React.MouseEvent) => {
    e.preventDefault();
    const added = toggleFavorite(product.id);
    toast({ title: added ? copy("addedToFavorites") : copy("removedFromFavorites"), tone: "info" });
  };

  const onQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (soldOut) {
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
    toast({ title: `${copy("addedToCart")}${product.name}`, tone: "info" });
  };

  return (
    <Link href={`${SHOP_BASE}/product/${product.id}`} className="group block focus:outline-none">
      <Card
        variant="elevated"
        className="h-full overflow-hidden transition-transform group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-ring"
      >
        <div className="relative aspect-square overflow-hidden bg-surface-hover">
          {/* 程序化生成 data-URI 图，离线零素材 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productImage(product, 0, 600, 600)}
            alt={product.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {product.flashSale && <Tag tone="danger" size="sm" variant="solid" className="shadow-sm">{copy("flashSale")}</Tag>}
            {product.isNew && <Tag tone="brand" size="sm" variant="solid" className="shadow-sm">{copy("new")}</Tag>}
            {soldOut && <Tag tone="neutral" size="sm" variant="solid" className="shadow-sm">{copy("soldOut")}</Tag>}
          </div>
          <button
            type="button"
            onClick={onFav}
            aria-label={fav ? copy("removeFromFavorites") : copy("addToFavorites")}
            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-surface/90 text-muted shadow-sm backdrop-blur transition-colors hover:text-danger"
          >
            <Heart className={`size-4 ${fav ? "fill-danger text-danger" : ""}`} aria-hidden />
          </button>
        </div>

        <CardBody className="flex flex-col gap-2 p-3">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-foreground">{product.name}</h3>
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
            <span className="shrink-0">
              <Rating value={product.rating} readOnly size="sm" />
            </span>
            <span className="truncate whitespace-nowrap">
              {product.rating.toFixed(1)} · {formatCompactCount(product.sales)}{copy("sold")}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((t) => (
              <Chip key={t} size="sm" variant="soft" tone="brand">
                {t}
              </Chip>
            ))}
          </div>
          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0">
              <span className="text-lg font-bold text-danger">{formatPrice(product.price)}</span>
              {pct != null && (
                <>
                  <span className="text-xs text-muted line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="whitespace-nowrap text-[11px] font-medium text-danger">{pct}{copy("ofListPrice")}</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={onQuickAdd}
              aria-label={copy("addToCart")}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              <ShoppingCart className="size-4" aria-hidden />
            </button>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
