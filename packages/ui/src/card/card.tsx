import type { HTMLAttributes, ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { CardHeaderProps, CardProps } from "./card.types";

// base 只放「无论哪档都成立」的东西。bg-surface 曾经也在 base 里，于是 plain 无论怎么写都去不掉底色
// （hulianui/hulian#159）—— 底色属于皮肤，跟着变体走，base 不碰。
export const cardVariants = cva("rounded-[var(--radius)] text-foreground transition-shadow", {
  variants: {
    variant: {
      outline: "border border-border bg-surface",
      elevated: "border border-hairline bg-surface shadow-sm hover:shadow-md",
      // 推荐/高亮卡片：清晰的 primary 双线描边 + 干净中性投影。
      // border-box 下 border-2 不改变外框尺寸（只内缩 1px），网格里与其余卡片对齐不偏移。
      featured: "border-2 border-primary bg-surface shadow-md",
      // 不画皮：外皮（边框/底色/阴影）由页面自己的 CSS 提供时用它，只留圆角 + 文字色 + 三段插槽语义。
      plain: "",
    },
  },
  defaultVariants: { variant: "outline" },
});

// 分隔线同样是皮肤而不是结构，所以 divided=false 要能整卡关掉（#203 —— #159 那条原则延伸到分区）。
// 走「Card 上的直接子选择器」而不是 context 下发：Card 至今没有 "use client"，为一个布尔值把整张卡
// 拖进 client 边界不划算；限定直接子（>）则卡里套卡时外层的取值不会传染给内层。
// 关线的同时收内边距：那段呼吸本来是分隔线撑着的，只去线会剩下一道无来由的留白。
const undividedSlots =
  "[&>[data-slot=card-header]]:border-b-0 [&>[data-slot=card-header]]:pb-2 " +
  "[&>[data-slot=card-footer]]:border-t-0 [&>[data-slot=card-footer]]:pt-2";

export function Card({ className, variant, divided, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant }), divided === false && undividedSlots, className)}
      {...props}
    />
  );
}

// 标题的结构身份（hulianui/hulian#226）：三个槽一个都不传时逐字维持原样（裸插槽 + font-medium），
// 传了任意一个就切到「标题群 / 右侧操作区」两列排布 —— 这时 font-medium 从容器上撤掉、只落在标题
// 元素上，否则同一行的图标、Tag、计数会被一起染成标题字重（那正是本 issue 报的现象）。
export function CardHeader({
  className,
  title,
  description,
  extra,
  children,
  ...props
}: CardHeaderProps) {
  // 「有值」的口径与 PageHeader 的 meta 一致：`null` / `undefined` / `false` / `""` 都算没传。
  // 少了这一条，`title={isEditing && "编辑中"}` 在 false 时会切进结构态而标题是空的 ——
  // children 被挪进左列、font-medium 从容器撤走，于是一个条件写法悄悄改掉了另一段的字重。
  const has = (node: ReactNode) => node != null && node !== false && node !== "";
  const structured = has(title) || has(description) || has(extra);
  return (
    <div
      data-slot="card-header"
      className={cn(
        "border-b border-border px-5 py-3",
        structured
          ? "flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
          : "font-medium",
        className,
      )}
      {...props}
    >
      {structured ? (
        <>
          <div className="min-w-0">
            {has(title) && (
              <div
                data-slot="card-title"
                className="flex flex-wrap items-center gap-2 text-base leading-snug font-medium text-foreground"
              >
                {title}
              </div>
            )}
            {has(description) && (
              <div data-slot="card-description" className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </div>
            )}
            {children}
          </div>
          {has(extra) && (
            <div data-slot="card-header-extra" className="flex shrink-0 items-center gap-2">
              {extra}
            </div>
          )}
        </>
      ) : (
        children
      )}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-body" className={cn("px-5 py-4 text-sm", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn("border-t border-border px-5 py-3 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
