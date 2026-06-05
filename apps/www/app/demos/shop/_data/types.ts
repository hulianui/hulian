// 瀚选 HanShop · C 端商城 mock 数据类型（全内存，无后端）。

/** 商品品类 key（驱动 MegaMenu / 筛选 / 配色）。 */
export type CategoryKey = "digital" | "home" | "beauty" | "outdoor" | "grocery" | "apparel";

export interface Category {
  key: CategoryKey;
  name: string;
  /** 配图/配色用色相。 */
  hue: number;
  /** 二级子分类（MegaMenu 展开）。 */
  children: { key: string; name: string }[];
}

/** SKU 规格选项（颜色 + 尺寸/容量组合）。 */
export interface SkuColor {
  /** 颜色名（尺码/容量同理）。 */
  name: string;
  /** 色值（ColorSwatchPicker）。 */
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryKey;
  subCategory: string;
  brand: string;
  /** 现价（分→元，这里直接用元）。 */
  price: number;
  /** 划线原价。 */
  originalPrice: number;
  /** 评分 0-5。 */
  rating: number;
  /** 评价数。 */
  reviewCount: number;
  /** 月销量。 */
  sales: number;
  /** 库存。 */
  stock: number;
  /** 颜色 SKU。 */
  colors: SkuColor[];
  /** 尺寸/容量 SKU。 */
  sizes: string[];
  /** 卖点标签（chips）。 */
  tags: string[];
  /** 一句话卖点。 */
  tagline: string;
  /** 详情段落。 */
  highlights: string[];
  /** 是否参与限时秒杀。 */
  flashSale?: boolean;
  /** 是否新品。 */
  isNew?: boolean;
}

export interface CartItem {
  productId: string;
  color: string;
  size: string;
  qty: number;
  /** 加购时单价快照。 */
  price: number;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "completed" | "refunding" | "closed";

export interface OrderTrack {
  time: string;
  text: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  items: { productId: string; name: string; color: string; size: string; qty: number; price: number }[];
  total: number;
  /** 物流轨迹。 */
  tracks: OrderTrack[];
  /** 收货信息。 */
  address: string;
  receiver: string;
}

export type CouponKindData = "amount" | "discount" | "shipping";
export type CouponStatusData = "available" | "claimed" | "used" | "expired";

export interface CouponData {
  id: string;
  kind: CouponKindData;
  amount?: number;
  discount?: number;
  threshold?: number;
  title: string;
  scope: string;
  validUntil: string;
  status: CouponStatusData;
  tone: "brand" | "danger" | "neutral";
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  /** 规格快照。 */
  spec: string;
  /** 点赞数。 */
  likes: number;
  /** 是否晒图。 */
  withImage?: boolean;
}
