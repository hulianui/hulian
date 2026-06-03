import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { ProgressiveBlurProps } from "./progressive-blur.types";

// 吸取自 magicui.design Progressive Blur：N 层叠加 backdrop-blur，每层 mask 只露靠近指定侧的递增带，
// 叠出"越靠该侧越糊"的渐进模糊（可 RSC，纯 CSS，无色彩 token 依赖——只糊不染色）。
const dirMap = { top: "to top", bottom: "to bottom", left: "to left", right: "to right" } as const;

export function ProgressiveBlur({ side = "bottom", layers = 5, blur = 1, className }: ProgressiveBlurProps) {
  const dir = dirMap[side];
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      {Array.from({ length: layers }).map((_, i) => {
        // 第 i 层从 i/layers 处开始全黑（mask 露出），blur 逐层翻倍 → 越靠 side 叠加越多层
        const start = (i / layers) * 100;
        const mid = ((i + 0.5) / layers) * 100;
        const mask = `linear-gradient(${dir}, transparent ${start}%, black ${mid}%)`;
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={
              {
                backdropFilter: `blur(${blur * 2 ** i}px)`,
                WebkitBackdropFilter: `blur(${blur * 2 ** i}px)`,
                maskImage: mask,
                WebkitMaskImage: mask,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
