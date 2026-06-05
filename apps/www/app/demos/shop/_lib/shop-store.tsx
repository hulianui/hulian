"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { productById } from "../_data/products";
import type { CartItem } from "../_data/types";

// 商城共享内存态（购物车 / 收藏 / 已领券）。挂在 (shop)/layout 的 ShopShell 里，
// 跨页客户端导航保持（layout 不重挂），无需 localStorage。无后端、纯 demo。

interface ShopStore {
  cart: CartItem[];
  favorites: string[];
  claimedCoupons: string[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  updateQty: (productId: string, color: string, size: string, qty: number) => void;
  removeFromCart: (productId: string, color: string, size: string) => void;
  clearCart: () => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => boolean;
  removeFavorite: (productId: string) => void;
  hasCoupon: (id: string) => boolean;
  claimCoupon: (id: string) => void;
}

const Ctx = createContext<ShopStore | null>(null);

const sameLine = (a: CartItem, productId: string, color: string, size: string) =>
  a.productId === productId && a.color === color && a.size === size;

export function ShopStoreProvider({ children }: { children: ReactNode }) {
  // 预置 2 件，购物车/结算首次进入即有内容（空态由「清空」演示）。
  const [cart, setCart] = useState<CartItem[]>(() => {
    const air = productById["p-hs-air"];
    const bottle = productById["p-ho-bottle"];
    return [
      { productId: "p-hs-air", color: "曜石黑", size: "降噪 Pro 版", qty: 1, price: air?.price ?? 899 },
      { productId: "p-ho-bottle", color: "薄荷绿", size: "900ml", qty: 2, price: bottle?.price ?? 119 },
    ];
  });
  const [favorites, setFavorites] = useState<string[]>(["p-hp-pro", "p-ho-shoe", "p-hy-serum"]);
  const [claimedCoupons, setClaimedCoupons] = useState<string[]>(["cp-5"]);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => sameLine(c, item.productId, item.color, item.size));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const updateQty = useCallback((productId: string, color: string, size: string, qty: number) => {
    setCart((prev) =>
      prev.map((c) => (sameLine(c, productId, color, size) ? { ...c, qty: Math.max(1, qty) } : c)),
    );
  }, []);

  const removeFromCart = useCallback((productId: string, color: string, size: string) => {
    setCart((prev) => prev.filter((c) => !sameLine(c, productId, color, size)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback((productId: string) => {
    let added = false;
    setFavorites((prev) => {
      if (prev.includes(productId)) return prev.filter((p) => p !== productId);
      added = true;
      return [...prev, productId];
    });
    return added;
  }, []);

  const removeFavorite = useCallback((productId: string) => {
    setFavorites((prev) => prev.filter((p) => p !== productId));
  }, []);

  const claimCoupon = useCallback((id: string) => {
    setClaimedCoupons((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const value = useMemo<ShopStore>(() => {
    const cartCount = cart.reduce((s, c) => s + c.qty, 0);
    const cartTotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
    return {
      cart,
      favorites,
      claimedCoupons,
      cartCount,
      cartTotal,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
      removeFavorite,
      hasCoupon: (id) => claimedCoupons.includes(id),
      claimCoupon,
    };
  }, [cart, favorites, claimedCoupons, addToCart, updateQty, removeFromCart, clearCart, toggleFavorite, removeFavorite, claimCoupon]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop(): ShopStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShop 必须在 ShopStoreProvider 内使用");
  return ctx;
}
