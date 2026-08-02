"use client";
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
        name: "Premium Reversible Mulberry Silk Pillowcase",
        spec: "Rose Red \u00B7 M",
        price: 298,
        qty: 2,
        gradient: "from-rose-200 via-pink-100 to-fuchsia-200",
    },
    {
        id: "ci2",
        name: "Ergonomic office chair with adjustable lumbar support",
        spec: "Obsidian Black \u00B7 Standard",
        price: 1299,
        qty: 1,
        gradient: "from-slate-200 via-gray-100 to-zinc-200",
    },
    {
        id: "ci3",
        name: "OLED Eye-Care Desk Lamp Pro Max",
        spec: "Moonlight White \u00B7 Flagship",
        price: 459,
        qty: 1,
        gradient: "from-amber-200 via-yellow-100 to-orange-200",
    },
];
function formatPrice(n: number) {
    return `\u00A5${n.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
}
export function CartSummaryBlock() {
    const [items, setItems] = useState<CartItem[]>(INITIAL_CART);
    const [selected, setSelected] = useState<Set<string>>(() => new Set(INITIAL_CART.map((i) => i.id)));
    const allSelected = items.length > 0 && items.every((i) => selected.has(i.id));
    const someSelected = items.some((i) => selected.has(i.id)) && !allSelected;
    function toggleAll() {
        if (allSelected)
            setSelected(new Set());
        else
            setSelected(new Set(items.map((i) => i.id)));
    }
    function toggleItem(id: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
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
        toast({ title: "Product removed", tone: "info" });
    }
    const selectedItems = items.filter((i) => selected.has(i.id));
    const subtotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal > 0 && subtotal < 88 ? 8 : 0;
    const discount = subtotal >= 500 ? 50 : subtotal >= 200 ? 20 : 0;
    const total = subtotal + shipping - discount;
    function handleCheckout() {
        if (selectedItems.length === 0) {
            toast({ title: "Select at least one item to check out", tone: "danger" });
            return;
        }
        toast({ title: `Checkout: ${selectedItems.length} items, totaling ${formatPrice(total)}`, tone: "info" });
    }
    return (<div className="mx-auto w-full max-w-4xl">
      <h2 className="mb-4 text-xl font-semibold text-foreground">Shopping cart</h2>

      {items.length === 0 ? (<Empty title="Shopping cart is empty" description="Browse the catalog to find something you'll love.">
          <Button>Browse products</Button>
        </Empty>) : (<div className="flex flex-col gap-4 lg:flex-row lg:items-start">

          <div className="flex-1 overflow-hidden rounded-xl border border-border bg-surface">

            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Checkbox checked={allSelected} indeterminate={someSelected} onCheckedChange={toggleAll} aria-label="Select all"/>
              <span className="text-sm text-muted">
                Select all ( {items.length} items)
              </span>
            </div>


            {items.map((item) => (<div key={item.id} className="flex items-center gap-3 border-b border-border px-4 py-4 last:border-b-0">
                <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggleItem(item.id)} aria-label={`Choose ${item.name}`}/>


                <div className={`h-18 w-18 shrink-0 rounded-lg bg-gradient-to-br ${item.gradient} size-[72px]`} aria-hidden/>


                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{item.spec}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {formatPrice(item.price)}
                  </p>
                </div>


                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-sm font-semibold text-brand">
                    {formatPrice(item.price * item.qty)}
                  </span>
                  <NumberField value={item.qty} min={1} max={99} aria-label={`${item.name} Quantity`} onValueChange={(v) => updateQty(item.id, v ?? 1)}/>
                  <Popconfirm title="Remove this item from your cart?" description="You'll need to add it again if you change your mind." danger okText="Remove" onConfirm={() => removeItem(item.id)}>
                    <Button size="sm" variant="ghost" tone="danger">
                      Remove
                    </Button>
                  </Popconfirm>
                </div>
              </div>))}
          </div>


          <div className="w-full shrink-0 rounded-xl border border-border bg-surface p-5 lg:w-64">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Order summary</h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({selectedItems.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-success" : ""}>
                  {shipping === 0 ? "Free shipping" : formatPrice(shipping)}
                </span>
              </div>
              {discount > 0 && (<div className="flex justify-between text-success">
                  <span>Order discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>)}
            </div>

            <Separator className="my-4"/>

            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-foreground">Total</span>
              <span className="text-xl font-bold text-danger">{formatPrice(total)}</span>
            </div>

            {subtotal > 0 && subtotal < 500 && (<p className="mt-2 text-xs text-muted">
                Spend another {formatPrice(500 - subtotal)} to get ¥50 off
              </p>)}

            <Button size="lg" className="mt-4 w-full" disabled={selectedItems.length === 0} onClick={handleCheckout}>
              <ShoppingCart className="mr-2 size-4" aria-hidden/>
              Go to checkout ({selectedItems.length})
            </Button>
          </div>
        </div>)}
    </div>);
}
