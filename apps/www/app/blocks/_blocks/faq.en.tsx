import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel, Heading, Tag, Text, } from "@hulianui/ui";
interface Faq {
    question: string;
    answer: string;
}
const FAQS: Faq[] = [
    {
        question: "Is it difficult to migrate to HanCloud?",
        answer: "Most projects need no code changes. Connect a repository and HanCloud detects the framework and creates the build configuration; one-to-one migration help is also available.",
    },
    {
        question: "Are there any hidden limitations in the free version?",
        answer: "Free includes one production project, 100 GB of monthly traffic, and a global CDN\u2014enough for real personal projects, with no forced upgrade deadline.",
    },
    {
        question: "How is elastic compute billed?",
        answer: "Pay only for request execution time, with no idle charges after scaling to zero. Set a budget cap for each environment and receive alerts before you reach it.",
    },
    {
        question: "What compliance certifications are supported?",
        answer: "Pro and Enterprise run on SOC 2 Type II-audited infrastructure. Enterprise also includes MLPS Level 3 compliance, SSO, and private deployment.",
    },
    {
        question: "How do I get help during an incident?",
        answer: "Free includes community support, Pro includes a four-hour ticket response, and Enterprise includes a dedicated customer success manager and a 99.99% SLA.",
    },
];
export function FaqBlock() {
    return (<section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            FAQ
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            Still have questions?
          </Heading>
        </div>
        <div className="mx-auto max-w-3xl">
          <Accordion>
            {FAQS.map((f) => (<AccordionItem key={f.question}>
                <AccordionTrigger>{f.question}</AccordionTrigger>
                <AccordionPanel>
                  <Text tone="muted" className="leading-relaxed">
                    {f.answer}
                  </Text>
                </AccordionPanel>
              </AccordionItem>))}
          </Accordion>
        </div>
      </div>
    </section>);
}
