/** @jsxImportSource ../../../lib/fixture-jsx */
import Link from "next/link";
import { AuroraText, Button, Safari, Tag, Heading, Text } from "@hulianui/ui";
import { ArrowRight, Sparkles } from "lucide-react";

// Hero 变体 · 左文右图双栏 —— 与居中款 hero.tsx 区分：经典 SaaS 落地页结构。
// 左：Tag + 大标题(AuroraText 点缀) + 副文案 + 双 CTA；右：Safari 浏览器外壳包产品界面占位。
// 响应式：md 以下塌成上下单列。

export function HeroSplitBlock({
  ctaHref = "#",
  secondaryHref = "#",
}: {
  ctaHref?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-bg">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:gap-10 md:py-28">
        {/* 左：文案 */}
        <div className="flex flex-col items-start gap-6 text-left">
          <Tag variant="soft" tone="brand" size="md" icon={<Sparkles className="size-3.5" />}>
            全新控制台 · 实时部署预览
          </Tag>

          <Heading
            level={1}
            weight="bold"
            balance
            className="text-4xl leading-tight text-foreground sm:text-5xl"
          >
            为团队打造的 <AuroraText>云端工作台</AuroraText>
          </Heading>

          <Text tone="muted" size="lg" className="max-w-md">
            统一管理部署、算力与可观测数据。从一次提交到全球可用，瀚云让你的应用始终在线、随需伸缩。
          </Text>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button size="lg" render={<Link href={ctaHref} />}>
              免费开始
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Button>
            <Button variant="outline" size="lg" render={<Link href={secondaryHref} />}>
              预约演示
            </Button>
          </div>

          <Text tone="muted" size="sm">
            已有 1,200+ 团队在瀚云上线生产应用
          </Text>
        </div>

        {/* 右：Safari 外壳 + 渐变界面占位 */}
        <div className="relative">
          <Safari url="console.hulian.cloud" className="shadow-xl">
            <div className="aspect-[16/10] w-full bg-gradient-to-br from-primary/15 via-bg to-brand/10 p-5">
              {/* 模拟控制台界面骨架 */}
              <div className="flex h-full gap-3">
                <div className="flex w-28 shrink-0 flex-col gap-2">
                  <div className="h-6 rounded-md bg-primary/25" />
                  <div className="h-4 rounded bg-border/70" />
                  <div className="h-4 w-4/5 rounded bg-border/70" />
                  <div className="h-4 w-3/5 rounded bg-border/70" />
                  <div className="mt-auto h-8 rounded-md bg-primary/20" />
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 rounded-lg bg-surface shadow-sm ring-1 ring-border/60" />
                    <div className="h-16 rounded-lg bg-surface shadow-sm ring-1 ring-border/60" />
                    <div className="h-16 rounded-lg bg-surface shadow-sm ring-1 ring-border/60" />
                  </div>
                  <div className="flex-1 rounded-lg bg-surface p-4 shadow-sm ring-1 ring-border/60">
                    <div className="flex items-end gap-2">
                      <div className="h-10 w-full rounded bg-primary/30" />
                      <div className="h-16 w-full rounded bg-primary/40" />
                      <div className="h-8 w-full rounded bg-primary/25" />
                      <div className="h-20 w-full rounded bg-brand/40" />
                      <div className="h-12 w-full rounded bg-primary/30" />
                      <div className="h-14 w-full rounded bg-primary/35" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Safari>
        </div>
      </div>
    </section>
  );
}
