"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Choicebox, ChoiceboxGroup, Divider, Heading, ShimmerButton, Stack, Tag, Text, } from "@hulianui/ui";
import { Coins, Sparkles } from "lucide-react";
interface CreditPack {
    value: string;
    credits: number;
    bonus: number;
    price: number;
    badge?: string;
    highlight?: boolean;
}
const PACKS: CreditPack[] = [
    { value: "p1", credits: 1000, bonus: 0, price: 99 },
    { value: "p2", credits: 5000, bonus: 500, price: 449, badge: "Popular", highlight: true },
    { value: "p3", credits: 12000, bonus: 2000, price: 999, badge: "Best deal" },
    { value: "p4", credits: 30000, bonus: 6000, price: 2299 },
];
function unitPriceFen(pack: CreditPack) {
    return ((pack.price / (pack.credits + pack.bonus)) * 100).toFixed(2);
}
export function PricingCreditsBlock({ ctaHref = "#" }: {
    ctaHref?: string;
}) {
    const [selected, setSelected] = useState<string>("p2");
    const active = useMemo(() => PACKS.find((p) => p.value === selected) ?? PACKS[0], [selected]);
    return (<section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            Points recharge
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            Buy points as you need them, they never expire
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            Pay once with no monthly fee or automatic renewal. Larger packs cost less per credit, and bonus credits are available immediately.
          </Text>
        </div>

        <ChoiceboxGroup value={selected} onValueChange={(v) => setSelected(Array.isArray(v) ? (v[0] ?? "p2") : v)} columns={2} aria-label="Select points package">
          {PACKS.map((pack) => (<Choicebox key={pack.value} value={pack.value} icon={<Coins aria-hidden/>} title={<span className="flex items-center gap-2">
                  {pack.credits.toLocaleString()} Points
                  {pack.badge && (<Tag variant={pack.highlight ? "solid" : "soft"} tone="brand" size="sm">
                      {pack.badge}
                    </Tag>)}
                </span>} description={`About \u00A5${unitPriceFen(pack)} per credit`}>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  ¥{pack.price.toLocaleString()}
                </span>
                {pack.bonus > 0 && (<span className="inline-flex items-center gap-0.5 text-xs font-medium text-primary">
                    <Sparkles className="size-3" aria-hidden/>
                    Bonus {pack.bonus.toLocaleString()}
                  </span>)}
              </div>
            </Choicebox>))}
        </ChoiceboxGroup>

        <Divider className="my-8"/>

        <Stack direction="row" align="center" justify="between" className="flex-wrap gap-4">
          <div>
            <Text tone="muted" size="sm">
              Selected {active.credits.toLocaleString()}
              {active.bonus > 0 ? ` + ${active.bonus.toLocaleString()} Bonus` : ""} Points
            </Text>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                ¥{active.price.toLocaleString()}
              </span>
              <Text tone="muted" size="sm" className="pb-0.5">
                One time
              </Text>
            </div>
          </div>
          <ShimmerButton render={<Link href={ctaHref}/>}>Buy now</ShimmerButton>
        </Stack>

        <Text tone="muted" size="sm" className="mt-4 text-center">
          Pay with WeChat Pay, Alipay, or a corporate bank transfer. Use credits for function calls, AI inference, and edge traffic.
        </Text>
      </div>
    </section>);
}
