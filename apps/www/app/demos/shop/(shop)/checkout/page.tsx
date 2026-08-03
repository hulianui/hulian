"use client";
import { copy } from "./page.content";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Button,
  Coupon,
  Field,
  Input,
  RadioGroup,
  Radio,
  RegionCascader,
  Result,
  Spinner,
  Statistic,
  Steps,
  Textarea,
  toast,
} from "@hulianui/ui";
import type { StepsItem } from "@hulianui/ui";
import { productById, productImage, formatPrice } from "../../_data/products";
import { coupons, couponById } from "../../_data/coupons";
import { useShop } from "../../_lib/shop-store";
import { SHOP_BASE } from "../../_components/nav-config";
import { usePending } from "../../../lib/async";

const CHECKOUT_STEPS: StepsItem[] = [
  { title: copy("reviewOrder") },
  { title: copy("payment") },
  { title: copy("complete") },
];

// 运费规则：满 199 包邮，默认 12 元
const SHIPPING_BASE = 12;
const FREE_SHIPPING_THRESHOLD = 199;

// 计算优惠券折扣金额
function calcCouponDiscount(
  couponId: string | null,
  subtotal: number,
  hasShipping: boolean,
): number {
  if (!couponId) return 0;
  const c = couponById[couponId];
  if (!c) return 0;
  if (c.threshold && subtotal < c.threshold) return 0;
  if (c.kind === "amount") return c.amount ?? 0;
  if (c.kind === "discount") {
    const rate = (c.discount ?? 10) / 10;
    return Math.round(subtotal * (1 - rate) * 100) / 100;
  }
  if (c.kind === "shipping") return hasShipping ? SHIPPING_BASE : 0;
  return 0;
}

// 生成随机订单号
function genOrderId(): string {
  return `HS${Date.now().toString().slice(-10)}`;
}

