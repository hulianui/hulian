"use client";
import { useState } from "react";
import { Coupon, Heading, Text } from "@hulian/ui";
import { toast } from "@hulian/ui";
import type { CouponData } from "../../_data/types";
import { useShop } from "../../_lib/shop-store";

interface Props {
  coupons: CouponData[];
}

/** 领券中心：available 券展示 + 领取交互 */
export function HomeCouponCenter({ coupons }: Props) {
  const { claimCoupon, hasCoupon } = useShop();
  // 本地已领集合（快速反映 UI，不依赖 store 刷新）
  const [localClaimed, setLocalClaimed] = useState<Set<string>>(new Set());

  // 只显示 available 和 claimed 状态
  const visible = coupons.filter((c) => c.status === "available" || c.status === "claimed");

  const handleClaim = (coupon: CouponData) => {
    claimCoupon(coupon.id);
    setLocalClaimed((prev) => new Set([...prev, coupon.id]));
    toast({ title: `「${coupon.title}」已领取，快去使用吧！`, tone: "info" });
  };

  const getCouponStatus = (coupon: CouponData): "available" | "claimed" | "used" | "expired" => {
    if (localClaimed.has(coupon.id) || hasCoupon(coupon.id)) return "claimed";
    return coupon.status as "available" | "claimed" | "used" | "expired";
  };

  return (
    <section aria-labelledby="home-coupon-title">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Heading level={2} size="lg" id="home-coupon-title">
            领券中心
          </Heading>
          <Text size="sm" tone="muted" className="mt-0.5">
            领券享折扣，下单省更多
          </Text>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((coupon) => (
          <Coupon
            key={coupon.id}
            kind={coupon.kind as "amount" | "discount" | "shipping"}
            amount={coupon.amount}
            discount={coupon.discount}
            threshold={coupon.threshold}
            title={coupon.title}
            scope={coupon.scope}
            validUntil={coupon.validUntil}
            status={getCouponStatus(coupon)}
            tone={coupon.tone}
            shine={getCouponStatus(coupon) === "available"}
            onClaim={() => handleClaim(coupon)}
          />
        ))}
      </div>
    </section>
  );
}
