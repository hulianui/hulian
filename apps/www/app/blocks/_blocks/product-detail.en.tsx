"use client";
import { useState } from "react";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { Button, Carousel, Chip, ColorSwatchPicker, Meter, NumberField, Rating, Tag, toast, } from "@hulianui/ui";
const SLIDES = [
    "from-rose-200 via-pink-100 to-fuchsia-200",
    "from-sky-200 via-blue-100 to-indigo-200",
    "from-amber-200 via-yellow-100 to-orange-200",
    "from-emerald-200 via-green-100 to-teal-100",
];
const COLORS = [
    { hex: "#e11d48", name: "Rose Red" },
    { hex: "#2563eb", name: "sapphire blue" },
    { hex: "#d97706", name: "Amber yellow" },
    { hex: "#10b981", name: "mint green" },
    { hex: "#1e1b4b", name: "midnight black" },
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const PRODUCT = {
    name: "Light luxury silk pillowcase double-sided mulberry silk",
    tagline: "22-momme Grade A mulberry silk \u00B7 Reversible design \u00B7 Better sleep",
    price: 298,
    originalPrice: 498,
    rating: 4.8,
    reviewCount: 3241,
    sales: 8800,
    stock: 37,
    isNew: true,
    flashSale: true,
    tags: ["Mulberry silk", "Skin-friendly and supple", "Gift box", "Double sided"],
};
function formatPrice(n: number) {
    return `\u00A5${n.toLocaleString("zh-CN", { minimumFractionDigits: 0 })}`;
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
            title: `Added to cart: ${PRODUCT.name} (${selectedColorObj?.name} \u00B7 ${selectedSize} \u00D7 ${qty})`,
            tone: "info",
        });
    };
    const handleBuyNow = () => {
        toast({ title: "Opening checkout... (demo)", tone: "info" });
    };
    const handleFav = () => {
        setFav((v) => !v);
        toast({ title: fav ? "Canceled favorites" : "Added to favorites", tone: "info" });
    };
    return (<div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-col gap-8 lg:flex-row">

        <div className="lg:w-[400px] shrink-0">
          <Carousel className="w-full rounded-[var(--radius)] overflow-hidden border border-border" showDots showArrows loop aria-label={`${PRODUCT.name} Product gallery`}>
            {SLIDES.map((gradient, i) => (<div key={i} className={`aspect-square w-full bg-gradient-to-br ${gradient} flex items-center justify-center`} aria-label={`Product image ${i + 1}`}>
                <span className="text-6xl opacity-25">🛍</span>
              </div>))}
          </Carousel>
        </div>


        <div className="flex-1 min-w-0 space-y-5">

          <div className="flex flex-wrap gap-1.5">
            {PRODUCT.flashSale && (<Tag tone="danger" size="sm">
                Limited time flash sale
              </Tag>)}
            {PRODUCT.isNew && (<Tag tone="brand" size="sm">
                New product
              </Tag>)}
          </div>


          <div>
            <h2 className="text-2xl font-bold text-foreground">{PRODUCT.name}</h2>
            <p className="mt-1 text-sm text-muted">{PRODUCT.tagline}</p>
          </div>


          <div className="flex items-center gap-3 text-sm text-muted">
            <Rating value={PRODUCT.rating} readOnly size="sm"/>
            <span className="font-medium text-foreground">{PRODUCT.rating.toFixed(1)}</span>
            <span>·</span>
            <span>{PRODUCT.reviewCount.toLocaleString()} reviews</span>
            <span>·</span>
            <span>sold this month {PRODUCT.sales.toLocaleString()}</span>
          </div>


          <div className="rounded-[var(--radius)] bg-surface-hover px-4 py-3">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-danger">{formatPrice(PRODUCT.price)}</span>
              <span className="text-sm text-muted line-through">
                {formatPrice(PRODUCT.originalPrice)}
              </span>
              <Chip size="sm" tone="danger" variant="soft">
                {discount}% of list price
              </Chip>
            </div>
            <p className="mt-1 text-xs text-muted">Tax included · Free shipping nationwide (except remote areas)</p>
          </div>


          <div className="flex flex-wrap gap-2">
            {PRODUCT.tags.map((t) => (<Chip key={t} size="sm" variant="outline" tone="brand">
                {t}
              </Chip>))}
          </div>


          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Color</span>
              <span className="text-sm text-muted">{selectedColorObj?.name ?? "Please select"}</span>
            </div>
            <ColorSwatchPicker colors={COLORS.map((c) => c.hex)} value={selectedColor} onValueChange={setSelectedColor} size="md" aria-label="Color palette"/>
          </div>


          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Specifications</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (<button key={s} type="button" onClick={() => setSelectedSize(s)} aria-pressed={selectedSize === s}>
                  <Chip size="sm" variant={selectedSize === s ? "solid" : "outline"} tone={selectedSize === s ? "brand" : "neutral"}>
                    {s}
                  </Chip>
                </button>))}
            </div>
          </div>


          <div className="flex items-end gap-6">
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">Quantity</p>
              <NumberField value={qty} min={1} max={PRODUCT.stock} onValueChange={(v) => setQty(v ?? 1)} aria-label="Product quantity"/>
            </div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-foreground">
                Inventory
                <span className="ml-2 text-xs font-normal text-muted">Remaining {PRODUCT.stock} items</span>
              </p>
              <Meter value={PRODUCT.stock} max={100}/>
            </div>
          </div>


          <div className="flex flex-wrap gap-3">
            <Button size="lg" variant="outline" onClick={handleAddToCart} className="flex-1">
              <ShoppingCart className="mr-2 size-4" aria-hidden/>
              Add to cart
            </Button>
            <Button size="lg" onClick={handleBuyNow} className="flex-1">
              <Zap className="mr-2 size-4" aria-hidden/>
              Buy now
            </Button>
            <Button size="lg" variant="ghost" onClick={handleFav} aria-label={fav ? "Remove from favorites" : "Add to favorites"}>
              <Heart className={`size-5 ${fav ? "fill-danger text-danger" : ""}`}/>
            </Button>
          </div>
        </div>
      </div>
    </div>);
}
