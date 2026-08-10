"use client";
import { memo } from "react";
import { cn } from "../lib/cn";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../hover-card/hover-card";
import type { GlimpseProps } from "./glimpse.types";

// Glimpse = 链接/词条的悬停预览（维基式 hover preview / 链接卡片）。
// dogfood HoverCard 引擎（hover 开合 + 非模态焦点语义），换皮成「封面图 + 标题 + 描述 + 域名」预览卡。
// 触发器随 href 渲染为外链 <a> 或纯 <span>，保持行内排版。
function hostOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

function GlimpseImpl({
  children,
  image,
  title,
  description,
  href,
  side = "bottom",
  align = "center",
  openDelay = 300,
  closeDelay = 150,
  className,
  contentClassName,
}: GlimpseProps) {
  return (
    <HoverCard openDelay={openDelay} closeDelay={closeDelay}>
      <HoverCardTrigger
        // 触发器是行内链接/词条，非原生 button：显式告知 Base UI 避免误判告警
        nativeButton={false}
        render={
          href ? (
            <a href={href} target="_blank" rel="noreferrer" />
          ) : (
            <span />
          )
        }
        className={cn(
          "cursor-pointer text-primary underline decoration-dotted underline-offset-2 outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        {children}
      </HoverCardTrigger>

      <HoverCardContent side={side} align={align} className={cn("w-72 p-0 overflow-hidden", contentClassName)}>
        {image && (
          <div className="aspect-[2/1] w-full overflow-hidden bg-surface-hover">
            {/* 预览封面：原生 img 避免 next/image 约束；懒加载 */}
            <img src={image} alt="" loading="lazy" className="size-full object-cover" />
          </div>
        )}
        <div className="flex flex-col gap-1 p-3">
          {title != null && <div className="font-medium text-foreground">{title}</div>}
          {description != null && (
            <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>
          )}
          {href && <div className="mt-0.5 truncate text-xs text-muted-foreground/80">{hostOf(href)}</div>}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export const Glimpse = memo(GlimpseImpl);
Glimpse.displayName = "Glimpse";
