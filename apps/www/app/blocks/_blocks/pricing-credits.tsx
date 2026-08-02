/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Choicebox,
  ChoiceboxGroup,
  Divider,
  Heading,
  ShimmerButton,
  Stack,
  Tag,
  Text,
} from "@hulianui/ui";
import { Coins, Sparkles } from "lucide-react";

// 积分包 Block —— 自包含、可整段复制（"use client"，维护选中态）。
// 与订阅制定价（PricingTable / PricingUsage）风格区隔：这里是「一次性购买」的积分包，
// 用 Choicebox 单选卡，选中高亮，底部「立即购买」CTA 显示当前选中包的金额。
// 额度、单价、赠送全部内联，复制后改 PACKS 即可。

interface CreditPack {
  value: string;
  /** 购买积分数。 */
  credits: number;
  /** 赠送积分数（0 表示无）。 */
  bonus: number;
  /** 售价（元）。 */
  price: number;
  /** 标签，如「最划算」。 */
  badge?: string;
  highlight?: boolean;
}

const PACKS: CreditPack[] = [
  { value: "p1", credits: 1000, bonus: 0, price: 99 },
  { value: "p2", credits: 5000, bonus: 500, price: 449, badge: "热门", highlight: true },
  { value: "p3", credits: 12000, bonus: 2000, price: 999, badge: "最划算" },
  { value: "p4", credits: 30000, bonus: 6000, price: 2299 },
];

/** 单价：售价 ÷ (基础 + 赠送) 积分，分 / 积分。 */
function unitPriceFen(pack: CreditPack) {
  return ((pack.price / (pack.credits + pack.bonus)) * 100).toFixed(2);
}

export function PricingCreditsBlock({ ctaHref = "#" }: { ctaHref?: string }) {
  const [selected, setSelected] = useState<string>("p2");
  const active = useMemo(
    () => PACKS.find((p) => p.value === selected) ?? PACKS[0],
    [selected],
  );

  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            积分充值
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            按需购买积分，永不过期
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            一次性购买，无月费、无自动续订。买得越多单价越低，额外赠送积分立即到账。
          </Text>
        </div>

        <ChoiceboxGroup
          value={selected}
          onValueChange={(v) => setSelected(Array.isArray(v) ? (v[0] ?? "p2") : v)}
          columns={2}
          aria-label="选择积分包"
        >
          {PACKS.map((pack) => (
            <Choicebox
              key={pack.value}
              value={pack.value}
              icon={<Coins aria-hidden />}
              title={
                <span className="flex items-center gap-2">
                  {pack.credits.toLocaleString()} 积分
                  {pack.badge && (
                    <Tag
                      variant={pack.highlight ? "solid" : "soft"}
                      tone="brand"
                      size="sm"
                    >
                      {pack.badge}
                    </Tag>
                  )}
                </span>
              }
              description={`约 ¥${unitPriceFen(pack)} / 积分`}
            >
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  ¥{pack.price.toLocaleString()}
                </span>
                {pack.bonus > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-primary">
                    <Sparkles className="size-3" aria-hidden />
                    赠 {pack.bonus.toLocaleString()}
                  </span>
                )}
              </div>
            </Choicebox>
          ))}
        </ChoiceboxGroup>

        <Divider className="my-8" />

        <Stack direction="row" align="center" justify="between" className="flex-wrap gap-4">
          <div>
            <Text tone="muted" size="sm">
              已选 {active.credits.toLocaleString()}
              {active.bonus > 0 ? ` + ${active.bonus.toLocaleString()} 赠送` : ""} 积分
            </Text>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                ¥{active.price.toLocaleString()}
              </span>
              <Text tone="muted" size="sm" className="pb-0.5">
                一次性
              </Text>
            </div>
          </div>
          <ShimmerButton render={<Link href={ctaHref} />}>立即购买</ShimmerButton>
        </Stack>

        <Text tone="muted" size="sm" className="mt-4 text-center">
          支持微信 / 支付宝 / 企业对公转账。积分可用于函数调用、AI 推理与边缘流量抵扣。
        </Text>
      </div>
    </section>
  );
}
