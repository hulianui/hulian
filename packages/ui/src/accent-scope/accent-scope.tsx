import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { AccentScopeProps } from "./accent-scope.types";

// 局部换主色：只写一个 data-accent-scope 标记和一个 --hl-accent-hue 变量，
// 派生规则全在 @hulianui/tokens 的 semantic.css（[data-accent-scope] 块）里 ——
// 颜色怎么从色相算出来是 token 层的事，组件只负责把色相交给它。纯 div，RSC 安全。
export function AccentScope({
  hue,
  transition = 0,
  theme,
  className,
  style,
  children,
  ...props
}: AccentScopeProps) {
  const vars: CSSProperties & Record<string, string | number> = {};
  if (hue !== undefined) vars["--hl-accent-hue"] = hue;
  if (transition > 0) vars.transition = `--hl-accent-hue ${transition}ms ease`;
  return (
    <div
      data-accent-scope=""
      data-theme={theme}
      className={cn(className)}
      style={{ ...vars, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
