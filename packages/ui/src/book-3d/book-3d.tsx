import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { Book3DProps } from "./book-3d.types";

const ribbonToneClass: Record<NonNullable<Book3DProps["ribbonTone"]>, string> = {
  brand: "bg-primary text-bg",
  danger: "bg-[#d9482b] text-white",
  success: "bg-[#1f9d6b] text-white",
};

/**
 * 3D 立体书 —— CSS 3D transform 透视书体（前封 + 书脊 + 右侧页块 + 后封）。
 * 静止 rotateY(-25deg) 露出厚度，hover 转正；纯 transform（GPU 合成），
 * prefers-reduced-motion 降级为无过渡。href→<a> / onClick→<button> / 否则 <div>。
 */
export function Book3D({
  title,
  subtitle,
  cover,
  coverColor = { from: "var(--color-primary)", to: "color-mix(in oklab, var(--color-primary) 60%, #000)" },
  spineColor = "#efe9dd",
  thickness = "2.25rem",
  ribbon,
  ribbonTone = "danger",
  href,
  onClick,
  target,
  className,
}: Book3DProps) {
  const coverStyle: CSSProperties = cover
    ? { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundImage: `linear-gradient(135deg, ${coverColor.from}, ${coverColor.to})` };

  const vars = { "--book-thk": thickness, "--book-spine": spineColor } as CSSProperties;

  const body = (
    <span
      className={cn(
        "group relative block aspect-[3/4] w-44 shrink-0 select-none [perspective:1400px]",
        className,
      )}
      style={vars}
    >
      <span
        className={cn(
          "relative block h-full w-full [transform-style:preserve-3d]",
          "[transform:rotateY(-25deg)] transition-transform duration-700 ease-out",
          "group-hover:[transform:rotateY(0deg)] motion-reduce:transition-none",
        )}
      >
        {/* 右侧页块（纸张厚度） */}
        <span
          aria-hidden
          className="absolute right-0 top-[3px] bottom-[3px] origin-right [width:var(--book-thk)] [transform:rotateY(90deg)] [background:repeating-linear-gradient(90deg,var(--book-spine),var(--book-spine)_1px,color-mix(in_oklab,var(--book-spine)_82%,#000)_2px,var(--book-spine)_3px)]"
        />
        {/* 左侧书脊 */}
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full origin-left [width:var(--book-thk)] [transform:rotateY(-90deg)] [background:linear-gradient(90deg,rgba(0,0,0,.32),rgba(0,0,0,.08))]"
        />
        {/* 后封 */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-r-[3px] rounded-l-sm bg-foreground/80 [transform:translateZ(calc(var(--book-thk)/-2))]"
        />
        {/* 前封 */}
        <span
          className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-r-[3px] rounded-l-sm p-4 text-white shadow-[0_22px_40px_-18px_rgba(0,0,0,.55)] [transform:translateZ(calc(var(--book-thk)/2))]"
          style={coverStyle}
        >
          {/* 封脊高光：左侧装订暗带 */}
          <span aria-hidden className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 to-transparent" />
          <span className="relative text-[1.6rem] font-bold leading-tight tracking-tight drop-shadow">{title}</span>
          {subtitle != null && (
            <span className="relative text-sm font-medium uppercase tracking-widest text-white/85">{subtitle}</span>
          )}
        </span>
        {/* 角标缎带 */}
        {ribbon && (
          <span
            className="pointer-events-none absolute -right-px top-[6px] z-10 [transform:translateZ(calc(var(--book-thk)/2))]"
            aria-hidden
          >
            <span
              className={cn(
                "block px-3 py-0.5 text-[11px] font-bold tracking-wide shadow-md [clip-path:polygon(0_0,100%_0,100%_100%,8px_100%)]",
                ribbonToneClass[ribbonTone],
              )}
            >
              {ribbon}
            </span>
          </span>
        )}
      </span>
    </span>
  );

  if (href) {
    return (
      <a href={href} target={target} rel={target === "_blank" ? "noreferrer" : undefined} className="inline-block">
        {body}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="inline-block bg-transparent p-0">
        {body}
      </button>
    );
  }
  return body;
}
