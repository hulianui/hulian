"use client";
import { useRef, useState } from "react";
import { ChevronRight, Heart, Ruler, ShoppingCart, Zap } from "lucide-react";
import {
  Affix,
  Anchor,
  Breadcrumb,
  Button,
  Carousel,
  Chip,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  ColorSwatchPicker,
  Descriptions,
  DescriptionsItem,
  Lens,
  Meter,
  NumberField,
  Rating,
  Tag,
  modal,
  toast,
} from "@hulian/ui";
import { productById, productGallery, formatPrice } from "../_data/products";
import { ReviewSection } from "./review-section";
import { SHOP_BASE } from "./nav-config";
import { useShop } from "../_lib/shop-store";

const ANCHOR_ITEMS = [
  { href: "#detail", title: "商品详情" },
  { href: "#spec", title: "规格参数" },
  { href: "#reviews", title: "用户评价" },
];

/** 尺码对照表内容 */
function SizeGuideContent({ sizes }: { sizes: string[] }) {
  const isNumeric = sizes.some((s) => /^\d{2}$/.test(s));
  return (
    <div className="space-y-3 text-sm text-foreground">
      {isNumeric ? (
        <table className="w-full border-collapse text-center text-xs">
          <thead>
            <tr className="bg-surface-hover">
              <th className="border border-border px-3 py-2">码数</th>
              <th className="border border-border px-3 py-2">脚长 (cm)</th>
              <th className="border border-border px-3 py-2">建议净体重 (kg)</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((s) => {
              const cm = (Number(s) - 10).toFixed(0);
              const weight = `${Number(s) * 1.5 - 30}–${Number(s) * 1.5 - 25}`;
              return (
                <tr key={s} className="even:bg-surface-hover/50">
                  <td className="border border-border px-3 py-1.5">{s}</td>
                  <td className="border border-border px-3 py-1.5">{cm}</td>
                  <td className="border border-border px-3 py-1.5">{weight}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <table className="w-full border-collapse text-center text-xs">
          <thead>
            <tr className="bg-surface-hover">
              <th className="border border-border px-3 py-2">规格</th>
              <th className="border border-border px-3 py-2">胸围 (cm)</th>
              <th className="border border-border px-3 py-2">腰围 (cm)</th>
              <th className="border border-border px-3 py-2">身高 (cm)</th>
            </tr>
          </thead>
          <tbody>
            {sizes.slice(0, 5).map((s, i) => (
              <tr key={s} className="even:bg-surface-hover/50">
                <td className="border border-border px-3 py-1.5 font-medium">{s}</td>
                <td className="border border-border px-3 py-1.5">{84 + i * 4}</td>
                <td className="border border-border px-3 py-1.5">{66 + i * 4}</td>
                <td className="border border-border px-3 py-1.5">{155 + i * 5}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="text-xs text-muted">* 以上数据仅供参考，实际以商品吊牌为准</p>
    </div>
  );
}

export function ProductDetailClient({ productId }: { productId: string }) {
  const product = productById[productId];
  const { addToCart, isFavorite, toggleFavorite } = useShop();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.hex ?? "");
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] ?? "");
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="flex min-h-96 items-center justify-center text-muted">
        商品不存在
      </div>
    );
  }

  const gallery = productGallery(product, 600, 600);
  const isFav = isFavorite(product.id);
  const soldOut = product.stock <= 0;
  const discount = product.originalPrice > product.price
    ? Math.round((product.price / product.originalPrice) * 10 * 10) / 10
    : null;
  const selectedColorObj = product.colors.find((c) => c.hex === selectedColor);

  const handleAddToCart = () => {
    if (soldOut) { toast({ title: "该商品已售罄", tone: "danger" }); return; }
    if (!selectedColorObj) { toast({ title: "请选择颜色", tone: "danger" }); return; }
    if (!selectedSize) { toast({ title: "请选择规格", tone: "danger" }); return; }
    addToCart({
      productId: product.id,
      color: selectedColorObj.name,
      size: selectedSize,
      qty,
      price: product.price,
    });
    toast({ title: `已加入购物车：${product.name}（${selectedColorObj.name} · ${selectedSize} × ${qty}）`, tone: "info" });
  };

  const handleBuyNow = () => {
    if (soldOut) { toast({ title: "该商品已售罄", tone: "danger" }); return; }
    if (!selectedColorObj) { toast({ title: "请先选择颜色", tone: "danger" }); return; }
    if (!selectedSize) { toast({ title: "请先选择规格", tone: "danger" }); return; }
    handleAddToCart();
    toast({ title: "跳转结算页面…（demo 演示）", tone: "info" });
  };

  const handleFav = () => {
    const added = toggleFavorite(product.id);
    toast({ title: added ? "已加入收藏" : "已取消收藏", tone: "info" });
  };

  const breadcrumbItems = [
    { label: "首页", href: SHOP_BASE },
    { label: "全部商品", href: `${SHOP_BASE}/products` },
    { label: product.name },
  ];

  return (
    <div ref={scrollRef} className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      <div className="flex gap-8 lg:flex-row flex-col">
        {/* 左侧：图廊 */}
        <div className="lg:w-[440px] shrink-0">
          <Lens zoom={2.2} className="w-full rounded-[var(--radius)] overflow-hidden border border-border">
            <Carousel
              className="w-full"
              showDots
              showArrows
              aria-label={`${product.name} 商品图廊`}
            >
              {gallery.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`${product.name} 图片 ${i + 1}`}
                  className="aspect-square w-full object-cover"
                />
              ))}
            </Carousel>
          </Lens>
        </div>

        {/* 右侧：商品信息 + SKU */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* 名称 + 标签 */}
          <div>
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {product.flashSale && <Tag tone="danger" size="sm">限时秒杀</Tag>}
              {product.isNew && <Tag tone="brand" size="sm">新品</Tag>}
              {soldOut && <Tag tone="neutral" size="sm">售罄</Tag>}
            </div>
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            <p className="mt-1 text-sm text-muted">{product.tagline}</p>
          </div>

          {/* 评分 + 销量 */}
          <div className="flex items-center gap-3 text-sm text-muted">
            <Rating value={product.rating} readOnly size="sm" />
            <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
            <span>·</span>
            <span>{product.reviewCount.toLocaleString()} 条评价</span>
            <span>·</span>
            <span>月售 {product.sales.toLocaleString()}</span>
          </div>

          {/* 价格 */}
          <div className="rounded-[var(--radius)] bg-surface-hover px-4 py-3">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-danger">{formatPrice(product.price)}</span>
              {discount != null && (
                <>
                  <span className="text-sm text-muted line-through">{formatPrice(product.originalPrice)}</span>
                  <Chip size="sm" tone="danger" variant="soft">{discount}折</Chip>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">含税 · 全国包邮（偏远地区除外）</p>
          </div>

          {/* 卖点 tags */}
          <div className="flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <Chip key={t} size="sm" variant="outline" tone="brand">{t}</Chip>
            ))}
          </div>

          {/* 颜色 SKU */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">颜色</span>
              <span className="text-sm text-muted">{selectedColorObj?.name ?? "请选择"}</span>
            </div>
            <ColorSwatchPicker
              colors={product.colors.map((c) => c.hex)}
              value={selectedColor}
              onValueChange={setSelectedColor}
              size="md"
            />
          </div>

          {/* 尺寸/容量 SKU */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">规格</span>
              {product.sizes.some((s) => /^\d{2}$/.test(s) || ["S","M","L","XL","XXL"].includes(s)) && (
                <button
                  type="button"
                  onClick={() =>
                    modal.info({
                      title: "尺码对照表",
                      content: <SizeGuideContent sizes={product.sizes} />,
                    })
                  }
                  className="flex items-center gap-0.5 text-xs text-primary hover:underline"
                >
                  <Ruler className="size-3" />
                  尺码对照
                  <ChevronRight className="size-3" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
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

          {/* 数量 + 库存 */}
          <div className="flex items-center gap-4">
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">数量</p>
              <NumberField
                value={qty}
                min={1}
                max={product.stock > 0 ? product.stock : 1}
                onValueChange={(v) => setQty(v ?? 1)}
              />
            </div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-foreground">
                库存
                <span className={`ml-2 text-xs font-normal ${soldOut ? "text-danger" : "text-muted"}`}>
                  {soldOut ? "售罄" : `剩余 ${product.stock} 件`}
                </span>
              </p>
              <Meter
                value={soldOut ? 0 : Math.min(product.stock, 500)}
                max={500}
              />
            </div>
          </div>

          {/* 加购 + 收藏 */}
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              variant="outline"
              disabled={soldOut}
              onClick={handleAddToCart}
              className="flex-1"
            >
              <ShoppingCart className="mr-2 size-4" />
              加入购物车
            </Button>
            <Button
              size="lg"
              disabled={soldOut}
              onClick={handleBuyNow}
              className="flex-1"
            >
              <Zap className="mr-2 size-4" />
              立即购买
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={handleFav}
              aria-label={isFav ? "取消收藏" : "加入收藏"}
            >
              <Heart className={`size-5 ${isFav ? "fill-danger text-danger" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* 详情区 + 锚点 */}
      <div className="mt-10 flex gap-8">
        {/* 锚点侧边导航 */}
        <div className="hidden lg:block">
          <Anchor
            items={ANCHOR_ITEMS}
            offsetTop={80}
            getContainer={() => null}
            className="sticky top-20 w-32"
          />
        </div>

        {/* 主内容 */}
        <div className="min-w-0 flex-1 space-y-2">
          {/* 商品详情 */}
          <section id="detail" className="scroll-mt-20 py-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">商品详情</h2>

            {/* 卖点 highlights */}
            <div className="mb-4 space-y-2">
              {product.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  {h}
                </div>
              ))}
            </div>

            {/* 长描述 Collapsible */}
            <Collapsible>
              <CollapsibleTrigger>展开更多商品说明</CollapsibleTrigger>
              <CollapsiblePanel>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
                  <p>
                    本商品由{product.brand}精心研制，融合先进工艺与匠心设计，力求在每一个细节上给用户带来卓越体验。
                    我们严格把控原材料选择与生产工艺，确保每件产品都达到最高品质标准。
                  </p>
                  <p>
                    购买前请仔细阅读规格参数，如有疑问可联系客服。支持 7 天无理由退换货，
                    运费险全程保障，让您购物无忧。
                  </p>
                  {/* 程序化详情图 */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {gallery.slice(1).map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={src}
                        alt={`${product.name} 详情图 ${i + 2}`}
                        className="w-full rounded-[var(--radius)] object-cover"
                      />
                    ))}
                  </div>
                </div>
              </CollapsiblePanel>
            </Collapsible>
          </section>

          {/* 规格参数 */}
          <section id="spec" className="scroll-mt-20 border-t border-border py-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">规格参数</h2>
            <Descriptions bordered column={2}>
              <DescriptionsItem label="品牌">{product.brand}</DescriptionsItem>
              <DescriptionsItem label="品类">{product.subCategory}</DescriptionsItem>
              <DescriptionsItem label="商品编号">{product.id.toUpperCase()}</DescriptionsItem>
              <DescriptionsItem label="评分">{product.rating.toFixed(1)} / 5.0</DescriptionsItem>
              <DescriptionsItem label="月销量">{product.sales.toLocaleString()} 件</DescriptionsItem>
              <DescriptionsItem label="库存">{soldOut ? "暂无货" : `${product.stock} 件`}</DescriptionsItem>
              <DescriptionsItem label="颜色规格" span={2}>
                {product.colors.map((c) => c.name).join("、")}
              </DescriptionsItem>
              <DescriptionsItem label="尺寸/容量" span={2}>
                {product.sizes.join("、")}
              </DescriptionsItem>
              <DescriptionsItem label="卖点标签" span={2}>
                {product.tags.join("、")}
              </DescriptionsItem>
            </Descriptions>
          </section>

          {/* 用户评价 */}
          <div className="border-t border-border">
            <ReviewSection productId={productId} />
          </div>
        </div>
      </div>

      {/* 吸底购买栏 */}
      <Affix offsetBottom={0} affixedClassName="shadow-2xl border-t border-border">
        <div className="bg-surface/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-danger">{formatPrice(product.price)}</span>
              {discount != null && (
                <span className="text-xs text-muted line-through">{formatPrice(product.originalPrice)}</span>
              )}
              {selectedColorObj && (
                <span className="text-sm text-muted">
                  · {selectedColorObj.name} · {selectedSize || "未选规格"}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={soldOut}
                onClick={handleAddToCart}
                size="sm"
              >
                <ShoppingCart className="mr-1.5 size-4" />
                加入购物车
              </Button>
              <Button disabled={soldOut} onClick={handleBuyNow} size="sm">
                <Zap className="mr-1.5 size-4" />
                立即购买
              </Button>
            </div>
          </div>
        </div>
      </Affix>
    </div>
  );
}
