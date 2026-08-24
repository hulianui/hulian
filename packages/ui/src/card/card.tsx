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
    size: {
      md:
        "[--card-header-px:1.25rem] [--card-body-px:1.25rem] " +
        "[--card-body-py:1rem] [--card-footer-px:1.25rem]",
      sm:
        "[--card-header-px:1rem] [--card-body-px:1rem] " +
        "[--card-body-py:0.75rem] [--card-footer-px:1rem]",
    },
    divided: {
      true: "",
      false:
        "[&>:where([data-slot=card-header])]:border-b-0 " +
        "[&>:where([data-slot=card-footer])]:border-t-0",
    },
  },
  compoundVariants: [
    {
      size: "md",
      divided: true,
      class:
        "[--card-header-pt:0.75rem] [--card-header-pb:0.75rem] " +
        "[--card-footer-pt:0.75rem] [--card-footer-pb:0.75rem]",
    },
    {
      size: "md",
      divided: false,
      class:
        "[--card-header-pt:0.75rem] [--card-header-pb:0.5rem] " +
        "[--card-footer-pt:0.5rem] [--card-footer-pb:0.75rem]",
    },
    {
      size: "sm",
      divided: true,
      class:
        "[--card-header-pt:0.625rem] [--card-header-pb:0.625rem] " +
        "[--card-footer-pt:0.625rem] [--card-footer-pb:0.625rem]",
    },
    {
      size: "sm",
      divided: false,
      class:
        "[--card-header-pt:0.625rem] [--card-header-pb:0.5rem] " +
        "[--card-footer-pt:0.5rem] [--card-footer-pb:0.625rem]",
    },
  ],
  defaultVariants: { variant: "outline", size: "md", divided: true },
});

export function Card({ className, variant, size, divided, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant, size, divided }), className)} {...props} />
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
        "border-b border-border px-[var(--card-header-px,1.25rem)] pt-[var(--card-header-pt,0.75rem)] pb-[var(--card-header-pb,0.75rem)]",
        structured
          ? "flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
          : "font-medium",
        className,
      )}
      {...props}
    >
      {structured ? (
        <>
          {/*
            `basis-0 grow` 不是排版微调，是换行判据本身（#263）。
            flex 容器收集 item 成行时用的是 item 的 **hypothetical main size**（Flexbox §9.3），
            而 `flex-basis: auto` + 无 width → 它取 **max-content**。`min-w-0` 只放开「同一行里
            能收缩到多小」，**降不了 base size**，于是一条够长的 description 就能把 extra 整块
            挤到第二行 —— 哪怕左列完全收缩得起、调用方也写了 truncate / line-clamp（那两个管的是
            溢出怎么显示，同样不影响 max-content）。base 归 0 之后，换行不再由内容长度决定。

            这里**刻意不挂视口断点**（PageHeader 那边挂了 `max-sm:basis-auto`）：页头总是全宽，
            「视口窄」等于「页头窄」；而卡片的宽度由布局给（三列网格 515px、侧栏卡 280px），
            与视口没有关系 —— 900px 的桌面窗口里可能坐着一张 280px 的窄卡，375px 的手机上卡片
            反而是全宽的。拿视口断点去猜卡片宽度，两种情况都会猜错。extra 恒同行、左列该 truncate
            就 truncate，与 Ant 的 .ant-card-head-wrapper、MUI 的 CardHeader 同一取舍。
          */}
          <div className="min-w-0 grow basis-0">
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
  return (
    <div
      data-slot="card-body"
      className={cn("px-[var(--card-body-px,1.25rem)] py-[var(--card-body-py,1rem)]", className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "border-t border-border px-[var(--card-footer-px,1.25rem)] pt-[var(--card-footer-pt,0.75rem)] pb-[var(--card-footer-pb,0.75rem)] text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
