import { copy } from "./nav-config.content";
import { demoHref, demoLocationHref } from "../../_components/demo-locale";
// 商城导航配置 SSoT。
export const SHOP_BASE = demoHref("/demos/shop");
export const SHOP_LOCATION_BASE = demoLocationHref("/demos/shop");

export const primaryNav = [
  { label: copy("home"), href: SHOP_BASE },
  { label: copy("flashSale"), href: `${SHOP_BASE}/products?flash=1` },
  { label: copy("allProducts"), href: `${SHOP_BASE}/products` },
  { label: copy("mobile"), href: `${SHOP_BASE}/mobile` },
];

export const brand = { name: copy("hanshop"), nameEn: "HanShop", slogan: copy("curatedGoodsDeliveredToYourDoor") };
