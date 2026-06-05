"use client";
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
  { title: "确认订单" },
  { title: "支付" },
  { title: "完成" },
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
  const [receiver, setReceiver] = useState("张三");
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
      toast({ title: "请选择收货地址", tone: "danger" });
      return;
    }
    if (!receiver.trim()) {
      toast({ title: "请填写收货人姓名", tone: "danger" });
      return;
    }
    setStep(1);
  }

  // 步骤二 → 步骤三（模拟支付）
  function handlePay() {
    if (!payMethod) {
      toast({ title: "请选择支付方式", tone: "danger" });
      return;
    }
    void runPending(async () => {
      // 模拟支付 1.5s
      await new Promise<void>((r) => setTimeout(r, 1500));
      const id = genOrderId();
      setOrderId(id);
      clearCart();
      setStep(2);
      toast({ title: "支付成功", tone: "info" });
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">结算</h1>

      {/* 步骤条 */}
      <div className="mb-8">
        <Steps items={CHECKOUT_STEPS} current={step} />
      </div>

      {/* 步骤一：确认订单 */}
      {step === 0 && (
        <div className="space-y-6">
          {/* 收货信息 */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-base font-semibold text-foreground">收货信息</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="收货地址" className="col-span-full">
                <RegionCascader
                  placeholder="选择省 / 市 / 区"
                  onChange={(_codes, names) => setRegion(names.join(""))}
                />
              </Field>
              <Field label="收货人">
                <Input
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  placeholder="请输入姓名"
                />
              </Field>
              <Field label="联系电话">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                />
              </Field>
            </div>
          </section>

          {/* 配送方式 */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-base font-semibold text-foreground">配送方式</h2>
            <RadioGroup value={delivery} onValueChange={setDelivery} aria-label="配送方式">
              <Radio value="standard" label="标准快递（3-5 天）— 免运费满 ¥199" />
              <Radio value="express" label="顺丰特快（1-2 天）— 另付 ¥12" />
            </RadioGroup>
          </section>

          {/* 商品清单 */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-base font-semibold text-foreground">
              商品清单（{cartItems.length} 种）
            </h2>
            {cartItems.length === 0 ? (
              <p className="text-sm text-foreground-muted">
                购物车为空，
                <Link href={`${SHOP_BASE}/cart`} className="text-brand hover:underline">
                  返回购物车
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
              <h2 className="mb-4 text-base font-semibold text-foreground">优惠券</h2>
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
            <h2 className="mb-4 text-base font-semibold text-foreground">订单备注</h2>
            <Field label="备注（选填）">
              <Textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="如有特殊要求请在此注明（颜色、规格偏好等）"
                rows={3}
              />
            </Field>
          </section>

          {/* 金额明细 */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-base font-semibold text-foreground">金额明细</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-foreground-muted">
                <span>商品总额</span>
                <span className="text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-foreground-muted">
                <span>运费</span>
                <span className="text-foreground">
                  {shippingFee === 0 ? "免运费" : formatPrice(shippingFee)}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>优惠券折扣</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="font-semibold text-foreground">实付金额</span>
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
              返回购物车
            </Button>
            <Button
              disabled={cartItems.length === 0}
              onClick={handleConfirmOrder}
            >
              确认订单，去支付
            </Button>
          </div>
        </div>
      )}

      {/* 步骤二：支付 */}
      {step === 1 && (
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-base font-semibold text-foreground">选择支付方式</h2>
            <RadioGroup value={payMethod} onValueChange={setPayMethod} aria-label="支付方式">
              <Radio value="wechat" label="微信支付" />
              <Radio value="alipay" label="支付宝" />
              <Radio value="card" label="银行卡" />
            </RadioGroup>
          </section>

          {/* 支付摘要 */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground-muted">
                共 {cartItems.reduce((s, c) => s + c.qty, 0)} 件商品
              </span>
              <div className="flex items-center gap-1 text-sm text-foreground-muted">
                实付：
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
              上一步
            </Button>
            <Button onClick={handlePay} disabled={pending}>
              {pending ? (
                <>
                  <Spinner size="sm" tone="current" />
                  <span className="ml-2">支付中...</span>
                </>
              ) : (
                "立即支付"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 步骤三：完成 */}
      {step === 2 && (
        <Result
          status="success"
          title="下单成功！"
          subTitle={`订单号 ${orderId}，预计 3-5 个工作日内发货。`}
        >
          <Button render={<Link href={`${SHOP_BASE}/products`} />}>继续购物</Button>
          <Button variant="outline" render={<Link href={SHOP_BASE} />}>
            返回首页
          </Button>
        </Result>
      )}
    </div>
  );
}
