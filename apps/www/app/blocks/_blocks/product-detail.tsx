"use client";

// 商品详情主体区块 —— 左侧 Carousel 多图（渐变占位）+ 右侧信息栏。
// 信息栏含：标题/评分/价格/ColorSwatchPicker 选色/规格 Chip/NumberField 数量/加购+立即购买双按钮/库存 Meter。
// 所有数据内联，复制即独立运行，无任何外部依赖。

import { useState } from "react";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import {
  Button,
  Carousel,
  Chip,
  ColorSwatchPicker,
  Meter,
  NumberField,
  Rating,
  Tag,
  toast,
} from "@hulianui/ui";

// ---- 内联 mock 数据 ----
const SLIDES = [
  "from-rose-200 via-pink-100 to-fuchsia-200",
  "from-sky-200 via-blue-100 to-indigo-200",
  "from-amber-200 via-yellow-100 to-orange-200",
  "from-emerald-200 via-green-100 to-teal-100",
];

const COLORS = [
  { hex: "#e11d48", name: "玫瑰红" },
  { hex: "#2563eb", name: "宝石蓝" },
  { hex: "#d97706", name: "琥珀黄" },
  { hex: "#10b981", name: "薄荷绿" },
  { hex: "#1e1b4b", name: "午夜黑" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const PRODUCT = {
  name: "轻奢蚕丝枕套双面桑蚕丝",
  tagline: "22 momme A 级桑蚕丝 · 双面设计 · 更新睡眠体验",
  price: 298,
  originalPrice: 498,
  rating: 4.8,
  reviewCount: 3241,
  sales: 8800,
  stock: 37,
  isNew: true,
  flashSale: true,
  tags: ["桑蚕丝", "亲肤柔顺", "礼盒装", "双面"],
};

function formatPrice(n: number) {
  return `¥${n.toLocaleString("zh-CN", { minimumFractionDigits: 0 })}`;
}

export function ProductDetailBlock() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0].hex);
  const [selectedSize, setSelectedSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);

  const selectedColorObj = COLORS.find((c) => c.hex === selectedColor);
  const discount = Math.round((PRODUCT.price / PRODUCT.originalPrice) * 10 * 10) / 10;

  const handleAddToCart = () => {
    toast({
      title: `已加入购物车：${PRODUCT.name}（${selectedColorObj?.name} · ${selectedSize} × ${qty}）`,
      tone: "info",
    });
  };

  const handleBuyNow = () => {
    toast({ title: "跳转结算页面…（演示）", tone: "info" });
  };

  const handleFav = () => {
    setFav((v) => !v);
    toast({ title: fav ? "已取消收藏" : "已加入收藏", tone: "info" });
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* 左侧：Carousel 多图 */}
        <div className="lg:w-[400px] shrink-0">
          <Carousel
            className="w-full rounded-[var(--radius)] overflow-hidden border border-border"
            showDots
            showArrows
            loop
            aria-label={`${PRODUCT.name} 商品图廊`}
          >
            {SLIDES.map((gradient, i) => (
              <div
                key={i}
                className={`aspect-square w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
                aria-label={`商品图片 ${i + 1}`}
              >
                <span className="text-6xl opacity-25">🛍</span>
              </div>
            ))}
          </Carousel>
        </div>

        {/* 右侧：商品信息 */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* 标签行 */}
          <div className="flex flex-wrap gap-1.5">
            {PRODUCT.flashSale && <Tag tone="danger" size="sm">限时秒杀</Tag>}
            {PRODUCT.isNew && <Tag tone="brand" size="sm">新品</Tag>}
          </div>

          {/* 名称 + 副标题 */}
          <div>
            <h2 className="text-2xl font-bold text-foreground">{PRODUCT.name}</h2>
            <p className="mt-1 text-sm text-muted">{PRODUCT.tagline}</p>
          </div>

          {/* 评分 + 销量 */}
          <div className="flex items-center gap-3 text-sm text-muted">
            <Rating value={PRODUCT.rating} readOnly size="sm" />
            <span className="font-medium text-foreground">{PRODUCT.rating.toFixed(1)}</span>
            <span>·</span>
            <span>{PRODUCT.reviewCount.toLocaleString()} 条评价</span>
            <span>·</span>
            <span>月售 {PRODUCT.sales.toLocaleString()}</span>
          </div>

          {/* 价格 */}
          <div className="rounded-[var(--radius)] bg-surface-hover px-4 py-3">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-danger">{formatPrice(PRODUCT.price)}</span>
              <span className="text-sm text-muted line-through">{formatPrice(PRODUCT.originalPrice)}</span>
              <Chip size="sm" tone="danger" variant="soft">{discount}折</Chip>
            </div>
            <p className="mt-1 text-xs text-muted">含税 · 全国包邮（偏远地区除外）</p>
          </div>

          {/* 卖点 tags */}
          <div className="flex flex-wrap gap-2">
            {PRODUCT.tags.map((t) => (
              <Chip key={t} size="sm" variant="outline" tone="brand">{t}</Chip>
            ))}
          </div>

          {/* 颜色选择 */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">颜色</span>
              <span className="text-sm text-muted">{selectedColorObj?.name ?? "请选择"}</span>
            </div>
            <ColorSwatchPicker
              colors={COLORS.map((c) => c.hex)}
              value={selectedColor}
              onValueChange={setSelectedColor}
              size="md"
            />
          </div>

          {/* 规格选择 */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">规格</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  aria-pressed={selectedSize === s}
                >
                  <Chip
                    size="sm"
                    variant={selectedSize === s ? "solid" : "outline"}
                    tone={selectedSize === s ? "brand" : "neutral"}
                  >
                    {s}
                  </Chip>
                </button>
              ))}
            </div>
          </div>

          {/* 数量 + 库存 Meter */}
          <div className="flex items-end gap-6">
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">数量</p>
              <NumberField
                value={qty}
                min={1}
                max={PRODUCT.stock}
                onValueChange={(v) => setQty(v ?? 1)}
                aria-label="商品数量"
              />
            </div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-foreground">
                库存
                <span className="ml-2 text-xs font-normal text-muted">剩余 {PRODUCT.stock} 件</span>
              </p>
              <Meter value={PRODUCT.stock} max={100} />
            </div>
          </div>

          {/* CTA 按钮组 */}
          <div className="flex flex-wrap gap-3">
            <Button size="lg" variant="outline" onClick={handleAddToCart} className="flex-1">
              <ShoppingCart className="mr-2 size-4" aria-hidden />
              加入购物车
            </Button>
            <Button size="lg" onClick={handleBuyNow} className="flex-1">
              <Zap className="mr-2 size-4" aria-hidden />
              立即购买
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={handleFav}
              aria-label={fav ? "取消收藏" : "加入收藏"}
            >
              <Heart className={`size-5 ${fav ? "fill-danger text-danger" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
