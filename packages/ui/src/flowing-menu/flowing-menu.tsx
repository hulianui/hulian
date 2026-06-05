"use client";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { FlowingMenuItem, FlowingMenuProps } from "./flowing-menu.types";

// 吸取自 React Bits FlowingMenu：竖排菜单项，指针从最近的上/下边缘滑入时，
// 一块循环跑马灯（文字 + 图片）从同侧边缘揭幕铺满整行，离开时从来向退回。
// 瑚琏化：去 gsap —— 揭幕用 CSS transition 命令式 transform（按指针近边缘判进/离向）、
// 跑马灯用纯 CSS 关键帧 hulian-flowing-menu；颜色全走 token
//（bg-surface / text-foreground / bg-primary / text-primary-foreground / border-border）；
// reduced-motion（useReducedMotion 门控）→ 仍可揭幕但去跑马灯动画且改瞬时切换（DOM 两态一致，避 reveal 不可见坑）。

/** 距离平方度量（避开 sqrt） */
function distSq(x: number, y: number, x2: number, y2: number) {
  const dx = x - x2;
  const dy = y - y2;
  return dx * dx + dy * dy;
}

/** 判断指针离上边缘还是下边缘近 */
function closestEdge(
  px: number,
  py: number,
  width: number,
  height: number,
): "top" | "bottom" {
  const top = distSq(px, py, width / 2, 0);
  const bottom = distSq(px, py, width / 2, height);
  return top < bottom ? "top" : "bottom";
}

function MenuItem({
  link,
  text,
  image,
  speed,
  repeat,
  reduce,
}: FlowingMenuItem & { speed: number; repeat: number; reduce: boolean }) {
  const itemRef = useRef<HTMLLIElement>(null);

  // 揭幕外层与内容层 y 方向相反（夹层揭幕效果）。离场态 = ±101%，按指针近边缘取来向。
  const outerHidden = (edge: "top" | "bottom") => (edge === "top" ? "-101%" : "101%");
  const innerHidden = (edge: "top" | "bottom") => (edge === "top" ? "101%" : "-101%");

  // 命令式以 data 属性定位两层并写 transform，配 CSS transition 完成进/离场，避免额外 state 抖动。
  const setReveal = (edge: "top" | "bottom", shown: boolean) => {
    const root = itemRef.current;
    if (!root) return;
    const outer = root.querySelector<HTMLElement>("[data-fm-outer]");
    const inner = root.querySelector<HTMLElement>("[data-fm-inner]");
    if (!outer || !inner) return;
    if (shown) {
      outer.style.transform = "translate3d(0,0,0)";
      inner.style.transform = "translate3d(0,0,0)";
    } else {
      outer.style.transform = `translate3d(0,${outerHidden(edge)},0)`;
      inner.style.transform = `translate3d(0,${innerHidden(edge)},0)`;
    }
  };

  const onEnter = (ev: PointerEvent<HTMLAnchorElement>) => {
    const root = itemRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const edge = closestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height,
    );
    // 先瞬时把揭幕层放到来向边缘外，强制 reflow 后再过渡进场
    const outer = root.querySelector<HTMLElement>("[data-fm-outer]");
    const inner = root.querySelector<HTMLElement>("[data-fm-inner]");
    if (outer && inner) {
      outer.style.transition = "none";
      inner.style.transition = "none";
      outer.style.transform = `translate3d(0,${outerHidden(edge)},0)`;
      inner.style.transform = `translate3d(0,${innerHidden(edge)},0)`;
      // 强制 reflow 后恢复过渡
      void outer.offsetWidth;
      outer.style.transition = "";
      inner.style.transition = "";
    }
    setReveal(edge, true);
  };

  const onLeave = (ev: PointerEvent<HTMLAnchorElement>) => {
    const root = itemRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const edge = closestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height,
    );
    setReveal(edge, false);
  };

  // 跑马灯一份内容（文字 + 可选图片）
  const part = (key: number) => (
    <div className="flex shrink-0 items-center" key={key}>
      <span className="whitespace-nowrap px-[1.5vw] text-[clamp(1.25rem,4vh,2.75rem)] font-normal uppercase leading-none">
        {text}
      </span>
      {image ? (
        <span
          aria-hidden
          className="mx-[2vw] my-1 h-[4vh] w-32 rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      ) : (
        <span aria-hidden className="mx-[2vw] inline-block h-1 w-8 rounded-full bg-primary-foreground/40" />
      )}
    </div>
  );

  return (
    <li
      ref={itemRef}
      className="relative flex-1 overflow-hidden border-t border-border text-center first:border-t-0"
    >
      <a
        href={link}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        className={cn(
          "relative flex h-full items-center justify-center",
          "cursor-pointer whitespace-nowrap uppercase no-underline",
          "text-[clamp(1.25rem,4vh,2.75rem)] font-semibold text-foreground",
          "transition-colors hover:text-foreground focus-visible:outline-none",
        )}
      >
        {text}
      </a>

      {/* 揭幕外层：默认藏在下边缘外，进场过渡到 0 */}
      <div
        data-fm-outer
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden bg-primary",
          reduce
            ? "[transition:transform_0ms]"
            : "[transition:transform_0.6s_cubic-bezier(0.16,1,0.3,1)]",
        )}
        style={{ transform: "translate3d(0,101%,0)" }}
      >
        {/* 内容层：方向与外层相反，做夹层揭幕 */}
        <div
          data-fm-inner
          className={cn(
            "flex h-full items-center",
            reduce
              ? "[transition:transform_0ms]"
              : "[transition:transform_0.6s_cubic-bezier(0.16,1,0.3,1)]",
          )}
          style={{ transform: "translate3d(0,-101%,0)" }}
        >
          {/* 跑马灯轨道：CSS 关键帧平移一份内容宽度，无缝循环 */}
          <div
            className={cn(
              "flex h-full w-max items-center text-primary-foreground will-change-transform",
              "[animation:hulian-flowing-menu_var(--hl-fm-speed)_linear_infinite]",
              "motion-reduce:[animation:none]",
            )}
            style={{ "--hl-fm-speed": `${speed}s` } as CSSProperties}
          >
            {/* 两组重复内容拼接，平移 50% 即无缝 */}
            {Array.from({ length: repeat }, (_, i) => part(i))}
            {Array.from({ length: repeat }, (_, i) => part(repeat + i))}
          </div>
        </div>
      </div>
    </li>
  );
}

export function FlowingMenu({
  items,
  speed = 18,
  repeat = 4,
  className,
  ...props
}: FlowingMenuProps) {
  const reduce = useReducedMotion() ?? false;
  return (
    <nav
      {...props}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden bg-surface",
        className,
      )}
    >
      <ul className="m-0 flex h-full flex-col p-0">
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            {...item}
            speed={speed}
            repeat={Math.max(2, repeat)}
            reduce={reduce}
          />
        ))}
      </ul>
    </nav>
  );
}
