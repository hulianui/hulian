import { memo } from "react";
import { cn } from "../lib/cn";
import { Heading } from "../heading";
import { Text } from "../text";
import type { SectionHeaderProps } from "./section-header.types";

// 营销页 / 文档首页的分节标题：eyebrow 小字 + 大标题（后半句主色强调）+ 一段导语。
// 此前每个首页区块各写一份 `Text text-primary` + 裸 h2 + `span text-primary`，字号 / 间距 / 换行规则
// 四处四个样。纯展示，可 RSC。
const BREAK = {
  always: <br />,
  mobile: <br className="sm:hidden" />,
  space: " ",
  none: null,
} as const;

function SectionHeaderImpl({
  eyebrow,
  title,
  accent,
  accentBreak = "always",
  description,
  align = "start",
  level = 2,
  className,
  ...rest
}: SectionHeaderProps) {
  const center = align === "center";
  return (
    <div className={cn(center && "text-center", className)} {...rest}>
      {eyebrow != null && (
        <Text size="sm" weight="semibold" tone="primary" className="mb-3">
          {eyebrow}
        </Text>
      )}
      {/* 分节标题一档：窄屏 30px、sm 起 36px，粗体；text-balance 让折成两行时两行等长。 */}
      <Heading level={level} weight="bold" balance className="text-3xl sm:text-4xl">
        {title}
        {accent != null && (
          <>
            {BREAK[accentBreak]}
            <span className="text-primary">{accent}</span>
          </>
        )}
      </Heading>
      {description != null && (
        <Text tone="muted" className={cn("mt-4 max-w-2xl leading-relaxed", center && "mx-auto")}>
          {description}
        </Text>
      )}
    </div>
  );
}
SectionHeaderImpl.displayName = "SectionHeader";

export const SectionHeader = memo(SectionHeaderImpl);
SectionHeader.displayName = "SectionHeader";
