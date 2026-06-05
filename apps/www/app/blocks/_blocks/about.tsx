import {
  Heading,
  Text,
  AuroraText,
  NumberTicker,
} from "@hulianui/ui";
import { Gauge, ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";

// 关于 Block —— 自包含、可整段复制。
// 使命大标语（AuroraText 点缀关键词）+ 公司叙事 + 价值观四宫格 + 里程碑数字行（NumberTicker）。
// 文案内联，复制即用。

const values = [
  {
    icon: Sparkles,
    title: "为开发者而生",
    desc: "从第一行命令到全球上线，把复杂留给平台，把专注还给团队。",
  },
  {
    icon: Gauge,
    title: "极致性能",
    desc: "边缘网络与弹性算力，让每一次请求都跑在离用户最近的地方。",
  },
  {
    icon: ShieldCheck,
    title: "默认安全",
    desc: "传输加密、密钥托管与细粒度权限，安全是底座而非选项。",
  },
  {
    icon: HeartHandshake,
    title: "长期主义",
    desc: "我们与客户一同成长，把可观测、可回滚、可信赖刻进每个版本。",
  },
];

const milestones = [
  { value: 120000, suffix: "+", label: "服务的开发者" },
  { value: 38, suffix: "", label: "全球边缘节点" },
  { value: 99.99, suffix: "%", label: "服务可用性", decimals: 2 },
  { value: 50, suffix: "ms", label: "平均冷启动" },
];

export function AboutBlock() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      {/* 使命大标语 */}
      <div className="mx-auto max-w-3xl text-center">
        <Heading
          level={2}
          weight="bold"
          balance
          className="text-3xl leading-tight text-foreground sm:text-4xl"
        >
          让每一个团队都能 <AuroraText>从容上线</AuroraText>
        </Heading>
        <Text tone="muted" size="lg" className="mt-5">
          瀚云始于一个朴素的念头：部署不该是发布的拦路虎。我们把弹性算力、全球边缘网络与端到端可观测，
          收进同一个克制而强大的平台，让开发者把时间花在创造，而非搬运基础设施。
        </Text>
      </div>

      {/* 价值观四宫格 */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {values.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-[var(--radius)] border border-border bg-surface p-6"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <Heading level={3} size="base" weight="semibold" className="mt-4 text-foreground">
              {title}
            </Heading>
            <Text tone="muted" size="sm" className="mt-2">
              {desc}
            </Text>
          </div>
        ))}
      </div>

      {/* 里程碑数字行 */}
      <div className="mt-16 grid grid-cols-2 gap-8 border-t border-border pt-12 sm:grid-cols-4">
        {milestones.map((m) => (
          <div key={m.label} className="text-center">
            <div className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              <NumberTicker value={m.value} decimalPlaces={m.decimals ?? 0} />
              {m.suffix}
            </div>
            <Text tone="muted" size="sm" className="mt-1.5">
              {m.label}
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
}
