import { cva } from "class-variance-authority";
import { cloneElement, type ReactNode } from "react";
import { ExternalLink } from "../_icons";
import { cn } from "../lib/cn";
import type { LinkProps } from "./link.types";

// 纯皮肤 a 标签（可 RSC）。需要路由集成时走 render 口子（承载 next/link、react-router 的 Link）。
export const linkVariants = cva(
  "inline-flex items-center gap-1 rounded-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  {
    variants: {
      tone: {
        primary: "text-primary hover:text-primary-hover",
        foreground: "text-foreground hover:text-muted",
        danger: "text-danger hover:opacity-80",
      },
      underline: {
        always: "underline underline-offset-4",
        hover: "underline-offset-4 hover:underline",
        none: "no-underline",
      },
    },
    defaultVariants: { tone: "primary", underline: "hover" },
  },
);

export function Link({ tone, underline, external, className, children, render, ...props }: LinkProps) {
  const externalAttrs = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const trailing = external ? <ExternalLink className="size-3.5" aria-hidden /> : null;

  // render：渲染为自定义元素（next/link、react-router Link…）。href 由该元素自带，
  // 这里只合并皮肤与 Link 自身的 props —— 曾因缺这个口子，`<Link render={…}>` 的 render
  // 被当未知 DOM 属性交给 <a> 后静默丢弃，产出没有 href、也没有 link role 的死锚点。
  if (render) {
    const renderProps = render.props as { className?: string; children?: ReactNode };
    return cloneElement(
      render,
      {
        ...externalAttrs,
        ...props,
        className: cn(linkVariants({ tone, underline }), className, renderProps.className),
      } as Record<string, unknown>,
      <>
        {children ?? renderProps.children}
        {trailing}
      </>,
    );
  }

  return (
    <a className={cn(linkVariants({ tone, underline }), className)} {...externalAttrs} {...props}>
      {children}
      {trailing}
    </a>
  );
}
