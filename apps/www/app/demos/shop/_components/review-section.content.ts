import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    customerReviews: "用户评价",
    noReviewsYetBeTheFirstToReviewThisProduct: "暂无评价，快来抢先评价吧！",
    reviews: "条评价",
    stars: "星",
    customerPhotoAlt: "{0}晒图{1}",
  },
  en: {
    customerReviews: "Customer reviews",
    noReviewsYetBeTheFirstToReviewThisProduct: "No reviews yet. Be the first to review this product.",
    reviews: " reviews",
    stars: "stars",
    customerPhotoAlt: "Customer photo {1} from {0}",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop--components-review-section", content: t(content) };
export default dictionary;
