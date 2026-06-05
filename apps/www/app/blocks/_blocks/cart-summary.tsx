"use client";

// 购物车汇总区块 —— 左侧商品行列表（Checkbox 选中 + 渐变缩略图 + 名称 + NumberField 数量 + Popconfirm 删除）。
// 右侧价格汇总卡（小计/运费/优惠/合计 + 结算 Button）。
// 所有数据内联，复制即独立运行，无任何外部依赖。

import { useState } from "react";
import { Button, Checkbox, Empty, NumberField, Popconfirm, Separator, toast } from "@hulianui/ui";
import { ShoppingCart } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  spec: string;
  price: number;
  qty: number;
  gradient: string;
}

const INITIAL_CART: CartItem[] = [
  {
    id: "ci1",
    name: "轻奢蚕丝枕套双面桑蚕丝",
    spec: "玫瑰红 · M",
    price: 298,
    qty: 2,
    gradient: "from-rose-200 via-pink-100 to-fuchsia-200",
  },
  {
    id: "ci2",
    name: "人体工学办公椅腰托可调",
    spec: "曜石黑 · 标准款",
    price: 1299,
    qty: 1,
    gradient: "from-slate-200 via-gray-100 to-zinc-200",
  },
  {
    id: "ci3",
    name: "OLED 护眼台灯 Pro Max 版",
    spec: "皓月白 · 旗舰版",
    price: 459,
    qty: 1,
    gradient: "from-amber-200 via-yellow-100 to-orange-200",
  },
];

function formatPrice(n: number) {
  return `¥${n.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
}

export function CartSummaryBlock() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(INITIAL_CART.map((i) => i.id)),
  );

  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id));
  const someSelected = items.some((i) => selected.has(i.id)) && !allSelected;

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  }

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateQty(id: string, qty: number) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty } : item)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast({ title: "已移除商品", tone: "info" });
  }

  const selectedItems = items.filter((i) => selected.has(i.id));
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 0 && subtotal < 88 ? 8 : 0;
  const discount = subtotal >= 500 ? 50 : subtotal >= 200 ? 20 : 0;
  const total = subtotal + shipping - discount;

  function handleCheckout() {
    if (selectedItems.length === 0) {
      toast({ title: "请先勾选要结算的商品", tone: "danger" });
      return;
    }
    toast({ title: `去结算 ${selectedItems.length} 件商品，共 ${formatPrice(total)}`, tone: "info" });
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h2 className="mb-4 text-xl font-semibold text-foreground">购物车</h2>

      {items.length === 0 ? (
        <Empty title="购物车是空的" description="去逛逛挑点好物吧">
          <Button>去购物</Button>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* 左侧：商品列表 */}
          <div className="flex-1 overflow-hidden rounded-xl border border-border bg-surface">
            {/* 表头全选 */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={toggleAll}
                aria-label="全选"
              />
              <span className="text-sm text-muted">
                全选（共 {items.length} 种商品）
              </span>
            </div>

            {/* 商品行 */}
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 border-b border-border px-4 py-4 last:border-b-0"
              >
                <Checkbox
                  checked={selected.has(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                  aria-label={`选择 ${item.name}`}
                />

                {/* 缩略图（CSS 渐变占位） */}
                <div
                  className={`h-18 w-18 shrink-0 rounded-lg bg-gradient-to-br ${item.gradient} size-[72px]`}
                  aria-hidden
                />

                {/* 信息 */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{item.spec}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* 数量 + 小计 + 删除 */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-sm font-semibold text-brand">
                    {formatPrice(item.price * item.qty)}
                  </span>
                  <NumberField
                    value={item.qty}
                    min={1}
                    max={99}
                    aria-label={`${item.name} 数量`}
                    onValueChange={(v) => updateQty(item.id, v ?? 1)}
                  />
                  <Popconfirm
                    title="确定删除该商品？"
                    description="移除后需重新加入购物车。"
                    danger
                    okText="删除"
                    onConfirm={() => removeItem(item.id)}
                  >
                    <Button size="sm" variant="ghost" tone="danger">
                      删除
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>

          {/* 右侧：价格汇总卡 */}
          <div className="w-full shrink-0 rounded-xl border border-border bg-surface p-5 lg:w-64">
            <h3 className="mb-4 text-sm font-semibold text-foreground">价格汇总</h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-muted">
                <span>小计（{selectedItems.reduce((s, i) => s + i.qty, 0)} 件）</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>运费</span>
                <span className={shipping === 0 ? "text-success" : ""}>
                  {shipping === 0 ? "免运费" : formatPrice(shipping)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>满减优惠</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-foreground">合计</span>
              <span className="text-xl font-bold text-danger">{formatPrice(total)}</span>
            </div>

            {subtotal > 0 && subtotal < 500 && (
              <p className="mt-2 text-xs text-muted">
                再买 {formatPrice(500 - subtotal)} 可享满减 ¥50
              </p>
            )}

            <Button
              size="lg"
              className="mt-4 w-full"
              disabled={selectedItems.length === 0}
              onClick={handleCheckout}
            >
              <ShoppingCart className="mr-2 size-4" aria-hidden />
              去结算（{selectedItems.length}）
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
