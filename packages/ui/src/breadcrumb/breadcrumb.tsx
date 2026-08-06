import { Fragment, memo } from "react";
import { cn } from "../lib/cn";
import type { BreadcrumbProps } from "./breadcrumb.types";

// 纯皮肤 + 正确 a11y 语义（零 Base UI、零浮层、零 Portal，纯静态可 RSC，照 badge/alert 范式）：
// <nav aria-label> → <ol> → 每项 <li>；链接项 <a>，当前页 <span aria-current="page"> 且不可点；
// 分隔符落独立 <li aria-hidden> 装饰位。只消费语义 token（text-muted/text-foreground/border）。
function BreadcrumbImpl({
  items,
  separator = "/",
  className,
  "aria-label": ariaLabel = "breadcrumb",
  ...props
}: BreadcrumbProps) {
  return (
    <nav aria-label={ariaLabel} className={cn("text-sm", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          const isCurrent = item.current ?? isLast; // 末项默认即当前页，current 可显式覆盖
          return (
            <Fragment key={i}>
              <li className="inline-flex items-center">
                {isCurrent ? (
                  <span aria-current="page" className="font-medium text-foreground">
                    {item.label}
                  </span>
                ) : item.href != null ? (
                  <a href={item.href} className="text-muted hover:text-foreground">
                    {item.label}
                  </a>
                ) : (
                  // 无 href 的非当前项：不可导航的祖先，渲染为中性纯文本
                  <span className="text-muted">{item.label}</span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="select-none text-muted [&>svg]:size-3.5">
                  {separator}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
BreadcrumbImpl.displayName = "Breadcrumb";

// 面包屑挂在页面骨架顶部，父级（布局壳 / 路由容器）一动就整条重算，而路径本身几乎不变。
// items 引用稳定时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
// 注：整条 items 是同一个数组 prop，逐项没有独立的子组件可 memo，故 memo 在根。
export const Breadcrumb = memo(BreadcrumbImpl);
Breadcrumb.displayName = "Breadcrumb";
