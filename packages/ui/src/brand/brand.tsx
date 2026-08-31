import { cloneElement, type ReactNode, memo } from "react";
import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import type { BrandProps, BrandSize } from "./brand.types";

// Brand = 品牌标识：方角徽章 + 站点名（+ 可选副标题）。
// 导航栏左上、侧栏顶部、页脚品牌列、登录页品牌区 —— 每个中后台/会员站都有的四处。
//
// 为什么 Avatar 顶不了：Avatar 是**圆**的（size 只给圆直径），品牌徽章要方角 + token 圆角；
// 套 Avatar 就得用 className 改形状，那正是 guard 与 conventions 里说的「在业务侧打补丁」
// （hulianui/hulian#57）。纯展示零 hook（可 RSC）。

const MARK: Record<BrandSize, string> = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-11 text-base",
};
const NAME: Record<BrandSize, string> = { sm: "text-sm", md: "text-base", lg: "text-lg" };
const GAP: Record<BrandSize, string> = { sm: "gap-2", md: "gap-2.5", lg: "gap-3" };

/** 缺省徽章内容：取品牌名首字（中文一个字 / 英文一个字母）。 */
function initial(name: ReactNode): string {
  if (typeof name !== "string") return "";
  const first = [...name.trim()][0];
  return first ? first.toUpperCase() : "";
}

function BrandImpl({
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
          "relative grid shrink-0 place-items-center overflow-hidden rounded-[calc(var(--radius)-0.125rem)] font-semibold [&>svg]:size-1/2",
          // 媒体类 mark 一律铺满徽章：img（含 GIF / APNG / 动图 WebP）、<picture>（给「减弱动效」
          // 用户一张静态回退的标准写法，img 在它里面一层，所以尺寸用后代选择器）、<video>（静音
          // 循环的动态 logo）、<canvas>（自绘动画）。
          //
          // 为什么是 absolute inset-0 而不是 size-full：这个徽章是 grid 容器，替换元素（img /
          // video / canvas）作为 grid 项时 height:100% 在 Chrome 里解析不出来（实测 2:1 的图得到
          // 36×0，flex 同样 0×36），旧的 `[&>img]:size-full` 只是被 1:1 素材掩盖了、object-cover
          // 从没真正裁过图。绝对定位子元素的百分比按徽章的 padding box 解析，永远是定值。
          "[&>img]:absolute [&>picture]:absolute [&>video]:absolute [&>canvas]:absolute [&>img]:inset-0 [&>picture]:inset-0 [&>video]:inset-0 [&>canvas]:inset-0",
          "[&_img]:size-full [&_img]:object-cover [&>picture]:block [&>picture]:size-full [&>video]:size-full [&>video]:object-cover [&>canvas]:size-full",
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
            <span className="truncate text-xs text-muted-foreground">{description}</span>
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

BrandImpl.displayName = "Brand";

// Brand 出现在导航栏/侧栏/页脚这类**每次路由或状态变化都会重渲的外壳**里，props 全是稳定原语时
// React 无法自己 bailout —— 与 Button/Checkbox/Chip 同一处方（hulianui/hulian#89）。
export const Brand = memo(BrandImpl);
Brand.displayName = "Brand";
