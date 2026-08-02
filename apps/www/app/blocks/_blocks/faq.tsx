/** @jsxImportSource ../../../lib/fixture-jsx */
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
  Heading,
  Tag,
  Text,
} from "@hulianui/ui";

// 常见问题 Block —— 自包含、可整段复制。
// Accordion 折叠面板。数据内联在本文件，复制后改 FAQS 即可。

interface Faq {
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    question: "从其他平台迁移瀚云复杂吗？",
    answer:
      "大多数项目无需改代码。瀚云自动识别框架并生成构建配置，你只需连接代码仓库；我们也提供一对一迁移协助。",
  },
  {
    question: "免费版会不会有隐藏限制？",
    answer:
      "免费版包含 1 个生产项目、每月 100 GB 流量与全球 CDN，足以承载真实的个人项目，且不会因到期强制升级。",
  },
  {
    question: "弹性算力是如何计费的？",
    answer:
      "按实际请求时长计费，闲时自动归零不产生费用。你可以为每个环境设置预算上限，超出前会提前告警。",
  },
  {
    question: "支持哪些合规认证？",
    answer:
      "专业版与企业版均运行在通过 SOC 2 Type II 审计的基础设施上，企业版额外提供等保三级、SSO 与私有化部署。",
  },
  {
    question: "出现故障时如何获得支持？",
    answer:
      "免费版享社区支持，专业版工单 4 小时内响应，企业版配备专属客户成功经理与 99.99% SLA。",
  },
];

export function FaqBlock() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            常见问题
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            还有疑问？
          </Heading>
        </div>
        <div className="mx-auto max-w-3xl">
          <Accordion>
            {FAQS.map((f) => (
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
      </div>
    </section>
  );
}
