/** @jsxImportSource ../../../lib/fixture-jsx */
import { Marquee, Card, CardBody, Avatar, Heading, Tag, Text } from "@hulianui/ui";

// 客户证言 Block —— 自包含、可整段复制。
// 上下两行 Marquee 反向滚动的引言卡。数据内联在本文件，复制后改 TESTIMONIALS 即可。

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  initial: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "迁移到瀚云后，我们的发布频率从每周一次提升到每天十几次，回滚再也不用值班同学手抖。",
    name: "陈航",
    title: "极光科技 · 工程 VP",
    initial: "陈",
  },
  {
    quote: "弹性算力闲时归零这一条，直接把我们的预发环境账单砍掉了七成。",
    name: "林悦",
    title: "云图数据 · 基础架构负责人",
    initial: "林",
  },
  {
    quote: "可观测开箱即用，新同事第一天就能顺着链路追踪定位线上问题，省掉了搭一整套采集栈的活。",
    name: "Marco Reyes",
    title: "Northwind · Platform Lead",
    initial: "M",
  },
  {
    quote: "全球边缘节点让海外用户的首屏时间从 1.8s 降到 0.4s，转化率肉眼可见地涨了。",
    name: "苏晴",
    title: "远帆出海 · CTO",
    initial: "苏",
  },
  {
    quote: "合规这块原本要专人盯一个季度，瀚云的审计与密钥托管让我们一次过了等保。",
    name: "赵明远",
    title: "稳信金融 · 安全总监",
    initial: "赵",
  },
  {
    quote: "从 Demo 到生产，团队只学了一套心智模型。瀚云是我们用过最不打扰开发的平台。",
    name: "Aisha Khan",
    title: "Lumen AI · Head of Eng",
    initial: "A",
  },
];

function QuoteCard({ t }: { t: Testimonial }) {
  return (
    <Card variant="outline" className="w-[340px] shrink-0">
      <CardBody className="flex flex-col gap-4 p-5">
        <Text className="leading-relaxed">“{t.quote}”</Text>
        <div className="flex items-center gap-3">
          <Avatar size="sm" fallback={t.initial} />
          <div className="min-w-0">
            <Text size="sm" weight="medium">
              {t.name}
            </Text>
            <Text size="xs" tone="muted" truncate>
              {t.title}
            </Text>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function TestimonialsBlock() {
  const row1 = TESTIMONIALS.slice(0, 3);
  const row2 = TESTIMONIALS.slice(3);
  return (
    <section id="testimonials" className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            客户怎么说
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            被认真做产品的团队信赖
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            从初创到上市公司，他们用瀚云更快、更稳地把想法送到用户面前。
          </Text>
        </div>
        <div className="flex flex-col gap-5">
          <Marquee pauseOnHover duration={40} gap="1.25rem">
            {row1.map((t) => (
              <QuoteCard key={t.name} t={t} />
            ))}
          </Marquee>
          <Marquee pauseOnHover direction="right" duration={40} gap="1.25rem">
            {row2.map((t) => (
              <QuoteCard key={t.name} t={t} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
