import { cn } from "../lib/cn";
import type { BentoGridProps, BentoCardProps } from "./bento-grid.types";

// 吸取自 magicui.design Bento Grid：错落栅格卡片容器（可 RSC，纯 CSS）。
// 瑚琏化：卡片用 surface/border token + hover 抬升；跨列跨行由消费者在 BentoCard 上用
// className（如 "md:col-span-2 md:row-span-2"）控制，BentoGrid 只定义基础栅格。
export function BentoGrid({ className, children, ...props }: BentoGridProps) {
  return (
    <div
      className={cn("grid auto-rows-[12rem] grid-cols-1 gap-4 sm:grid-cols-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function BentoCard({ title, description, icon, cta, className, children, ...props }: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius)] border border-border bg-surface p-5",
        "transition-shadow hover:shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
      <div className="flex flex-col gap-1">
        {icon && <div className="mb-2 text-primary [&>svg]:size-7">{icon}</div>}
        {title && <h3 className="text-base font-semibold text-foreground">{title}</h3>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {cta && (
        <div className="mt-3 translate-y-1 opacity-0 transition-[translate,opacity] ease-out group-hover:translate-y-0 group-hover:opacity-100">
          {cta}
        </div>
      )}
    </div>
  );
}
