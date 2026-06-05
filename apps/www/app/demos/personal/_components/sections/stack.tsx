"use client";

import { Meter, Chip, Marquee, Heading, Text, cn } from "@hulian/ui";
import { Section } from "./section";
import { skills, stacks } from "../../_data/profile";

// 跑马灯用的扁平技术名（去重）。
const marqueeItems = Array.from(new Set(stacks.flatMap((g) => g.items)));

export function Stack() {
  return (
    <Section
      id="stack"
      eyebrow="技能矩阵"
      title="我用什么把想法变成产品"
      description="六年里我在这些方向上反复打磨——前端是主场，全栈与原生是延伸，设计与增长让一个人也能闭环。"
      width="6xl"
      className="bg-surface/30"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* 左：熟练度 Meter 条 */}
        <div className="flex flex-col gap-7">
          {skills.map((skill) => (
            <div key={skill.name} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-medium text-foreground">{skill.name}</span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-primary">{skill.level}%</span>
              </div>
              <Meter value={skill.level} />
              <Text size="sm" tone="muted">
                {skill.note}
              </Text>
            </div>
          ))}
        </div>

        {/* 右：技术栈标签云（按 group 分组） */}
        <div className="flex flex-col gap-7">
          {stacks.map((group, gi) => (
            <div key={group.group} className="flex flex-col gap-3">
              <Heading
                level={3}
                size="sm"
                weight="semibold"
                className="font-mono uppercase tracking-[0.18em] text-muted"
              >
                {group.group}
              </Heading>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item, i) => (
                  <Chip
                    key={item}
                    variant={(gi + i) % 3 === 0 ? "outline" : "soft"}
                    tone={(gi + i) % 4 === 0 ? "brand" : "neutral"}
                    size="md"
                  >
                    {item}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部：技术名跑马灯，两侧渐隐 */}
      <div
        className={cn(
          "relative mt-16 overflow-hidden",
          "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        )}
      >
        <Marquee pauseOnHover duration={32} className="py-2">
          {marqueeItems.map((name) => (
            <span
              key={name}
              className="mx-3 font-mono text-lg font-medium text-muted/70 transition-colors hover:text-primary"
            >
              {name}
            </span>
          ))}
        </Marquee>
      </div>
    </Section>
  );
}
