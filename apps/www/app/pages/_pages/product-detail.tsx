import { ProductDetailBlock } from "../../blocks/_blocks/product-detail";
import { ReviewSectionBlock } from "../../blocks/_blocks/review-section";

// 电商商品详情页 —— 商品详情（轮播主图 + 规格 + 加购）+ 评价区，下单转化的核心页范式。
export function ProductDetailPage() {
  return (
    <div className="space-y-12 bg-bg px-6 py-10">
      <ProductDetailBlock />
      <ReviewSectionBlock />
    </div>
  );
}
