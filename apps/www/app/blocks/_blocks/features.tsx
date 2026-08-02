/** @jsxImportSource ../../../lib/fixture-jsx */
import { BentoGrid, BentoCard, BorderBeam, Heading, Tag, Text } from "@hulianui/ui";
import { Rocket, Cpu, Globe, Activity, ShieldCheck, Users, type LucideIcon } from "lucide-react";

// 能力特性 Block —— 自包含、可整段复制。
// 错落 Bento 栅格，跨列卡片加 BorderBeam 流光点缀。数据内联在本文件，复制后改 FEATURES 即可。

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  /** BentoCard 跨列/跨行的 className。 */
  span?: string;
}

const FEATURES: Feature[] = [
  {
    icon: Rocket,
    title: "一键部署",
    description: "git push 即上线，构建缓存命中秒级完成，异常一键回滚到任意历史版本。",
    span: "sm:col-span-2",
  },
  {
    icon: Cpu,
    title: "弹性算力",
    description: "按请求自动伸缩，闲时归零不计费。",
  },
  {
    icon: Globe,
    title: "全球边缘网络",
    description: "320 个边缘节点就近响应，静态资源与函数同图下发。",
  },
  {
    icon: Activity,
    title: "端到端可观测",
    description: "指标、日志、链路追踪开箱即用，无需自建采集栈。",
    span: "sm:col-span-2",
  },
  {
    icon: ShieldCheck,
    title: "企业级安全",
    description: "SOC 2 Type II 与等保三级合规，密钥托管与审计全覆盖。",
  },
  {
    icon: Users,
    title: "团队协作",
    description: "细粒度角色权限、环境隔离与变更审计，多团队安全共用一套平台。",
    span: "sm:col-span-2",
  },
];

export function FeaturesBlock() {
  return (
    <section id="features" className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            平台能力
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            一个平台，覆盖应用上线的每一环
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            从部署到弹性算力，再到端到端可观测——不必再拼凑五六套工具与脚本。
          </Text>
        </div>
        <BentoGrid className="sm:auto-rows-[11rem]">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            const isWide = f.span?.includes("col-span-2");
            return (
              <BentoCard
                key={f.title}
                className={f.span}
                icon={<Icon aria-hidden />}
                title={f.title}
                description={f.description}
              >
                {isWide && <BorderBeam size={70} duration={9} className="opacity-70" />}
              </BentoCard>
            );
          })}
        </BentoGrid>
      </div>
    </section>
  );
}
