import type { ReactNode } from "react";
import { ShopShell } from "../_components/shop-shell";

// (shop) 路由组：所有买家端页面共享 ShopShell（顶栏 + 共享购物车/收藏内存态 + 页脚）。
export default function ShopLayout({ children }: { children: ReactNode }) {
  return <ShopShell>{children}</ShopShell>;
}
