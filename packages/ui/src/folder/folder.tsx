"use client";
import { useCallback, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { cn } from "../lib/cn";
import type { FolderProps } from "./folder.types";

// 吸取自 React Bits Folder：点击展开的 3D 文件夹，纸张扇形铺开 + 展开后磁吸跟随鼠标。
// 瑚琏化：去掉原 darkenColor 手算 hex，背封/纸张全用 color-mix 从 token 派生（主题感知，暗色不发白）；
// 默认色走 var(--color-primary)；受控/非受控 open 双模 + onOpenChange；reduced-motion 经 motion-reduce 停过渡（DOM 两态一致）；
// 磁吸偏移用 ref 直写 CSS 变量避免每帧 setState（高频指针事件不抖）。
const MAX_ITEMS = 3;

export function Folder({
  color = "var(--color-primary)",
  size = 1,
  items = [],
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disableMagnet = false,
  className,
  style,
  onClick,
  ...props
}: FolderProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openState;

  const paperRefs = useRef<(HTMLDivElement | null)[]>([]);

  const papers: ReactNode[] = [];
  const slots = items.slice(0, MAX_ITEMS);
  for (let i = 0; i < MAX_ITEMS; i++) papers.push(slots[i] ?? null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setOpenState(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    const next = !open;
    setOpen(next);
    if (!next) {
      // 收起：清掉所有磁吸偏移
      paperRefs.current.forEach((el) => {
        if (!el) return;
        el.style.setProperty("--magnet-x", "0px");
        el.style.setProperty("--magnet-y", "0px");
      });
    }
  };

  const handlePaperMove = (e: MouseEvent<HTMLDivElement>, i: number) => {
    if (!open || disableMagnet) return;
    const el = paperRefs.current[i];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offsetX = (e.clientX - (rect.left + rect.width / 2)) * 0.15;
    const offsetY = (e.clientY - (rect.top + rect.height / 2)) * 0.15;
    el.style.setProperty("--magnet-x", `${offsetX}px`);
    el.style.setProperty("--magnet-y", `${offsetY}px`);
  };

  const handlePaperLeave = (i: number) => {
    const el = paperRefs.current[i];
    if (!el) return;
    el.style.setProperty("--magnet-x", "0px");
    el.style.setProperty("--magnet-y", "0px");
  };

  // 背封与三层纸张全从 color / background token 派生，避免硬编码 hex，暗色主题自动适配
  const folderVars = {
    "--hl-folder-color": color,
    "--hl-folder-back": `color-mix(in oklab, ${color} 90%, var(--color-foreground))`,
    "--hl-paper-1": `color-mix(in oklab, var(--color-background) 88%, var(--color-foreground))`,
    "--hl-paper-2": `color-mix(in oklab, var(--color-background) 94%, var(--color-foreground))`,
    "--hl-paper-3": `var(--color-background)`,
  } as CSSProperties;

  return (
    <div
      {...props}
      className={cn("inline-block", className)}
      style={{ transform: `scale(${size})`, ...style }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={handleClick}
        style={folderVars}
        className={cn(
          "group/folder relative block cursor-pointer appearance-none border-0 bg-transparent p-0",
          "transition-transform duration-200 ease-in",
          // 收起态 hover 抬升；展开态常驻抬升
          open ? "-translate-y-2" : "hover:-translate-y-2",
          "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        )}
      >
        {/* 文件夹背封（含左上小翼） */}
        <div
          className={cn(
            "relative h-20 w-[100px] rounded-tl-none rounded-tr-[10px] rounded-b-[10px]",
            "bg-[var(--hl-folder-back)]",
            "before:absolute before:bottom-[98%] before:left-0 before:z-0 before:h-2.5 before:w-[30px]",
            "before:rounded-t-[5px] before:bg-[var(--hl-folder-back)] before:content-['']",
          )}
        >
          {papers.map((item, i) => (
            <div
              key={i}
              ref={(el) => {
                paperRefs.current[i] = el;
              }}
              onMouseMove={(e) => handlePaperMove(e, i)}
              onMouseLeave={() => handlePaperLeave(i)}
              className={cn(
                "absolute bottom-[10%] left-1/2 z-[2] rounded-[10px]",
                "transition-[transform,height] duration-300 ease-in-out",
                "motion-reduce:transition-none",
                // 三层纸张尺寸 + 配色
                i === 0 && "h-[80%] w-[70%] bg-[var(--hl-paper-1)]",
                i === 1 && "h-[70%] w-[80%] bg-[var(--hl-paper-2)]",
                i === 2 && "h-[60%] w-[90%] bg-[var(--hl-paper-3)]",
                // 收起：堆叠居中
                !open && "[transform:translate(-50%,10%)]",
                // 收起态 hover：纸张轻微上探
                !open &&
                  "group-hover/folder:[transform:translate(-50%,0%)]",
                // 展开：各自扇形铺开（含磁吸偏移变量）
                open &&
                  i === 0 &&
                  "[transform:translate(calc(-120%_+_var(--magnet-x,0px)),calc(-70%_+_var(--magnet-y,0px)))_rotate(-15deg)] hover:[transform:translate(calc(-120%_+_var(--magnet-x,0px)),calc(-70%_+_var(--magnet-y,0px)))_rotate(-15deg)_scale(1.1)]",
                open &&
                  i === 1 &&
                  "h-[80%] [transform:translate(calc(10%_+_var(--magnet-x,0px)),calc(-70%_+_var(--magnet-y,0px)))_rotate(15deg)] hover:[transform:translate(calc(10%_+_var(--magnet-x,0px)),calc(-70%_+_var(--magnet-y,0px)))_rotate(15deg)_scale(1.1)]",
                open &&
                  i === 2 &&
                  "h-[80%] [transform:translate(calc(-50%_+_var(--magnet-x,0px)),calc(-100%_+_var(--magnet-y,0px)))_rotate(5deg)] hover:[transform:translate(calc(-50%_+_var(--magnet-x,0px)),calc(-100%_+_var(--magnet-y,0px)))_rotate(5deg)_scale(1.1)]",
              )}
            >
              {item}
            </div>
          ))}

          {/* 文件夹前盖（左右两片，展开/hover 时下压外翻） */}
          <div
            className={cn(
              "absolute inset-0 z-[3] h-full w-full origin-bottom rounded-tl-[5px] rounded-tr-[10px] rounded-b-[10px]",
              "bg-[var(--hl-folder-color)] transition-transform duration-300 ease-in-out",
              "motion-reduce:transition-none",
              open
                ? "[transform:skew(15deg)_scaleY(0.6)]"
                : "group-hover/folder:[transform:skew(15deg)_scaleY(0.6)]",
            )}
          />
          <div
            className={cn(
              "absolute inset-0 z-[3] h-full w-full origin-bottom rounded-tl-[5px] rounded-tr-[10px] rounded-b-[10px]",
              "bg-[var(--hl-folder-color)] transition-transform duration-300 ease-in-out",
              "motion-reduce:transition-none",
              open
                ? "[transform:skew(-15deg)_scaleY(0.6)]"
                : "group-hover/folder:[transform:skew(-15deg)_scaleY(0.6)]",
            )}
          />
        </div>
      </button>
    </div>
  );
}
