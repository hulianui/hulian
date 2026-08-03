/** @jsxImportSource ../../../lib/fixture-jsx */
import { Heading, Text, Tag } from "@hulianui/ui";
import { ProductGridBlock } from "../../blocks/_blocks/product-grid";

// 电商商品列表页 —— 频道标题 + 分类标签 + 商品网格，C 端选购的入口页范式。
export function ProductListPage() {
  return (
    <div className="bg-bg px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-3">
          <Heading level={1} size="2xl" weight="bold" className="text-foreground">
            全部商品
          </Heading>
          <Text tone="muted">精选好物，品质保障 · 共 128 件商品</Text>
          <div className="mt-1 flex flex-wrap gap-2">
            {["全部", "数码电器", "家居生活", "服饰鞋包", "美妆个护", "食品生鲜"].map(
              (c, i) => (
                <Tag key={c} variant={i === 0 ? "solid" : "soft"} tone={i === 0 ? "brand" : "neutral"}>
                  {c}
                </Tag>
              ),
            )}
          </div>
        </div>
      </div>
      <ProductGridBlock />
    </div>
  );
}
