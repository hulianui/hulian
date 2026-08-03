/** @jsxImportSource ../../../lib/fixture-jsx */
import { Heading, Tag, Text } from "@hulianui/ui";

const FEATURES: Array<{
  tag: string;
  title: string;
  desc: string;
  points: string[];
  gradient: string;
}> = [
  {
    tag: "实时可观测",
    title: "看清系统里发生的每一件事",
    desc: "从单次请求的链路追踪到全局指标聚合，瀚云把分散的信号汇成一张可下钻的全景图，让排障从猜测变成定位。",
    points: [
      "分布式链路追踪，跨服务串联完整调用链",
      "自定义采样策略，在成本与覆盖间精确平衡",
      "异常自动归因，长尾故障也能第一时间显形",
    ],
    gradient: "from-primary/25 via-accent/15 to-bg",
  },
  {
    tag: "弹性算力",
    title: "按需伸缩，毫秒级响应流量",
    desc: "运行时快照与预热池协同工作，让函数计算既能在闲时收缩到零，又能在洪峰来临时瞬间扩容，无需为冷启动妥协体验。",
    points: [
      "冷启动 P50 控制在 400ms 以内",
      "缩容至零，闲置不计费",
      "突发流量秒级扩容，无需预留容量",
    ],
    gradient: "from-accent/25 via-primary/15 to-bg",
  },
  {
    tag: "全球边缘",
    title: "把计算放到离用户最近的地方",
    desc: "遍布三大洲的边缘节点让静态与动态内容都能就近响应，结合一致性回源策略，在低延迟与数据正确之间取得稳妥的平衡。",
    points: [
      "全球边缘节点，平均回源延迟低于 20ms",
      "可配置的一致性模型，按业务取舍",
      "智能路由，自动避开拥塞与故障区域",
    ],
    gradient: "from-primary/20 via-accent/20 to-bg",
  },
];

function PreviewPanel({ gradient }: { gradient: string }) {
  return (
    <div
      className={`aspect-[4/3] rounded-xl border border-border bg-gradient-to-br ${gradient} p-6`}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="h-3 w-1/3 rounded-full bg-foreground/15" />
        <div className="h-2.5 w-2/3 rounded-full bg-foreground/10" />
        <div className="h-2.5 w-1/2 rounded-full bg-foreground/10" />
        <div className="mt-auto grid grid-cols-3 gap-3">
          <div className="h-12 rounded-lg bg-foreground/10" />
          <div className="h-12 rounded-lg bg-foreground/[0.07]" />
          <div className="h-12 rounded-lg bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}

export function FeatureSplitBlock() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-16 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            核心能力
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            支撑现代应用的三块基石
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            可观测、弹性、就近——瀚云把复杂的基础设施能力收敛成清晰的三大支柱。
          </Text>
        </div>

        <div className="flex flex-col gap-16 lg:gap-24">
          {FEATURES.map((feature, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={feature.tag}
                className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 ${
                  flip ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="flex flex-col gap-5">
                  <Tag variant="soft" tone="neutral" size="sm">
                    {feature.tag}
                  </Tag>
                  <Heading level={3} size="2xl" weight="semibold" balance className="text-foreground">
                    {feature.title}
                  </Heading>
                  <Text tone="muted" size="base">
                    {feature.desc}
                  </Text>
                  <ul className="flex flex-col gap-3">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <svg
                          viewBox="0 0 20 20"
                          className="mt-0.5 size-5 shrink-0 text-primary"
                          fill="none"
                          aria-hidden
                        >
                          <circle cx="10" cy="10" r="9" className="fill-primary/10" />
                          <path
                            d="M6 10.5l2.5 2.5L14 7.5"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <Text size="sm" className="text-foreground">
                          {point}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </div>
                <PreviewPanel gradient={feature.gradient} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
