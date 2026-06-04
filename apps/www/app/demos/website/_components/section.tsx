import type { ReactNode } from "react";
import { Heading, Text, Tag, cn } from "@hulian/ui";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** 标题区对齐，默认居中。 */
  align?: "center" | "start";
  /** 额外的容器 className（背景等）。 */
  className?: string;
  /** 内层 max-width，默认 6xl。 */
  width?: "5xl" | "6xl";
  children?: ReactNode;
}

const widthClass = { "5xl": "max-w-5xl", "6xl": "max-w-6xl" } as const;

/** 营销页统一区块：垂直节奏 + 可选 eyebrow/标题/副标题。纯布局，复用 hulian 排版原语。 */
export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  width = "6xl",
  children,
}: SectionProps) {
  const hasHeader = eyebrow || title || subtitle;
  return (
    <section id={id} className={cn("px-6 py-20 sm:py-24", className)}>
      <div className={cn("mx-auto w-full", widthClass[width])}>
        {hasHeader && (
          <div
            className={cn(
              "mb-12 flex flex-col gap-3",
              align === "center" ? "items-center text-center" : "items-start text-left",
            )}
          >
            {eyebrow && (
              <Tag variant="soft" tone="brand" size="sm">
                {eyebrow}
              </Tag>
            )}
            {title && (
              <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
                {title}
              </Heading>
            )}
            {subtitle && (
              <Text tone="muted" size="lg" className="max-w-2xl">
                {subtitle}
              </Text>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
