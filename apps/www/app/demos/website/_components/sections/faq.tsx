import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel, Text } from "@hulianui/ui";
import { Section } from "../section";
import { faqs } from "../../_data/site";

// 常见问题：Accordion 折叠面板。
export function Faq() {
  return (
    <Section eyebrow="常见问题" title="还有疑问？" width="5xl">
      <div className="mx-auto max-w-3xl">
        <Accordion>
          {faqs.map((f) => (
            <AccordionItem key={f.question}>
              <AccordionTrigger>{f.question}</AccordionTrigger>
              <AccordionPanel>
                <Text tone="muted" className="leading-relaxed">
                  {f.answer}
                </Text>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}
