import type { ElementType } from "react";
import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { SafeAreaEdge, SafeAreaEdges, SafeAreaProps } from "./safe-area.types";

// 安全区适配原语（可 RSC）：把 env(safe-area-inset-*) 作为 padding/margin 应用到指定边，与 min 取 max 兜底。
// 需 app 层 <meta name="viewport" content="...,viewport-fit=cover">，否则 env() 恒为 0（退化为 min）。
// 实现走「自定义属性 --hl-safe-* 持有 max(min,env) + box 属性 var() 引用」：既可被消费方读取，
// 又规避 jsdom cssstyle 对 padding/margin 上 env()/max() 直值的丢弃（自定义属性原样保留）。
const GROUPS = {
  all: ["top", "right", "bottom", "left"],
  vertical: ["top", "bottom"],
  horizontal: ["left", "right"],
} satisfies Record<string, SafeAreaEdge[]>;

const PAD = { top: "paddingTop", right: "paddingRight", bottom: "paddingBottom", left: "paddingLeft" } as const;
const MAR = { top: "marginTop", right: "marginRight", bottom: "marginBottom", left: "marginLeft" } as const;

function resolveEdges(edges: SafeAreaEdges): SafeAreaEdge[] {
  return typeof edges === "string" ? GROUPS[edges] : edges;
}

export function SafeArea<E extends ElementType = "div">({
  edges = "all",
  mode = "padding",
  min = 0,
  as,
  className,
  style,
  ...rest
}: SafeAreaProps<E>) {
  const Comp = (as ?? "div") as "div";
  const minCss = typeof min === "number" ? `${min}px` : min;
  const box = mode === "margin" ? MAR : PAD;
  const computed: CSSProperties & Record<string, string> = {};
  for (const edge of resolveEdges(edges)) {
    const v = `--hl-safe-${edge}`;
    computed[v] = `max(${minCss}, env(safe-area-inset-${edge}, 0px))`;
    (computed as Record<string, string>)[box[edge]] = `var(${v})`;
  }
  return <Comp className={cn(className)} style={{ ...computed, ...style }} {...rest} />;
}
