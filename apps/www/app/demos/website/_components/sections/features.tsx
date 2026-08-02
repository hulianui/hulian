import { copy } from "./features.content";
import { BentoGrid, BentoCard, BorderBeam } from "@hulianui/ui";
import { Section } from "../section";
import { features } from "../../_data/site";

// 能力特性 Bento：错落栅格，跨列卡片加 BorderBeam 流光点缀。
export function Features() {
  return (
    <Section
      id="features"
      eyebrow={copy("platformCapabilities")}
      title={copy("onePlatformForEveryStepFromCodeToProduction")}
      subtitle={copy("deploymentElasticComputeAndEndToEndObservabilityWorkTogetherWithoutAPatchworkOfToolsAndScripts")}
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
