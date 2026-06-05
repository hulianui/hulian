import type { CSSProperties } from "react";
import { Activity, Fingerprint, Lock } from "lucide-react";
import { cn } from "../lib/cn";
import type { ReflectiveCardProps } from "./reflective-card.types";

// 吸取自 React Bits ReflectiveCard：一张「金属反光」证件卡——原版用 getUserMedia 摄像头实时画面
// 经 SVG feTurbulence/feDisplacementMap/feSpecularLighting 滤镜扭曲成金属波纹，叠加 sheen 高光带、
// fractalNoise 磨砂噪点、渐变描边，营造拿在手里反光的金属卡质感。
//
// 瑚琏化要点：
// 1. 彻底去掉摄像头（getUserMedia 隐私敏感、RSC/SSR/jsdom 均不可用）。改用一道沿对角线往复横扫的
//    金属高光带（transform 平移，GPU 合成，不逐帧重绘）模拟「转动卡片时反光流动」，无需任何媒体权限。
// 2. 颜色全吃 token：高光默认 var(--color-foreground)、暗部默认 var(--color-chart-1)，自动明暗适配，
//    替原版写死的 white / #1a1a1a / rgba(255,255,255,…)。
// 3. 噪点磨砂用内联 data-URI feTurbulence（静态、无外链），强度走 --hl-rc-roughness 变量。
// 4. 纯 CSS 渲染（无 "use client"、无 useEffect/ref），RSC 安全。
// 5. reduced-motion：高光带 motion-reduce:[animation:none] 定格为静态斜向高光（不消失，DOM 不变）。
// 6. 关键帧 hulian-reflective-card 落 preset.css，仅平移高光带 transform。
// 7. 内容可插槽化（title/subtitle/badge/footer 或 children 完全自定义），不再写死「ALEXANDER DOE」。

// 静态 fractalNoise 磨砂噪点（内联 data-URI，无外链、门禁友好）
const NOISE_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function ReflectiveCard({
  title = "ALEXANDER DOE",
  subtitle = "SENIOR DEVELOPER",
  badge = "SECURE ACCESS",
  footerLabel = "ID NUMBER",
  footerValue = "8901-2345-6789",
  children,
  sheenColor = "var(--color-foreground)",
  baseColor = "var(--color-chart-1)",
  speed = 6,
  roughness = 0.35,
  metalness = 1,
  className,
  style,
  ...props
}: ReflectiveCardProps) {
  const clampedRough = Math.max(0, Math.min(1, roughness));
  const clampedMetal = Math.max(0, Math.min(1, metalness));

  return (
    <div
      {...props}
      style={
        {
          "--hl-rc-sheen": sheenColor,
          "--hl-rc-base": baseColor,
          "--hl-rc-duration": `${speed}s`,
          "--hl-rc-roughness": clampedRough,
          "--hl-rc-metal": clampedMetal,
          ...style,
        } as CSSProperties
      }
      className={cn(
        "relative isolate h-[28rem] w-72 overflow-hidden rounded-2xl",
        "shadow-2xl",
        className,
      )}
    >
      {/* 金属底色层：以 base token 调出的暗部斜向渐变 */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(145deg, color-mix(in oklch, var(--hl-rc-base) 55%, #000) 0%, color-mix(in oklch, var(--hl-rc-base) 22%, #000) 45%, #0a0a0a 100%)",
        }}
      />

      {/* 高光横扫层：一道对角金属反光带，transform 平移往复（GPU 合成）。
          inset 放大保证平移时不露边。reduced-motion 定格为静态高光。 */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-[-40%] -z-10 will-change-transform mix-blend-overlay",
          "[animation:hulian-reflective-card_var(--hl-rc-duration,6s)_ease-in-out_infinite]",
          "motion-reduce:[animation:none]",
        )}
        style={{
          opacity: "var(--hl-rc-metal)",
          backgroundImage:
            "linear-gradient(115deg, transparent 30%, color-mix(in oklch, var(--hl-rc-sheen) 65%, transparent) 47%, color-mix(in oklch, var(--hl-rc-sheen) 85%, transparent) 50%, color-mix(in oklch, var(--hl-rc-sheen) 65%, transparent) 53%, transparent 70%)",
        }}
      />

      {/* 磨砂噪点层：静态 fractalNoise，overlay 混合，强度由 roughness 控 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-overlay"
        style={{
          opacity: "var(--hl-rc-roughness)",
          backgroundImage: NOISE_DATA_URI,
        }}
      />

      {/* 渐变描边层：环绕一圈金属发丝光边（mask 镂空内部，只留 1px 边） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          padding: "1px",
          background:
            "linear-gradient(135deg, color-mix(in oklch, var(--hl-rc-sheen) 80%, transparent) 0%, color-mix(in oklch, var(--hl-rc-sheen) 20%, transparent) 50%, color-mix(in oklch, var(--hl-rc-sheen) 60%, transparent) 100%)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
        }}
      />

      {/* 内容层 */}
      <div className="relative flex h-full flex-col justify-between p-8 text-white">
        {children != null ? (
          children
        ) : (
          <>
            {badge != null && (
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <span className="flex items-center gap-1.5 rounded border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-bold tracking-[0.1em]">
                  <Lock size={14} aria-hidden />
                  {badge}
                </span>
                <Activity size={20} className="opacity-80" aria-hidden />
              </div>
            )}

            <div className="flex flex-col items-center gap-2 text-center">
              {title != null && (
                <h2 className="m-0 text-2xl font-bold tracking-[0.05em] [text-shadow:0_2px_4px_rgba(0,0,0,0.35)]">
                  {title}
                </h2>
              )}
              {subtitle != null && (
                <p className="m-0 text-xs uppercase tracking-[0.2em] opacity-70">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-end justify-between border-t border-white/20 pt-6">
              <div className="flex flex-col gap-1">
                {footerLabel != null && (
                  <span className="text-[9px] tracking-[0.1em] opacity-60">
                    {footerLabel}
                  </span>
                )}
                {footerValue != null && (
                  <span className="font-mono text-sm tracking-[0.05em]">
                    {footerValue}
                  </span>
                )}
              </div>
              <Fingerprint size={32} className="opacity-40" aria-hidden />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
