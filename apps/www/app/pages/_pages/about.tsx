/** @jsxImportSource ../../../lib/fixture-jsx */
import { Heading, Text, Tag } from "@hulianui/ui";
import { StatsBlock } from "../../blocks/_blocks/stats";
import { MilestoneTimelineBlock } from "../../blocks/_blocks/milestone-timeline";
import { TeamGridBlock } from "../../blocks/_blocks/team-grid";
import { TestimonialsBlock } from "../../blocks/_blocks/testimonials";
import { CtaBlock } from "../../blocks/_blocks/cta";

// 关于页 —— 紧凑页头 + 我们的故事叙事 + 数据 + 团队 + 口碑 + 行动号召,传递使命与温度。
export function AboutPage() {
  return (
    <div className="bg-bg">
      <section className="px-6 pt-20 pb-6 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3">
          <Tag variant="soft" tone="brand" size="sm">
            关于瀚云
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance>
            让每一份数据都更有价值
          </Heading>
          <Text tone="muted" size="lg">
            我们相信,好的工具应该消失在工作之中。
          </Text>
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl flex flex-col gap-4 text-center">
          <Heading level={2} size="2xl" weight="bold">
            我们的故事
          </Heading>
          <Text tone="muted" size="lg">
            瀚云诞生于一个朴素的困扰:团队被割裂的系统、重复的表格和迟到的数据拖慢了脚步。我们厌倦了在工具之间来回搬运信息,决定亲手造一个能把它们串起来的平台。
          </Text>
          <Text tone="muted" size="lg">
            从第一行代码起,我们就把「克制」写进基因——不堆砌功能,只解决真问题。今天,瀚云为成千上万的团队提供从数据接入到智能决策的一站式底座,而我们对简单与可靠的执念从未改变。
          </Text>
          <Text tone="muted" size="lg">
            这不是终点。我们仍在为「让复杂消失」这件事,日拱一卒。
          </Text>
        </div>
      </section>
      <StatsBlock />
      <MilestoneTimelineBlock />
      <TeamGridBlock />
      <TestimonialsBlock />
      <CtaBlock />
    </div>
  );
}
