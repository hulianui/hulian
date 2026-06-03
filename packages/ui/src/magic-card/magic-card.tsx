"use client";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import type { CSSProperties, MouseEvent } from "react";
import { cn } from "../lib/cn";
import type { MagicCardProps } from "./magic-card.types";

// 吸取自 magicui.design Magic Card：鼠标跟随的径向高光卡片。
// 瑚琏化：高光默认 var(--color-primary)（吃明暗）；卡片皮肤复用瑚琏 surface/border token；
// motion useMotionValue/useMotionTemplate 实时算 radial-gradient（必 "use client"）。
export function MagicCard({
  children,
  gradientSize = 200,
  gradientColor = "var(--color-primary)",
  gradientOpacity = 0.15,
  className,
  style,
  ...props
}: MagicCardProps) {
  const off = -gradientSize * 10;
  const mouseX = useMotionValue(off);
  const mouseY = useMotionValue(off);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };
  const handleLeave = () => {
    mouseX.set(off);
    mouseY.set(off);
  };

  const background = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`;

  return (
    <div
      {...props}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ "--hulian-magic-opacity": gradientOpacity, ...style } as CSSProperties}
      className={cn("group relative overflow-hidden rounded-xl border border-border bg-surface", className)}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-[var(--hulian-magic-opacity)]"
        style={{ background }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
