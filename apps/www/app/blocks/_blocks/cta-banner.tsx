import Link from "next/link";
import { Button, Heading, Text } from "@hulianui/ui";
import { ArrowRight } from "lucide-react";

// 全宽横幅 CTA —— 紧凑一条，适合页脚上方。
// 左标题+副文案、右操作按钮组，响应式塌成上下居中。
// data-surface="inverse"：深色品牌渐变底上重映射中性 token，文本/按钮自动反色。
export function CtaBannerBlock({
  ctaHref = "#",
  secondaryHref = "#",
}: {
  ctaHref?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="px-6 py-12 sm:py-16">
      <div
        data-surface="inverse"
        className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-6 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-[var(--color-chart-2)] px-6 py-8 text-center sm:px-10 md:flex-row md:justify-between md:gap-8 md:text-left"
      >
        <div className="flex flex-col gap-1.5 md:max-w-2xl">
          <Heading level={2} size="xl" weight="bold" balance>
            准备好把项目搬上瀚云了吗？
          </Heading>
          <Text size="base" className="text-white/85">
            几分钟完成接入，按量计费、随时扩缩，团队协作开箱即用。
          </Text>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            className="bg-white text-primary shadow-sm hover:bg-white/90"
            render={<Link href={ctaHref} />}
          >
            免费开始
            <ArrowRight className="ml-2 size-4" aria-hidden />
          </Button>
          <Button variant="outline" size="lg" render={<Link href={secondaryHref} />}>
            联系销售
          </Button>
        </div>
      </div>
    </section>
  );
}
