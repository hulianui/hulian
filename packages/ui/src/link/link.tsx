import { cva } from "class-variance-authority";
import { ExternalLink } from "lucide-react";
import { cn } from "../lib/cn";
import type { LinkProps } from "./link.types";

// 纯皮肤 a 标签（可 RSC）。消费者若需路由集成，自行包 next/link 再透传 className。
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

export function Link({ tone, underline, external, className, children, ...props }: LinkProps) {
  return (
    <a
      className={cn(linkVariants({ tone, underline }), className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
      {external && <ExternalLink className="size-3.5" aria-hidden />}
    </a>
  );
}
