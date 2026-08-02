"use client";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button, Card, CardBody, Chip, Heading, Rating, Tag, Text, toast } from "@hulianui/ui";
interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviewCount: number;
    tag: string;
    tagTone: "brand" | "danger" | "warning" | "success" | "neutral";
    gradient: string;
}
const PRODUCTS: Product[] = [
    {
        id: "p1",
        name: "Premium Reversible Mulberry Silk Pillowcase",
        price: 298,
        originalPrice: 498,
        rating: 4.8,
        reviewCount: 3241,
        tag: "New product launch",
        tagTone: "brand",
        gradient: "from-rose-200 via-pink-100 to-fuchsia-200",
    },
    {
        id: "p2",
        name: "Ergonomic office chair with adjustable lumbar support",
        price: 1299,
        originalPrice: 1899,
        rating: 4.7,
        reviewCount: 8876,
        tag: "Limited time flash sale",
        tagTone: "danger",
        gradient: "from-sky-200 via-blue-100 to-indigo-200",
    },
    {
        id: "p3",
        name: "OLED Eye-Care Desk Lamp Pro Max",
        price: 459,
        originalPrice: 599,
        rating: 4.9,
        reviewCount: 12034,
        tag: "Best seller",
        tagTone: "warning",
        gradient: "from-amber-200 via-yellow-100 to-orange-200",
    },
    {
        id: "p4",
        name: "Bamboo fiber quick-drying bath towel set 3 pieces",
        price: 128,
        originalPrice: 198,
        rating: 4.6,
        reviewCount: 5523,
        tag: "Environmental certification",
        tagTone: "success",
        gradient: "from-emerald-200 via-green-100 to-teal-200",
    },
    {
        id: "p5",
        name: "Nordic style ceramic tableware set 16 pieces",
        price: 368,
        originalPrice: 568,
        rating: 4.5,
        reviewCount: 2198,
        tag: "Gift box",
        tagTone: "brand",
        gradient: "from-violet-200 via-purple-100 to-pink-200",
    },
    {
        id: "p6",
        name: "Gooseneck pour-over coffee set",
        price: 218,
        originalPrice: 318,
        rating: 4.8,
        reviewCount: 6701,
        tag: "Barista recommendation",
        tagTone: "neutral",
        gradient: "from-stone-200 via-amber-100 to-yellow-100",
    },
    {
        id: "p7",
        name: "Over-ear ANC headphones",
        price: 799,
        originalPrice: 1199,
        rating: 4.7,
        reviewCount: 21456,
        tag: "Top-selling electronics",
        tagTone: "danger",
        gradient: "from-slate-200 via-gray-100 to-zinc-200",
    },
    {
        id: "p8",
        name: "Natural latex mattress 180\u00D7200cm",
        price: 2188,
        originalPrice: 3588,
        rating: 4.9,
        reviewCount: 4392,
        tag: "Imported raw materials",
        tagTone: "success",
        gradient: "from-cyan-200 via-sky-100 to-blue-200",
    },
];
function formatPrice(n: number) {
    return `\u00A5${n.toLocaleString("zh-CN", { minimumFractionDigits: 0 })}`;
}
function ProductCard({ product }: {
    product: Product;
}) {
    const [added, setAdded] = useState(false);
    const discount = Math.round((product.price / product.originalPrice) * 10 * 10) / 10;
    const handleAdd = () => {
        setAdded(true);
        toast({ title: `Added to cart: ${product.name}`, tone: "info" });
        setTimeout(() => setAdded(false), 2000);
    };
    return (<Card variant="outline" className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">

      <div className={`aspect-square w-full bg-gradient-to-br ${product.gradient} flex items-center justify-center`} aria-hidden>
        <span className="text-4xl opacity-30">🛍</span>
      </div>

      <CardBody className="flex flex-1 flex-col gap-2 p-3">

        <Tag tone={product.tagTone} size="sm" variant="soft" className="self-start">
          {product.tag}
        </Tag>


        <Text size="sm" className="line-clamp-2 font-medium text-foreground leading-snug">
          {product.name}
        </Text>


        <div className="flex items-center gap-1.5">
          <Rating value={product.rating} readOnly size="sm"/>
          <Text size="xs" tone="muted">
            {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()})
          </Text>
        </div>


        <div className="flex items-end gap-2">
          <span className="text-lg font-bold text-danger">{formatPrice(product.price)}</span>
          <span className="text-xs text-muted line-through">{formatPrice(product.originalPrice)}</span>
          <Chip size="sm" tone="danger" variant="soft" className="ml-auto shrink-0">
            {discount}% of list price
          </Chip>
        </div>


        <Button size="sm" variant={added ? "solid" : "outline"} className="mt-auto w-full" onClick={handleAdd}>
          <ShoppingCart className="mr-1.5 size-3.5" aria-hidden/>
          {added ? "Added to cart" : "Add to cart"}
        </Button>
      </CardBody>
    </Card>);
}
export function ProductGridBlock() {
    return (<div className="mx-auto w-full max-w-5xl">
      <div className="mb-5 flex items-baseline justify-between">
        <Heading level={2} size="lg" weight="semibold">
          You may also like
        </Heading>
        <Text size="sm" tone="muted">
          All products · {PRODUCTS.length} items
        </Text>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {PRODUCTS.map((p) => (<ProductCard key={p.id} product={p}/>))}
      </div>
    </div>);
}
