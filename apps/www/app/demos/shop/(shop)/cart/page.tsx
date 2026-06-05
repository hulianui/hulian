"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogTrigger,
  Breadcrumb,
  Button,
  Checkbox,
  Empty,
  NumberField,
  Popconfirm,
  Skeleton,
  toast,
} from "@hulianui/ui";
import { productById, productImage, formatPrice } from "../../_data/products";
import { useMockData } from "../../../lib/async";
import { useShop } from "../../_lib/shop-store";
import { SHOP_BASE } from "../../_components/nav-config";

// 购物车骨架屏行
function CartRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border px-4 py-4">
      <Skeleton shape="rect" className="h-5 w-5 shrink-0" />
      <Skeleton shape="rect" className="h-20 w-20 shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="w-48" />
        <Skeleton className="w-32" />
        <Skeleton className="w-24" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="w-20" />
        <Skeleton shape="rect" className="h-8 w-28" />
      </div>
    </div>
  );
}

export default function CartPage() {
  const { cart, updateQty, removeFromCart, clearCart } = useShop();
  // 模拟首屏加载
  const { loading } = useMockData(cart, { delay: 600 });

  // 选中行 key：productId|color|size
  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set<string>();
    cart.forEach((item) => s.add(`${item.productId}|${item.color}|${item.size}`));
    return s;
  });

  const allKeys = useMemo(
    () => cart.map((item) => `${item.productId}|${item.color}|${item.size}`),
    [cart],
  );

  const allSelected = allKeys.length > 0 && allKeys.every((k) => selected.has(k));
  const someSelected = allKeys.some((k) => selected.has(k)) && !allSelected;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allKeys));
    }
  }

  function toggleRow(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const selectedItems = cart.filter((item) =>
    selected.has(`${item.productId}|${item.color}|${item.size}`),
  );
  const selectedCount = selectedItems.reduce((s, c) => s + c.qty, 0);
  const selectedTotal = selectedItems.reduce((s, c) => s + c.qty * c.price, 0);

  function handleRemove(productId: string, color: string, size: string) {
    removeFromCart(productId, color, size);
    const key = `${productId}|${color}|${size}`;
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    toast({ title: "已移除商品", tone: "info" });
  }

  function handleClearCart() {
    clearCart();
    setSelected(new Set());
    toast({ title: "购物车已清空", tone: "info" });
  }

  function handleCheckout() {
    if (selectedItems.length === 0) {
      toast({ title: "请先勾选要结算的商品", tone: "danger" });
      return;
    }
    window.location.href = `${SHOP_BASE}/checkout`;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* 面包屑 */}
      <Breadcrumb
        className="mb-6"
        items={[
          { label: "瀚选首页", href: SHOP_BASE },
          { label: "购物车" },
        ]}
      />

      <h1 className="mb-6 text-xl font-semibold text-foreground">购物车</h1>

      {loading ? (
        /* 骨架屏 */
        <div className="rounded-xl border border-border bg-surface">
          {[1, 2, 3].map((i) => (
            <CartRowSkeleton key={i} />
          ))}
        </div>
      ) : cart.length === 0 ? (
        /* 空购物车 */
        <Empty title="购物车是空的" description="去逛逛挑点好物吧">
          <Button render={<Link href={SHOP_BASE} />}>去购物</Button>
        </Empty>
      ) : (
        <>
          {/* 商品列表 */}
          <div className="rounded-xl border border-border bg-surface">
            {/* 表头全选行 */}
            <div className="flex items-center gap-4 border-b border-border px-4 py-3">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={toggleAll}
                aria-label="全选"
              />
              <span className="text-sm text-foreground-muted">全选</span>
              <span className="ml-auto text-sm text-foreground-muted">共 {cart.length} 种商品</span>
            </div>

            {/* 商品行 */}
            {cart.map((item) => {
              const key = `${item.productId}|${item.color}|${item.size}`;
              const product = productById[item.productId];
              if (!product) return null;
              const imgSrc = productImage(product, 0, 160, 160);
              const subtotal = item.qty * item.price;

              return (
                <div
                  key={key}
                  className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-b-0"
                >
                  <Checkbox
                    checked={selected.has(key)}
                    onCheckedChange={() => toggleRow(key)}
                    aria-label={`选择 ${product.name}`}
                  />

                  {/* 商品图 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={product.name}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />

                  {/* 商品信息 */}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`${SHOP_BASE}/product/${product.id}`}
                      className="block truncate text-sm font-medium text-foreground hover:text-brand"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-foreground-muted">
                      {item.color} · {item.size}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* 数量 + 小计 + 删除 */}
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-sm font-semibold text-brand">
                      {formatPrice(subtotal)}
                    </span>
                    <NumberField
                      value={item.qty}
                      min={1}
                      max={99}
                      aria-label={`${product.name} 数量`}
                      onValueChange={(v) =>
                        updateQty(item.productId, item.color, item.size, v ?? 1)
                      }
                    />
                    <Popconfirm
                      title="确定删除该商品？"
                      description="移除后需重新加入购物车。"
                      danger
                      okText="删除"
                      onConfirm={() => handleRemove(item.productId, item.color, item.size)}
                    >
                      <Button size="sm" variant="ghost" tone="danger">
                        删除
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 底部结算栏 */}
          <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-surface px-6 py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={toggleAll}
                label="全选"
              />

              {/* 清空购物车 */}
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button size="sm" variant="ghost" tone="danger">
                      清空购物车
                    </Button>
                  }
                />
                <AlertDialogContent
                  title="清空购物车？"
                  description="购物车内所有商品将被移除，此操作不可撤销。"
                >
                  <AlertDialogClose className="inline-flex h-8 items-center rounded-[var(--radius)] border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring">
                    取消
                  </AlertDialogClose>
                  <AlertDialogClose
                    className="inline-flex h-8 items-center rounded-[var(--radius)] bg-danger px-3 text-sm font-medium text-danger-foreground outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={handleClearCart}
                  >
                    清空
                  </AlertDialogClose>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground-muted">
                已选 <span className="font-semibold text-foreground">{selectedCount}</span> 件
              </span>
              <div className="flex items-center gap-1 text-sm text-foreground-muted">
                合计：
                <span className="text-base font-bold text-brand">{formatPrice(selectedTotal)}</span>
              </div>
              <Button size="lg" disabled={selectedItems.length === 0} onClick={handleCheckout}>
                去结算
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
