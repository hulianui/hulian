import { ProductDetailBlock } from "../../blocks/_blocks/product-detail.en";
import { ReviewSectionBlock } from "../../blocks/_blocks/review-section.en";
import { ProductGridBlock } from "../../blocks/_blocks/product-grid.en";
export function ProductDetailPage() {
    return (<div className="space-y-12 bg-bg px-6 py-10">
      <ProductDetailBlock />
      <ReviewSectionBlock />

      <ProductGridBlock />
    </div>);
}
