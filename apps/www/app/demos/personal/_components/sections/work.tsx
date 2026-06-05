"use client";

import Link from "next/link";
import {
  CardSpotlight,
  ShineBorder,
  Tag,
  Chip,
  Heading,
  Text,
  Button,
  Particles,
  cn,
  type TagTone,
} from "@hulianui/ui";
import { ArrowUpRight } from "lucide-react";
import { Section } from "./section";
import { works, type Work } from "../../_data/works";

const BASE = "/demos/personal";

// 作品状态 → Tag 语气。
const STATUS_TONE: Record<Work["status"], TagTone> = {
  在线: "success",
  开源: "brand",
  Beta: "warning",
  已下架: "neutral",
};

function WorkCard({ work, featured }: { work: Work; featured?: boolean }) {
  return (
    <Link
      href={`${BASE}/work/${work.slug}`}
      aria-label={`查看作品 ${work.name}`}
      className={cn(
        "group relative block rounded-[var(--radius)] outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        featured && "md:col-span-2 md:row-span-2",
      )}
    >
      <CardSpotlight
        color={`hsl(${work.hue} 80% 60%)`}
        className={cn(
          "flex h-full flex-col justify-between gap-6 bg-surface/70 backdrop-blur-sm transition-all duration-300",
          "group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-xl",
          featured ? "p-8" : "p-6",
        )}
      >
        {/* 边框流光（hover 时更亮，用作品 hue 着色） */}
        <ShineBorder
          borderWidth={1}
          duration={16}
          shineColor={[
            `hsl(${work.hue} 80% 62%)`,
            `hsl(${(work.hue + 40) % 360} 75% 58%)`,
            "transparent",
          ]}
          className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* 顶部：品类 + 状态 + 年份 */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Tag variant="soft" tone="neutral" size="md">
              {work.category}
            </Tag>
            <Tag variant="soft" tone={STATUS_TONE[work.status]} size="md" dot pulse={work.status === "在线"}>
              {work.status}
            </Tag>
          </div>
          <span className="font-mono text-xs text-muted">{work.year}</span>
        </div>

        {/* 中部：名称 + 一句话 */}
        <div className="flex flex-1 flex-col gap-2">
          {/* hue 着色的品牌字标 */}
          <span
            className="font-mono text-xs uppercase tracking-[0.2em]"
            style={{ color: `hsl(${work.hue} 70% 62%)` }}
          >
            {work.nameEn}
          </span>
          <Heading
            level={3}
            size={featured ? "3xl" : "xl"}
            weight="bold"
            className="text-foreground transition-colors group-hover:text-primary"
          >
            {work.name}
          </Heading>
          <Text tone="muted" size={featured ? "lg" : "base"} className="text-pretty leading-relaxed">
            {work.tagline}
          </Text>
        </div>

        {/* 底部：技术栈 + 查看箭头 */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {work.stack.slice(0, featured ? 5 : 3).map((tech) => (
              <Chip key={tech} variant="outline" tone="neutral" size="sm">
                {tech}
              </Chip>
            ))}
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>
      </CardSpotlight>
    </Link>
  );
}

export function Work() {
  const [featured, ...rest] = works;
  return (
    <Section
      id="work"
      eyebrow="精选作品"
      title="六个我每天都在用的东西"
      description="每一个产品都源于一个我自己被折磨的真实问题。点开任意一个看完整故事、截图与关键实现。"
      width="6xl"
      backdrop={
        <Particles
          quantity={90}
          ease={70}
          staticity={40}
          size={0.5}
          color="var(--color-primary)"
          className="absolute inset-0"
        />
      }
    >
      <div className="grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <WorkCard work={featured} featured />
        {rest.map((work) => (
          <WorkCard key={work.slug} work={work} />
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Button variant="outline" size="lg" render={<Link href="/demos" />}>
          浏览更多示例
          <ArrowUpRight className="size-4" aria-hidden />
        </Button>
      </div>
    </Section>
  );
}
