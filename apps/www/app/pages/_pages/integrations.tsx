/** @jsxImportSource ../../../lib/fixture-jsx */
import { Heading, Text, Tag } from "@hulianui/ui";
import { IntegrationsBlock } from "../../blocks/_blocks/integrations";
import { FaqBlock } from "../../blocks/_blocks/faq";
import { CtaBlock } from "../../blocks/_blocks/cta";

// 集成生态页 —— 紧凑页头 + 集成清单 + 常见问题 + 行动号召,展示连接能力。
export function IntegrationsPage() {
  return (
    <div className="bg-bg">
      <section className="px-6 pt-20 pb-6 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3">
          <Tag variant="soft" tone="brand" size="sm">
            集成生态
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance>
            连接你已经在用的工具
          </Heading>
          <Text tone="muted" size="lg">
            瀚云开箱即用地接入主流协作、数据与运维工具,让数据自由流转。
          </Text>
        </div>
      </section>
      <IntegrationsBlock />
      <FaqBlock />
      <CtaBlock />
    </div>
  );
}
