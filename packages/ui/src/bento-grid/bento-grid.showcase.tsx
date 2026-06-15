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
  examples: [
    {
      title: "基础用法",
      description: "BentoGrid 定义错落栅格，BentoCard 承载图标/标题/描述。",
      code: `<BentoGrid>
  <BentoCard icon={<Zap />} title="极速" description="纯 CSS 优先，零运行时开销" />
  <BentoCard icon={<Shield />} title="可靠" description="WAI-ARIA + 测试覆盖" />
  <BentoCard icon={<Globe />} title="主题" description="OKLCH 明暗双层 token" />
</BentoGrid>`,
      render: () => (
        <BentoGrid className="w-full max-w-2xl">
          <BentoCard icon={<Zap />} title="极速" description="纯 CSS 优先，零运行时开销" />
          <BentoCard icon={<Shield />} title="可靠" description="WAI-ARIA + 测试覆盖" />
          <BentoCard icon={<Globe />} title="主题" description="OKLCH 明暗双层 token" />
        </BentoGrid>
      ),
    },
    {
      title: "跨列跨行",
      description: "在 BentoCard 上用 className（col-span / row-span）控制单卡占位，拼出错落布局。",
      code: `<BentoGrid>
  <BentoCard className="sm:col-span-2" icon={<Zap />} title="极速" description="纯 CSS 优先" />
  <BentoCard icon={<Shield />} title="可靠" description="WAI-ARIA" />
  <BentoCard icon={<Globe />} title="主题" description="OKLCH 双层 token" />
  <BentoCard className="sm:col-span-2" icon={<Sparkles />} title="吸取式聚合" description="统一为一套瑚琏 API" />
</BentoGrid>`,
      render: () => <Demo />,
    },
    {
      title: "带行动区（cta）",
      description: "cta 默认隐藏，hover 卡片时上滑淡入，引导次级操作。",
      code: `<BentoGrid>
  <BentoCard
    className="sm:col-span-2"
    icon={<Sparkles />}
    title="开始使用"
    description="hover 卡片查看行动区"
    cta={<span className="text-sm font-medium text-primary">了解更多 →</span>}
  />
  <BentoCard icon={<Shield />} title="可靠" description="测试覆盖" />
</BentoGrid>`,
      render: () => (
        <BentoGrid className="w-full max-w-2xl">
          <BentoCard
            className="sm:col-span-2"
            icon={<Sparkles />}
            title="开始使用"
            description="hover 卡片查看行动区"
            cta={<span className="text-sm font-medium text-primary">了解更多 →</span>}
          />
          <BentoCard icon={<Shield />} title="可靠" description="测试覆盖" />
        </BentoGrid>
      ),
    },
    {
      title: "自定义内容（children）",
      description: "不用 title/description 时可直接塞 children 自由排版。",
      code: `<BentoGrid>
  <BentoCard className="sm:col-span-3">
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <Sparkles className="size-8 text-primary" />
      <span className="text-base font-semibold text-foreground">完全自定义</span>
    </div>
  </BentoCard>
</BentoGrid>`,
      render: () => (
        <BentoGrid className="w-full max-w-2xl">
          <BentoCard className="sm:col-span-3">
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <Sparkles className="size-8 text-primary" />
              <span className="text-base font-semibold text-foreground">完全自定义</span>
            </div>
          </BentoCard>
        </BentoGrid>
      ),
    },
  ],
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<BentoGrid>\n  <BentoCard className="sm:col-span-2" title="极速" description="…" icon={<Zap />} />\n  <BentoCard title="可靠" description="…" />\n</BentoGrid>`,
};
