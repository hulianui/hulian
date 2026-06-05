"use client";

import type { ReactNode } from "react";
import { Heading, Text, cn } from "@hulian/ui";

interface SectionProps {
  /** 锚点 id（供首页 Anchor scrollspy + Dock 跳转） */
  id: string;
  /** 小标题上方的 kicker（如「关于我」） */
  eyebrow?: string;
  /** 章节大标题 */
  title?: ReactNode;
  /** 标题下副文案 */
  description?: ReactNode;
  /** 内容最大宽度，默认 5xl */
  width?: "4xl" | "5xl" | "6xl";
  /** 标题区是否居中 */
  centered?: boolean;
  /** 额外 className（叠到 <section> 外层，用于背景层定位 relative/overflow） */
  className?: string;
  /** 内层容器额外 className */
  innerClassName?: string;
  /** 背景层（绝对定位的 Particles/FlickeringGrid 等装饰，放在内容之下） */
  backdrop?: ReactNode;
  children: ReactNode;
}

const MAX_W = {
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
} as const;

/**
 * 统一 section 容器：负责 scroll-mt（避开 sticky 顶栏）、上下留白、背景层叠放、标题排版。
 * 各 section 把炫背景塞进 backdrop（自身 absolute inset-0），内容自动浮在其上（relative z-10）。
 */
export function Section({
  id,
  eyebrow,
  title,
  description,
  width = "5xl",
  centered = false,
  className,
  innerClassName,
  backdrop,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-20 overflow-hidden px-6 py-24 sm:py-28",
        className,
      )}
    >
      {backdrop}
      <div className={cn("relative z-10 mx-auto w-full", MAX_W[width], innerClassName)}>
        {(eyebrow || title || description) && (
          <div className={cn("mb-12 flex flex-col gap-3", centered && "items-center text-center")}>
            {eyebrow && (
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-primary">
                <span className="h-px w-6 bg-primary/50" aria-hidden />
                {eyebrow}
              </span>
            )}
            {title && (
              <Heading level={2} size="3xl" weight="bold" balance className="text-balance">
                {title}
              </Heading>
            )}
            {description && (
              <Text tone="muted" size="lg" className={cn("max-w-2xl", centered && "mx-auto")}>
                {description}
              </Text>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
