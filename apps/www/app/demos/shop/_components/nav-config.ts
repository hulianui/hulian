import { copy } from "./nav-config.content";
import { withDocsBasePath } from "../../../../lib/docs-locale";
// 商城导航配置 SSoT。
export const SHOP_BASE = withDocsBasePath("/demos/shop");

export const primaryNav = [
  { label: copy("home"), href: SHOP_BASE },
  { label: copy("flashSale"), href: `${SHOP_BASE}/products?flash=1` },
  { label: copy("allProducts"), href: `${SHOP_BASE}/products` },
  { label: copy("mobile"), href: `${SHOP_BASE}/mobile` },
];

export const brand = { name: copy("hanshop"), nameEn: "HanShop", slogan: copy("curatedGoodsDeliveredToYourDoor") };
