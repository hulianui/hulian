"use client";
import Link from "next/link";
import { Card, CardBody, Heading } from "@hulian/ui";
import type { Category } from "../../_data/types";
import { SHOP_BASE } from "../nav-config";

interface Props {
  categories: Category[];
}

/** 分类入口：6 格图标卡片网格，点击跳 /products?cat=key */
export function HomeCategoryGrid({ categories }: Props) {
  return (
    <section aria-labelledby="home-cats-title">
      <Heading level={2} size="lg" id="home-cats-title" className="mb-4">
        全部品类
      </Heading>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            href={`${SHOP_BASE}/products?cat=${cat.key}`}
            className="group focus:outline-none"
            aria-label={`浏览 ${cat.name}`}
          >
            <Card
              variant="outline"
              className="cursor-pointer transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring"
            >
              <CardBody className="flex flex-col items-center gap-2 py-4">
                {/* 品类色块圆形图标 */}
                <div
                  className="flex size-12 items-center justify-center rounded-full text-xl font-bold text-white"
                  style={{
                    background: `hsl(${cat.hue} 60% 50%)`,
                  }}
                  aria-hidden
                >
                  {cat.name.slice(0, 1)}
                </div>
                <span className="text-center text-xs font-medium text-foreground">{cat.name}</span>
                <span className="hidden text-[10px] text-muted sm:block">
                  {cat.children.slice(0, 2).map((c) => c.name).join("·")}
                </span>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
