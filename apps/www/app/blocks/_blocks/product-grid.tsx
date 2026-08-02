/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

// 商品卡网格区块 —— 4 列响应式网格，卡片含渐变占位封面、标题、价格（划线原价+现价）、Rating、Tag、加购 Button。
// 封面用 CSS 渐变占位（门禁禁远程图片），复制即独立运行，无任何外部依赖。

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button, Card, CardBody, Chip, Heading, Rating, Tag, Text, toast } from "../../../lib/fixture-ui";

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
    name: "轻奢蚕丝枕套双面桑蚕丝",
    price: 298,
    originalPrice: 498,
    rating: 4.8,
    reviewCount: 3241,
    tag: "新品上市",
    tagTone: "brand",
    gradient: "from-rose-200 via-pink-100 to-fuchsia-200",
  },
  {
    id: "p2",
    name: "人体工学办公椅腰托可调",
    price: 1299,
    originalPrice: 1899,
    rating: 4.7,
    reviewCount: 8876,
    tag: "限时秒杀",
    tagTone: "danger",
    gradient: "from-sky-200 via-blue-100 to-indigo-200",
  },
  {
    id: "p3",
    name: "OLED 护眼台灯 Pro Max 版",
    price: 459,
    originalPrice: 599,
    rating: 4.9,
    reviewCount: 12034,
    tag: "热销爆款",
    tagTone: "warning",
    gradient: "from-amber-200 via-yellow-100 to-orange-200",
  },
  {
    id: "p4",
    name: "竹纤维速干浴巾套装 3 件",
    price: 128,
    originalPrice: 198,
    rating: 4.6,
    reviewCount: 5523,
    tag: "环保认证",
    tagTone: "success",
    gradient: "from-emerald-200 via-green-100 to-teal-200",
  },
  {
    id: "p5",
    name: "北欧风陶瓷餐具套装 16 件",
    price: 368,
    originalPrice: 568,
    rating: 4.5,
    reviewCount: 2198,
    tag: "礼盒装",
    tagTone: "brand",
    gradient: "from-violet-200 via-purple-100 to-pink-200",
  },
  {
    id: "p6",
    name: "手冲咖啡壶套装鹅颈细嘴",
    price: 218,
    originalPrice: 318,
    rating: 4.8,
    reviewCount: 6701,
    tag: "咖啡师推荐",
    tagTone: "neutral",
    gradient: "from-stone-200 via-amber-100 to-yellow-100",
  },
  {
    id: "p7",
    name: "无线降噪耳机头戴式 ANC",
    price: 799,
    originalPrice: 1199,
    rating: 4.7,
    reviewCount: 21456,
    tag: "3C 爆款",
    tagTone: "danger",
    gradient: "from-slate-200 via-gray-100 to-zinc-200",
  },
  {
    id: "p8",
    name: "天然乳胶床垫 180×200cm",
    price: 2188,
    originalPrice: 3588,
    rating: 4.9,
    reviewCount: 4392,
    tag: "进口原材料",
    tagTone: "success",
    gradient: "from-cyan-200 via-sky-100 to-blue-200",
  },
];

function formatPrice(n: number) {
  return `¥${n.toLocaleString("zh-CN", { minimumFractionDigits: 0 })}`;
}

function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const discount = Math.round((product.price / product.originalPrice) * 10 * 10) / 10;

  const handleAdd = () => {
    setAdded(true);
    toast({ title: `已加入购物车：${product.name}`, tone: "info" });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Card variant="outline" className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      {/* 封面：CSS 渐变占位（禁止远程图片） */}
      <div
        className={`aspect-square w-full bg-gradient-to-br ${product.gradient} flex items-center justify-center`}
        aria-hidden
      >
        <span className="text-4xl opacity-30">🛍</span>
      </div>

      <CardBody className="flex flex-1 flex-col gap-2 p-3">
        {/* 标签 */}
        <Tag tone={product.tagTone} size="sm" variant="soft" className="self-start">
          {product.tag}
        </Tag>

        {/* 名称 */}
        <Text size="sm" className="line-clamp-2 font-medium text-foreground leading-snug">
          {product.name}
        </Text>

        {/* 评分 */}
        <div className="flex items-center gap-1.5">
          <Rating value={product.rating} readOnly size="sm" />
          <Text size="xs" tone="muted">
            {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()})
          </Text>
        </div>

        {/* 价格 */}
        <div className="flex items-end gap-2">
          <span className="text-lg font-bold text-danger">{formatPrice(product.price)}</span>
          <span className="text-xs text-muted line-through">{formatPrice(product.originalPrice)}</span>
          <Chip size="sm" tone="danger" variant="soft" className="ml-auto shrink-0">
            {discount}折
          </Chip>
        </div>

        {/* 加购按钮 */}
        <Button
          size="sm"
          variant={added ? "solid" : "outline"}
          className="mt-auto w-full"
          onClick={handleAdd}
        >
          <ShoppingCart className="mr-1.5 size-3.5" aria-hidden />
          {added ? "已加入购物车" : "加入购物车"}
        </Button>
      </CardBody>
    </Card>
  );
}

export function ProductGridBlock() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-5 flex items-baseline justify-between">
        <Heading level={2} size="lg" weight="semibold">
          猜你喜欢
        </Heading>
        <Text size="sm" tone="muted">
          全部好物 · {PRODUCTS.length} 件
        </Text>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
