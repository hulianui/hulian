import { Heading, Text, Tag } from "@hulianui/ui";
import { FeatureSplitBlock } from "../../blocks/_blocks/feature-split.en";
import { StatsBlock } from "../../blocks/_blocks/stats.en";
import { TestimonialsBlock } from "../../blocks/_blocks/testimonials.en";
import { FaqBlock } from "../../blocks/_blocks/faq.en";
import { CtaBlock } from "../../blocks/_blocks/cta.en";
export function FeaturePage() {
    return (<div className="bg-bg">
      <section className="px-6 pt-20 pb-6 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3">
          <Tag variant="soft" tone="brand" size="sm">
            Core capabilities
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance>
            Leave the complexity to HanCloud and give teams a simpler way to work
          </Heading>
          <Text tone="muted" size="lg">
            See how this capability creates value in real workflows.
          </Text>
        </div>
      </section>
      <FeatureSplitBlock />
      <StatsBlock />
      <TestimonialsBlock />
      <FaqBlock />
      <CtaBlock />
    </div>);
}
