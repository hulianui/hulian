"use client";
import { Zap, Shield, Globe, Sparkles } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { BentoGrid, BentoCard } from "./bento-grid";

function Demo() {
  return (
    <BentoGrid className="w-full max-w-2xl">
      <BentoCard
        className="sm:col-span-2"
        icon={<Zap />}
        title="极速"
        description="纯 CSS 优先，零运行时开销"
      />
      <BentoCard icon={<Shield />} title="可靠" description="WAI-ARIA + 测试覆盖" />
      <BentoCard icon={<Globe />} title="主题" description="OKLCH 明暗双层 token" />
      <BentoCard
        className="sm:col-span-2"
        icon={<Sparkles />}
        title="吸取式聚合"
        description="博采众长，统一为一套瑚琏 API"
      />
    </BentoGrid>
  );
}

export const bentoGridShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<BentoGrid>\n  <BentoCard className="sm:col-span-2" title="极速" description="…" icon={<Zap />} />\n  <BentoCard title="可靠" description="…" />\n</BentoGrid>`,
};
