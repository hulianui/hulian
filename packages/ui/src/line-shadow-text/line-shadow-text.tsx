import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { LineShadowTextProps } from "./line-shadow-text.types";

// 吸取自 magicui.design Line Shadow Text：文字后面压一层斜向偏移的副本，副本用 45° 条纹渐变
// 经 bg-clip-text 裁进字形 —— 于是投影是**硬边斜线**而不是 text-shadow 那种模糊晕开。
//
// 瑚琏化三点：
// ① 纯 CSS，无 "use client"、无 RAF，RSC 里直接用；默认还**不动**（见 types 里 animated 的注释）。
// ② 投影层是**真 DOM 节点 + aria-hidden**，不是 ::after + content:attr(data-text)。
//    伪元素的 content 会被部分读屏当文本念，于是同一个词被念两遍；真节点能明确标记为装饰。
//    （与 Annotation 同一条判据。）
// ③ 默认色走 --color-foreground 而不是写死的 black：写死在暗色主题下是一团看不见的黑。
export function LineShadowText({
  children,
  shadowColor = "var(--color-foreground)",
  offset = "0.04em",
  lineWidth = "0.06em",
  animated = false,
  duration = "15s",
  className,
  style,
  ...props
}: LineShadowTextProps) {
  const vars = {
    "--hulian-line-shadow-color": shadowColor,
    "--hulian-line-shadow-offset": offset,
    "--hulian-line-shadow-width": lineWidth,
    "--hulian-line-shadow-duration": duration,
    ...style,
  } as CSSProperties;

  return (
    <span className={cn("relative z-0 inline-block", className)} style={vars} {...props}>
      {/* 投影层：绝对定位在本体右下方，-z-10 压在本体之下。
          45° 条纹按 background-size 平铺，bg-clip-text + 透明文字把条纹裁成字形。
          用 aria-hidden 而不是 sr-only 反过来藏本体：本体才是可选中、可复制的那份文本。 */}
      <span
        aria-hidden
        className={cn(
          "absolute left-[var(--hulian-line-shadow-offset)] top-[var(--hulian-line-shadow-offset)] -z-10",
          "bg-clip-text text-transparent",
          "[background-image:linear-gradient(45deg,transparent_45%,var(--hulian-line-shadow-color)_45%,var(--hulian-line-shadow-color)_55%,transparent_0)]",
          "[background-size:var(--hulian-line-shadow-width)_var(--hulian-line-shadow-width)]",
          animated &&
            "[animation:hulian-line-shadow_var(--hulian-line-shadow-duration)_linear_infinite] motion-reduce:[animation:none]",
        )}
      >
        {children}
      </span>
      {children}
    </span>
  );
}
