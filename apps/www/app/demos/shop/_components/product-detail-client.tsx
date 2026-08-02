"use client";
import { copy } from "./product-detail-client.content";
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
} from "@hulianui/ui";
import { productById, productGallery, formatPrice } from "../_data/products";
import { ReviewSection } from "./review-section";
import { SHOP_BASE } from "./nav-config";
import { useShop } from "../_lib/shop-store";

const ANCHOR_ITEMS = [
  { href: "#detail", title: copy("productDetails") },
  { href: "#spec", title: copy("specifications") },
  { href: "#reviews", title: copy("customerReviews") },
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
              <th className="border border-border px-3 py-2">{copy("shoeSize")}</th>
              <th className="border border-border px-3 py-2">{copy("footLengthCm")}</th>
              <th className="border border-border px-3 py-2">{copy("recommendedWeightKg")}</th>
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
              <th className="border border-border px-3 py-2">{copy("optionSize")}</th>
              <th className="border border-border px-3 py-2">{copy("chestCm")}</th>
              <th className="border border-border px-3 py-2">{copy("waistCm")}</th>
              <th className="border border-border px-3 py-2">{copy("heightCm")}</th>
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
      <p className="text-xs text-muted">{copy("measurementsAreAGuideOnlyReferToTheProductLabelForFinalSizing")}</p>
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

        {copy("productNotFound")}
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
    if (soldOut) { toast({ title: copy("thisItemIsSoldOut"), tone: "danger" }); return; }
    if (!selectedColorObj) { toast({ title: copy("chooseAColor"), tone: "danger" }); return; }
    if (!selectedSize) { toast({ title: copy("chooseAnOption"), tone: "danger" }); return; }
    addToCart({
      productId: product.id,
      color: selectedColorObj.name,
      size: selectedSize,
      qty,
      price: product.price,
    });
    toast({ title: `${copy("addedToCart")}${product.name}${copy("selectedOptionsSeparator")}${selectedColorObj.name} · ${selectedSize} × ${qty}${copy("selectedOptionsClose")}`, tone: "info" });
  };

  const handleBuyNow = () => {
    if (soldOut) { toast({ title: copy("thisItemIsSoldOut"), tone: "danger" }); return; }
    if (!selectedColorObj) { toast({ title: copy("chooseAColorFirst"), tone: "danger" }); return; }
    if (!selectedSize) { toast({ title: copy("chooseAnOptionFirst"), tone: "danger" }); return; }
    handleAddToCart();
    toast({ title: copy("openingCheckoutDemo"), tone: "info" });
  };

  const handleFav = () => {
    const added = toggleFavorite(product.id);
    toast({ title: added ? copy("addedToFavorites") : copy("removedFromFavorites"), tone: "info" });
  };

  const breadcrumbItems = [
    { label: copy("home"), href: SHOP_BASE },
    { label: copy("allProducts"), href: `${SHOP_BASE}/products` },
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
              aria-label={copy("productGalleryLabel", product.name)}
            >
              {gallery.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={copy("productImageAlt", product.name, i + 1)}
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
              {product.flashSale && <Tag tone="danger" size="sm">{copy("flashSale")}</Tag>}
              {product.isNew && <Tag tone="brand" size="sm">{copy("new")}</Tag>}
              {soldOut && <Tag tone="neutral" size="sm">{copy("soldOut")}</Tag>}
            </div>
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            <p className="mt-1 text-sm text-muted">{product.tagline}</p>
          </div>

          {/* 评分 + 销量 */}
          <div className="flex items-center gap-3 text-sm text-muted">
            <Rating value={product.rating} readOnly size="sm" />
            <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
            <span>·</span>
            <span>{product.reviewCount.toLocaleString()}  {copy("reviews")}</span>
            <span>·</span>
            <span>{copy("monthlySales")} {product.sales.toLocaleString()}</span>
          </div>

          {/* 价格 */}
          <div className="rounded-[var(--radius)] bg-surface-hover px-4 py-3">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-danger">{formatPrice(product.price)}</span>
              {discount != null && (
                <>
                  <span className="text-sm text-muted line-through">{formatPrice(product.originalPrice)}</span>
                  <Chip size="sm" tone="danger" variant="soft">{discount}{copy("ofListPrice")}</Chip>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">{copy("taxIncludedFreeNationwideShippingRemoteAreasExcluded")}</p>
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
              <span className="text-sm font-medium text-foreground">{copy("color")}</span>
              <span className="text-sm text-muted">{selectedColorObj?.name ?? copy("select")}</span>
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
              <span className="text-sm font-medium text-foreground">{copy("optionSize")}</span>
              {product.sizes.some((s) => /^\d{2}$/.test(s) || ["S","M","L","XL","XXL"].includes(s)) && (
                <button
                  type="button"
                  onClick={() =>
                    modal.info({
                      title: copy("sizeChart"),
                      content: <SizeGuideContent sizes={product.sizes} />,
                    })
                  }
                  className="flex items-center gap-0.5 text-xs text-primary hover:underline"
                >
                  <Ruler className="size-3" />

                  {copy("sizeGuide")}
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
              <p className="mb-1.5 text-sm font-medium text-foreground">{copy("quantity")}</p>
              <NumberField
                value={qty}
                min={1}
                max={product.stock > 0 ? product.stock : 1}
                onValueChange={(v) => setQty(v ?? 1)}
              />
            </div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-foreground">

                {copy("stock")}
                <span className={`ml-2 text-xs font-normal ${soldOut ? "text-danger" : "text-muted"}`}>
                  {soldOut ? copy("soldOut") : copy("stockRemaining", product.stock)}
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

              {copy("addToCart")}
            </Button>
            <Button
              size="lg"
              disabled={soldOut}
              onClick={handleBuyNow}
              className="flex-1"
            >
              <Zap className="mr-2 size-4" />

              {copy("buyNow")}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={handleFav}
              aria-label={isFav ? copy("removeFromFavorites") : copy("addToFavorites")}
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
            <h2 className="mb-4 text-lg font-semibold text-foreground">{copy("productDetails")}</h2>

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
              <CollapsibleTrigger>{copy("showMoreProductInformation")}</CollapsibleTrigger>
              <CollapsiblePanel>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
                  <p>

                    {copy("developedBy")}{product.brand}{copy("thisProductCombinesAdvancedManufacturingWithThoughtfulDesignToDeliverAnExceptionalExperienceInEv")}
                  </p>
                  <p>

                    {copy("reviewTheSpecificationsBeforeOrderingAndContactSupportWithAnyQuestionsSevenDayReturnsAndShipping")}
                  </p>
                  {/* 程序化详情图 */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {gallery.slice(1).map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={src}
                        alt={copy("detailImageAlt", product.name, i + 2)}
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
            <h2 className="mb-4 text-lg font-semibold text-foreground">{copy("specifications")}</h2>
            <Descriptions bordered column={2}>
              <DescriptionsItem label={copy("brand")}>{product.brand}</DescriptionsItem>
              <DescriptionsItem label={copy("category")}>{product.subCategory}</DescriptionsItem>
              <DescriptionsItem label={copy("productId")}>{product.id.toUpperCase()}</DescriptionsItem>
              <DescriptionsItem label={copy("rating")}>{product.rating.toFixed(1)} / 5.0</DescriptionsItem>
              <DescriptionsItem label={copy("monthlySales")}>{product.sales.toLocaleString()}  {copy("items")}</DescriptionsItem>
              <DescriptionsItem label={copy("stock")}>{soldOut ? copy("outOfStock") : copy("stockCount", product.stock)}</DescriptionsItem>
              <DescriptionsItem label={copy("colorOptions")} span={2}>
                {product.colors.map((c) => c.name).join(copy("listSeparator"))}
              </DescriptionsItem>
              <DescriptionsItem label={copy("sizeCapacity")} span={2}>
                {product.sizes.join(copy("listSeparator"))}
              </DescriptionsItem>
              <DescriptionsItem label={copy("features")} span={2}>
                {product.tags.join(copy("listSeparator"))}
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
                  · {selectedColorObj.name} · {selectedSize || copy("noOptionSelected")}
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

                {copy("addToCart")}
              </Button>
              <Button disabled={soldOut} onClick={handleBuyNow} size="sm">
                <Zap className="mr-1.5 size-4" />

                {copy("buyNow")}
              </Button>
            </div>
          </div>
        </div>
      </Affix>
    </div>
  );
}
