// www 为 output:export 静态导出，动态路由须枚举所有 id（server component，不可用 "use client"）。
import { products } from "../../../_data/products";
import { ProductDetailClient } from "../../../_components/product-detail-client";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailClient productId={id} />;
}
