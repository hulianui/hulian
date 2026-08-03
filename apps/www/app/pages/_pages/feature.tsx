/** @jsxImportSource ../../../lib/fixture-jsx */
import { Heading, Text, Tag } from "@hulianui/ui";
import { FeatureSplitBlock } from "../../blocks/_blocks/feature-split";
import { StatsBlock } from "../../blocks/_blocks/stats";
import { TestimonialsBlock } from "../../blocks/_blocks/testimonials";
import { FaqBlock } from "../../blocks/_blocks/faq";
import { CtaBlock } from "../../blocks/_blocks/cta";

// 单功能深挖页 —— 紧凑页头 + 图文并列详解 + 数据 + 口碑 + 常见问题 + 行动号召,单点深度说服。
export function FeaturePage() {
  return (
    <div className="bg-bg">
      <section className="px-6 pt-20 pb-6 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3">
          <Tag variant="soft" tone="brand" size="sm">
            核心能力
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance>
            把复杂留给瀚云,把简单还给团队
          </Heading>
          <Text tone="muted" size="lg">
            深入了解这项能力如何在真实业务中为你创造价值。
          </Text>
        </div>
      </section>
      <FeatureSplitBlock />
      <StatsBlock />
      <TestimonialsBlock />
      <FaqBlock />
      <CtaBlock />
    </div>
  );
}
