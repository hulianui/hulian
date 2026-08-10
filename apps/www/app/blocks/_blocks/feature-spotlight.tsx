/** @jsxImportSource ../../../lib/fixture-jsx */
import Link from "next/link";
import { CardSpotlight, Heading, Tag, Text } from "@hulianui/ui";
import { Gauge, ShieldCheck, ArrowRight, type LucideIcon } from "lucide-react";

// 聚光大卡 Block —— 自包含、可整段复制。
// 与 FeaturesBlock（Bento 错落）/ FeatureTabsBlock（Tab 切换）风格区隔：
// 这里是 2 张鼠标跟随聚光的大功能卡（CardSpotlight 自带边框/底色/圆角）。
// 数据内联，复制后改 CARDS 即可。CardSpotlight 是 client 组件，本 Block 作为容器可保持 RSC。

interface SpotlightCard {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  /** 高光色（CSS 颜色，建议用 token）。 */
  color: string;
  /** 卡内展示的几条关键指标。 */
  stats: { label: string; value: string }[];
}

const CARDS: SpotlightCard[] = [
  {
    icon: Gauge,
    eyebrow: "性能",
    title: "为速度而生的边缘运行时",
    description:
      "请求在离用户最近的节点冷启动，毫秒级响应；流量激增时自动扩容，回落即归零，闲时零成本。",
    href: "https://example.com/#performance",
    cta: "查看性能白皮书",
    color: "var(--color-chart-1)",
    stats: [
      { label: "边缘节点", value: "320+" },
      { label: "冷启动 P95", value: "18 ms" },
      { label: "自动扩容上限", value: "无限" },
    ],
  },
  {
    icon: ShieldCheck,
    eyebrow: "安全",
    title: "默认安全，无需额外配置",
    description:
      "自动签发并续期 HTTPS 证书，密钥加密托管，所有变更进入审计日志。合规交给我们，你专注业务。",
    href: "https://example.com/#security",
    cta: "了解合规与审计",
    color: "var(--color-chart-3)",
    stats: [
      { label: "合规认证", value: "SOC 2" },
      { label: "证书续期", value: "全自动" },
      { label: "审计留存", value: "365 天" },
    ],
  },
];

function SpotlightFeatureCard({ card }: { card: SpotlightCard }) {
  const Icon = card.icon;
  return (
    <CardSpotlight color={card.color} radius={320} className="h-full p-8">
      <div className="flex h-full flex-col gap-5">
        <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-surface">
          <Icon className="size-6 text-primary" aria-hidden />
        </div>

        <div className="flex flex-col gap-2">
          <Tag variant="soft" tone="brand" size="sm" className="self-start">
            {card.eyebrow}
          </Tag>
          <Heading level={3} size="xl" weight="semibold" className="text-foreground">
            {card.title}
          </Heading>
          <Text tone="muted" size="lg">
            {card.description}
          </Text>
        </div>

        <dl className="mt-2 grid grid-cols-3 gap-3 border-t border-border pt-5">
          {card.stats.map((s) => (
            <div key={s.label}>
              <dd className="text-xl font-bold tracking-tight text-foreground">{s.value}</dd>
              <dt className="mt-0.5 text-xs text-muted-foreground">{s.label}</dt>
            </div>
          ))}
        </dl>

        <Link
          href={card.href}
          className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary transition-colors hover:text-foreground"
        >
          {card.cta}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </CardSpotlight>
  );
}

export function FeatureSpotlightBlock() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            为什么选瑚云
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            又快，又稳，且默认安全
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            把鼠标移到卡片上——这两件事，是我们在每一次请求里都默默替你做好的。
          </Text>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {CARDS.map((card) => (
            <SpotlightFeatureCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
