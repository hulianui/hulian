import Link from "next/link";
import {
  AuroraText,
  BorderBeam,
  Button,
  Heading,
  ShimmerButton,
  Tag,
  Text,
} from "@hulianui/ui";
import { ArrowRight, Sparkles } from "lucide-react";

// 渐变发光卡 CTA —— 居中圆角大卡，BorderBeam 边框流光 + 品牌渐变卡背 + 双 CTA。
// 标题用 AuroraText 局部流动渐变点睛，其余文本走 token。
// data-surface="inverse"：在深色品牌渐变上重映射中性 token，Text/Button 自动反色。
export function CtaCardBlock({
  ctaHref = "#",
  secondaryHref = "#",
}: {
  ctaHref?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div
        data-surface="inverse"
        className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[var(--color-chart-2)] to-[var(--color-chart-4)] px-6 py-16 text-center sm:px-14 sm:py-20"
      >
        {/* 边框流光：双束反向绕行，营造活力 */}
        <BorderBeam size={120} duration={8} borderWidth={2} />
        <BorderBeam
          size={120}
          duration={8}
          delay={4}
          reverse
          colorFrom="var(--color-chart-4)"
          colorTo="var(--color-primary-foreground)"
          borderWidth={2}
        />

        <div className="relative flex flex-col items-center gap-5">
          <Tag variant="soft" tone="brand" icon={<Sparkles className="size-3.5" aria-hidden />}>
            限时新客礼遇
          </Tag>

          <Heading level={2} size="4xl" weight="bold" balance>
            让团队跑得更快，
            <br className="hidden sm:block" />
            从瀚云{" "}
            <AuroraText className="font-bold">现在</AuroraText>{" "}
            开始
          </Heading>

          <Text size="lg" className="max-w-xl text-white/85">
            一站式云研发平台，从代码到上线全链路托管。注册即领 30 天专业版，额度用完不自动扣费。
          </Text>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <ShimmerButton
              background="var(--color-primary-foreground)"
              shimmerColor="var(--color-primary)"
              className="text-primary"
              render={<Link href={ctaHref} />}
            >
              免费领取额度
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </ShimmerButton>
            <Button variant="outline" size="lg" render={<Link href={secondaryHref} />}>
              预约演示
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
