import Link from "next/link";
import { ShimmerButton, Button, Heading, Text, Meteors } from "@hulianui/ui";
import { ArrowRight } from "lucide-react";

// 结尾行动号召 Block —— 自包含、可整段复制。
// 主色面板 + Meteors 流星 + 双 CTA。
// data-surface="inverse"：在该子树重映射中性 token，Heading/Text/Button 自动反色，无逐元素颜色补丁。
// CTA 链接通过 ctaHref / secondaryHref 注入，默认中性 "#"。
export function CtaBlock({
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
        className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center sm:px-12"
      >
        <Meteors number={24} className="text-border" />
        <div className="relative flex flex-col items-center gap-5">
          <Heading level={2} size="3xl" weight="bold" balance>
            5 分钟，把你的第一个项目送上瀚云
          </Heading>
          <Text tone="muted" size="lg" className="max-w-xl">
            免费开始，无需信用卡。需要规模化与合规支持时，我们的团队随时在线。
          </Text>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <ShimmerButton
              background="var(--color-primary-foreground)"
              shimmerColor="var(--color-primary)"
              className="text-primary"
              render={<Link href={ctaHref} />}
            >
              免费开始
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </ShimmerButton>
            <Button variant="outline" size="lg" render={<Link href={secondaryHref} />}>
              对比套餐
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
