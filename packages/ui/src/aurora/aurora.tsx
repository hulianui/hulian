import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { AuroraProps } from "./aurora.types";

// 吸取自 Aceternity UI aurora-background：多层 repeating-linear-gradient 叠加 +
// background-position 横向平移动画（50% → 350% · 同 Aceternity 原始关键帧节奏）+
// filter blur 柔化色带边缘 + 可选径向 mask 渐隐聚焦中部。
//
// 瑚琏化要点：
// 1. 颜色全吃 chart token（默认 chart-1/2/4，自动明暗适配，替 Aceternity 写死 blue/indigo/violet）
// 2. 去掉 mix-blend-difference + dark:invert 的"深色翻转"技巧——该技巧依赖"黑底=白差"
//    推算，在瑚琏亮色 bg-surface（白/浅灰）上直接失效。改用两层透明渐变叠加，
//    明暗两态均可工作，只须给容器加深色底色即可展现完整极光效果。
// 3. blur / speed / showRadialMask 全走 CSS 变量，减少 JS 插值噪声。
// 4. reduced-motion：motion-reduce:[animation:none] 保留静态渐变（彩色而非消失）。
// 5. 纯 CSS 渲染层（aria-hidden），RSC 安全（无 "use client"、无 useEffect）。
// 6. 关键帧 hulian-aurora-bg 落 preset.css，避免与 AuroraText 的 hulian-aurora 撞名。

const DEFAULT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-4)",
];

export function Aurora({
  colors = DEFAULT_COLORS,
  blur = 30,
  speed = 20,
  showRadialMask = true,
  className,
  children,
  style,
}: AuroraProps) {
  // 构建双层 repeating-linear-gradient 极光纹理：
  // 第一层：主色带，倾斜角 ~115deg，色宽不均匀制造有机感
  // 第二层：辅助层，角度稍偏 ~125deg + 反向色序，两层叠加产生混色干涉
  const c0 = colors[0] ?? "var(--color-chart-1)";
  const c1 = colors[1] ?? "var(--color-chart-2)";
  const c2 = colors[2] ?? "var(--color-chart-4)";
  const c3 = colors[3] ?? c0; // 第四色循环回 c0，使色带首尾衔接无缝

  // repeating-linear-gradient：每段色带 = 透明过渡 + 主色峰值 + 透明过渡
  // 宽度差异（20% / 30% / 25% …）使极光宽窄不均，避免机械感
  const stripe1 = [
    `repeating-linear-gradient(`,
    `  115deg,`,
    `  transparent 0%,`,
    `  ${c0} 10%,`,
    `  transparent 20%,`,
    `  ${c1} 30%,`,
    `  transparent 45%,`,
    `  ${c2} 55%,`,
    `  transparent 70%,`,
    `  ${c3} 78%,`,
    `  transparent 90%`,
    `)`,
  ].join(" ");

  // 第二层：角度偏移 10°，色序错位，与第一层叠加后极光边界柔化
  const stripe2 = [
    `repeating-linear-gradient(`,
    `  125deg,`,
    `  transparent 0%,`,
    `  ${c1} 8%,`,
    `  transparent 22%,`,
    `  ${c0} 35%,`,
    `  transparent 50%,`,
    `  ${c3} 62%,`,
    `  transparent 75%,`,
    `  ${c2} 85%,`,
    `  transparent 95%`,
    `)`,
  ].join(" ");

  // 径向 mask：中心不透明 → 四角渐隐，让极光聚焦在内容区
  // 用两个方向 ellipse 叠加（logical AND mask-composite）达到更自然的四角淡出
  const radialMask = showRadialMask
    ? "radial-gradient(ellipse 80% 70% at 50% 50%, black 60%, transparent 100%)"
    : undefined;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={style}
    >
      {/* 渐隐遮罩层：static absolute inset-0，mask 固定在容器上（不随流动层移动）。 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={
          radialMask
            ? ({ WebkitMaskImage: radialMask, maskImage: radialMask } as CSSProperties)
            : undefined
        }
      >
        {/* 极光流动层：纹理静态、只动 transform（GPU 合成，不逐帧重绘/重 blur）。
            inset 放大 + scale>1 保证 translate/rotate 时不露边。 */}
        <div
          className={cn(
            "absolute inset-[-30%] will-change-transform",
            "[animation:hulian-aurora-bg_var(--hulian-aurora-bg-duration,20s)_ease-in-out_infinite]",
            "motion-reduce:[animation:none]",
          )}
          style={
            {
              backgroundImage: `${stripe1}, ${stripe2}`,
              backgroundBlendMode: "screen",
              filter: `blur(${blur}px)`,
              "--hulian-aurora-bg-duration": `${speed}s`,
            } as CSSProperties
          }
        />
      </div>
      {/* 内容层：relative z-10，确保覆盖在极光上方 */}
      {children != null && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  );
}
