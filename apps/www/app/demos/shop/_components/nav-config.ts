// 商城导航配置 SSoT。
export const SHOP_BASE = "/demos/shop";

export const primaryNav = [
  { label: "首页", href: SHOP_BASE },
  { label: "限时秒杀", href: `${SHOP_BASE}/products?flash=1` },
  { label: "全部商品", href: `${SHOP_BASE}/products` },
  { label: "移动版", href: `${SHOP_BASE}/mobile` },
];

export const brand = { name: "瀚选", nameEn: "HanShop", slogan: "好物臻选 · 万物到家" };