export default function CheckoutPage() {
  const { cart, claimedCoupons, clearCart } = useShop();
  const [step, setStep] = useState(0);

  // 步骤一：确认订单
  const [region, setRegion] = useState("");
  const [receiver, setReceiver] = useState(copy("sanZhang"));
  const [phone, setPhone] = useState("138****8888");
  const [delivery, setDelivery] = useState("standard");
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [remark, setRemark] = useState("");

  // 步骤二：支付方式
  const [payMethod, setPayMethod] = useState("wechat");
  const [pending, runPending] = usePending();

  // 步骤三：完成
  const [orderId, setOrderId] = useState("");

  // 待结算商品（购物车全部）
  const cartItems = useMemo(() => {
    return cart.filter((item) => productById[item.productId]);
  }, [cart]);

  // 金额计算
  const subtotal = useMemo(
    () => cartItems.reduce((s, c) => s + c.qty * c.price, 0),
    [cartItems],
  );

  const shippingFee = useMemo(() => {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return SHIPPING_BASE;
  }, [subtotal]);

  const couponDiscount = useMemo(
    () => calcCouponDiscount(selectedCoupon, subtotal, shippingFee > 0),
    [selectedCoupon, subtotal, shippingFee],
  );

  const actualPay = Math.max(0, subtotal + shippingFee - couponDiscount);

  // 已领取券列表（只展示 claimed 状态的券）
  const availableCoupons = useMemo(
    () => coupons.filter((c) => claimedCoupons.includes(c.id) && c.status === "claimed"),
    [claimedCoupons],
  );

  // 步骤一 → 步骤二
  function handleConfirmOrder() {
    if (!region) {
      toast({ title: copy("selectAShippingAddress"), tone: "danger" });
      return;
    }
    if (!receiver.trim()) {
      toast({ title: copy("enterTheRecipientSName"), tone: "danger" });
      return;
    }
    setStep(1);
  }

  // 步骤二 → 步骤三（模拟支付）
  function handlePay() {
    if (!payMethod) {
      toast({ title: copy("selectAPaymentMethod"), tone: "danger" });
      return;
    }
    void runPending(async () => {
      // 模拟支付 1.5s
      await new Promise<void>((r) => setTimeout(r, 1500));
      const id = genOrderId();
      setOrderId(id);
      clearCart();
      setStep(2);
      toast({ title: copy("paymentSuccessful"), tone: "success" });
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">{copy("checkout")}</h1>

      {/* 步骤条 */}
      <div className="mb-8">
        <Steps items={CHECKOUT_STEPS} current={step} />
      </div>

      {/* 步骤一：确认订单 */}
      {step === 0 && (
        <div className="space-y-6">
          {/* 收货信息 */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-base font-semibold text-foreground">{copy("shippingInformation")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={copy("shippingAddresses")} className="col-span-full">
                <RegionCascader
                  placeholder={copy("selectProvinceCityDistrict")}
                  onChange={(_codes, names) => setRegion(names.join(""))}
                />
              </Field>
              <Field label={copy("recipient")}>
                <Input
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  placeholder={copy("enterAName")}
                />
              </Field>
              <Field label={copy("phone")}>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={copy("enterAPhoneNumber")}
                />
              </Field>
            </div>
          </section>

          {/* 配送方式 */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-base font-semibold text-foreground">{copy("deliveryMethod")}</h2>
            <RadioGroup value={delivery} onValueChange={setDelivery} aria-label={copy("deliveryMethod")}>
              <Radio value="standard" label={copy("standardDelivery35DaysFreeOnOrdersOver199")} />
              <Radio value="express" label={copy("sfExpress12Days12Surcharge")} />
            </RadioGroup>
          </section>

          {/* 商品清单 */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-base font-semibold text-foreground">

              {copy("items")}{cartItems.length}  {copy("products")}
            </h2>
            {cartItems.length === 0 ? (
              <p className="text-sm text-foreground-muted">

                {copy("yourCartIsEmpty")}
                <Link href={`${SHOP_BASE}/cart`} className="text-brand hover:underline">

                  {copy("backToCart")}
                </Link>
              </p>
            ) : (
              <div className="divide-y divide-border">
                {cartItems.map((item) => {
                  const product = productById[item.productId]!;
                  const imgSrc = productImage(product, 0, 96, 96);
                  return (
                    <div
                      key={`${item.productId}|${item.color}|${item.size}`}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgSrc}
                        alt={product.name}
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {item.color} · {item.size} × {item.qty}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-foreground">
                        {formatPrice(item.qty * item.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 优惠券选择 */}
          {availableCoupons.length > 0 && (
            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="mb-4 text-base font-semibold text-foreground">{copy("coupons")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {availableCoupons.map((c) => {
                  const canUse = !c.threshold || subtotal >= c.threshold;
                  return (
                    <div key={c.id} className={canUse ? "" : "opacity-50"}>
                      <Coupon
                        kind={c.kind}
                        amount={c.amount}
                        discount={c.discount}
                        threshold={c.threshold}
                        title={c.title}
                        scope={c.scope}
                        validUntil={c.validUntil}
                        tone={c.tone}
                        status="claimed"
                        selected={selectedCoupon === c.id}
                        onSelect={
                          canUse
                            ? () =>
                                setSelectedCoupon((prev) => (prev === c.id ? null : c.id))
                            : undefined
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 订单备注 */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-base font-semibold text-foreground">{copy("orderNotes")}</h2>
            <Field label={copy("notesOptional")}>
              <Textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder={copy("addAnySpecialRequestsSuchAsColorOrSizePreferences")}
                rows={3}
              />
            </Field>
          </section>

          {/* 金额明细 */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-base font-semibold text-foreground">{copy("orderSummary")}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-foreground-muted">
                <span>{copy("subtotal")}</span>
                <span className="text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-foreground-muted">
                <span>{copy("shipping")}</span>
                <span className="text-foreground">
                  {shippingFee === 0 ? copy("free") : formatPrice(shippingFee)}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>{copy("couponDiscount")}</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="font-semibold text-foreground">{copy("totalDue")}</span>
                <Statistic
                  value={actualPay}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: "var(--color-brand)", fontWeight: 700, fontSize: "1.25rem" }}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button variant="outline" render={<Link href={`${SHOP_BASE}/cart`} />}>

              {copy("backToCart")}
            </Button>
            <Button
              disabled={cartItems.length === 0}
              onClick={handleConfirmOrder}
            >

              {copy("continueToPayment")}
            </Button>
          </div>
        </div>
      )}

      {/* 步骤二：支付 */}
      {step === 1 && (
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-base font-semibold text-foreground">{copy("chooseAPaymentMethod")}</h2>
            <RadioGroup value={payMethod} onValueChange={setPayMethod} aria-label={copy("paymentMethods")}>
              <Radio value="wechat" label={copy("wechatPay")} />
              <Radio value="alipay" label={copy("alipay")} />
              <Radio value="card" label={copy("bankCard")} />
            </RadioGroup>
          </section>

          {/* 支付摘要 */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground-muted">

                {copy("total")} {cartItems.reduce((s, c) => s + c.qty, 0)}  {copy("products2")}
              </span>
              <div className="flex items-center gap-1 text-sm text-foreground-muted">

                {copy("totalDue2")}
                <Statistic
                  value={actualPay}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: "var(--color-brand)", fontWeight: 700, fontSize: "1.25rem" }}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setStep(0)}>

              {copy("back")}
            </Button>
            <Button onClick={handlePay} disabled={pending}>
              {pending ? (
                <>
                  <Spinner size="sm" tone="current" />
                  <span className="ml-2">{copy("processingPayment")}</span>
                </>
              ) : (
                copy("payNow")
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 步骤三：完成 */}
      {step === 2 && (
        <Result
          status="success"
          title={copy("orderPlaced")}
          subTitle={`${copy("order")}${orderId}${copy("estimatedDispatchIn35BusinessDays")}`}
        >
          <Button render={<Link href={`${SHOP_BASE}/products`} />}>{copy("continueShopping")}</Button>
          <Button variant="outline" render={<Link href={SHOP_BASE} />}>

            {copy("backToHome")}
          </Button>
        </Result>
      )}
    </div>
  );
}
