import { ProductDetailBlock } from "../../blocks/_blocks/product-detail";
import { ReviewSectionBlock } from "../../blocks/_blocks/review-section";
import { ProductGridBlock } from "../../blocks/_blocks/product-grid";

// 电商商品详情页 —— 商品详情（轮播主图 + 规格 + 加购）+ 评价区 + 相关推荐商品网格，下单转化的核心页范式。
export function ProductDetailPage() {
  return (
    <div className="space-y-12 bg-bg px-6 py-10">
      <ProductDetailBlock />
      <ReviewSectionBlock />
      {/* ProductGridBlock 自带「猜你喜欢」标题区，故不再叠加内联小标题，避免重复 */}
      <ProductGridBlock />
    </div>
  );
}
