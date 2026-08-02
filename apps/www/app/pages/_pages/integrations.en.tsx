import { Heading, Text, Tag } from "@hulianui/ui";
import { IntegrationsBlock } from "../../blocks/_blocks/integrations.en";
import { FaqBlock } from "../../blocks/_blocks/faq.en";
import { CtaBlock } from "../../blocks/_blocks/cta.en";
export function IntegrationsPage() {
    return (<div className="bg-bg">
      <section className="px-6 pt-20 pb-6 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3">
          <Tag variant="soft" tone="brand" size="sm">
            Integrations
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance>
            Connect the tools you already use
          </Heading>
          <Text tone="muted" size="lg">
            HanCloud connects with popular collaboration, data, and operations tools out of the box, so information moves freely across your stack.
          </Text>
        </div>
      </section>
      <IntegrationsBlock />
      <FaqBlock />
      <CtaBlock />
    </div>);
}
