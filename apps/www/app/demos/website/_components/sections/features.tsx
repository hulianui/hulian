import { BentoGrid, BentoCard, BorderBeam } from "@hulian/ui";
import { Section } from "../section";
import { features } from "../../_data/site";

// 能力特性 Bento：错落栅格，跨列卡片加 BorderBeam 流光点缀。
export function Features() {
  return (
    <Section
      id="features"
      eyebrow="平台能力"
      title="一个平台，覆盖应用上线的每一环"
      subtitle="从部署到弹性算力，再到端到端可观测——不必再拼凑五六套工具与脚本。"
    >
      <BentoGrid className="sm:auto-rows-[11rem]">
        {features.map((f) => {
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
    </Section>
  );
}
