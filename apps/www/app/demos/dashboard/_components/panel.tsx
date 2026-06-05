"use client";
import { cn } from "@hulian/ui";

// 大屏面板外壳：玻璃质感卡片 + 角标题。统一各区视觉，吃明暗 token。
export function Panel({
  title,
  extra,
  className,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col rounded-xl border border-border/70 bg-surface/55 backdrop-blur-sm",
        className,
      )}
    >
      {title != null && (
        <header className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground/90">
            <span className="h-3.5 w-1 rounded-full bg-primary" />
            {title}
          </h3>
          {extra}
        </header>
      )}
      <div className={cn("min-h-0 flex-1 p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
