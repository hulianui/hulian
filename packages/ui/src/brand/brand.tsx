import { cloneElement, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import type { BrandProps, BrandSize } from "./brand.types";

// Brand = 品牌标识：方角徽章 + 站点名（+ 可选副标题）。
// 导航栏左上、侧栏顶部、页脚品牌列、登录页品牌区 —— 每个中后台/会员站都有的四处。
//
// 为什么 Avatar 顶不了：Avatar 是**圆**的（size 只给圆直径），品牌徽章要方角 + token 圆角；
// 套 Avatar 就得用 className 改形状，那正是 guard 与 conventions 里说的「在业务侧打补丁」
// （hulianui/hulian#57）。纯展示零 hook（可 RSC）。

const MARK: Record<BrandSize, string> = { sm: "size-7 text-xs", md: "size-9 text-sm", lg: "size-11 text-base" };
const NAME: Record<BrandSize, string> = { sm: "text-sm", md: "text-base", lg: "text-lg" };
const GAP: Record<BrandSize, string> = { sm: "gap-2", md: "gap-2.5", lg: "gap-3" };

/** 缺省徽章内容：取品牌名首字（中文一个字 / 英文一个字母）。 */
function initial(name: ReactNode): string {
  if (typeof name !== "string") return "";
  const first = [...name.trim()][0];
  return first ? first.toUpperCase() : "";
}

export function Brand({
  mark,
  name,
  description,
  size = "md",
  color = "primary",
  render,
  href,
  className,
  ...rest
}: BrandProps) {
  const accent = resolveTone(color) ?? "var(--color-primary)";

  const content = (
    <>
      <span
        className={cn(
          // 方角 + token 圆角（对齐库内其它方形容器），不是圆——这正是它区别于 Avatar 的地方。
          "grid shrink-0 place-items-center overflow-hidden rounded-[calc(var(--radius)-0.125rem)] font-semibold [&>img]:size-full [&>img]:object-cover [&>svg]:size-1/2",
          MARK[size],
        )}
        style={{ backgroundColor: accent, color: "var(--color-primary-foreground)" }}
        aria-hidden={name != null || undefined}
      >
        {mark ?? initial(name)}
      </span>
      {name != null && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className={cn("truncate font-semibold text-foreground", NAME[size])}>{name}</span>
          {description != null && (
            <span className="truncate text-xs text-muted">{description}</span>
          )}
        </span>
      )}
    </>
  );

  const cls = cn("inline-flex min-w-0 items-center", GAP[size], className);

  // render 逃生口优先（框架路由件），其次 href（普通链接），最后纯展示。
  if (render) {
    const own = render.props as { className?: string };
    return cloneElement(
      render,
      { ...rest, className: cn(cls, own.className) } as Record<string, unknown>,
      content,
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <span className={cls} {...rest}>
      {content}
    </span>
  );
}
