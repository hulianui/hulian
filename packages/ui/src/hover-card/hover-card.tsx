"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { Popover as BasePopover } from "@base-ui-components/react/popover";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { HoverCardProps, HoverCardContentProps } from "./hover-card.types";

// Base UI rc.0 无 hover-card 原语，且 Popover.Root 不支持 openOnHover/delay。
// → 在 Popover 引擎上自研：受控 open + 自管 open/close 计时（复刻 Tooltip Provider 的 delay/closeDelay 范式）。
// 触发器与卡片都监听 mouseenter/leave，使指针在两者间移动时卡片保持打开；Esc/点外仍由 Popover 兜底关闭。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

interface HoverCardCtx {
  open: () => void;
  close: () => void;
}
const HoverCardContext = createContext<HoverCardCtx | null>(null);

export function HoverCard({ openDelay = 300, closeDelay = 150, children }: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);
  const scheduleOpen = useCallback(() => {
    clear();
    timer.current = setTimeout(() => setOpen(true), openDelay);
  }, [clear, openDelay]);
  const scheduleClose = useCallback(() => {
    clear();
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  }, [clear, closeDelay]);

  useEffect(() => clear, [clear]);

  return (
    <HoverCardContext.Provider value={{ open: scheduleOpen, close: scheduleClose }}>
      {/* 非模态（modal 默认 false）：hover 卡片不锁滚、不抢焦点。 */}
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        {children}
      </BasePopover.Root>
    </HoverCardContext.Provider>
  );
}

export function HoverCardTrigger(props: ComponentProps<typeof BasePopover.Trigger>) {
  const ctx = useContext(HoverCardContext);
  return (
    <BasePopover.Trigger
      onMouseEnter={ctx?.open}
      onMouseLeave={ctx?.close}
      onFocus={ctx?.open}
      onBlur={ctx?.close}
      {...props}
    />
  );
}

export function HoverCardContent({
  children,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  className,
}: HoverCardContentProps) {
  const ctx = useContext(HoverCardContext);
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BasePopover.Popup
          onMouseEnter={ctx?.open}
          onMouseLeave={ctx?.close}
          className={cn(
            "w-[min(90vw,20rem)] rounded-[var(--radius)] border border-border bg-surface p-4 text-foreground shadow-xl outline-none",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          {children}
          {/* 箭头：同 Popover —— Base UI arrowStyles 只管交叉轴居中，垂直于边那轴要自己按 data-side
              补偏移 + 旋转，让带 border-b/r 的角朝外续上 popup 边线；内层 span 不再自转。 */}
          <BasePopover.Arrow
            className={cn(
              "-z-10",
              "data-[side=top]:bottom-[-4px] data-[side=top]:rotate-45",
              "data-[side=bottom]:top-[-4px] data-[side=bottom]:rotate-[225deg]",
              "data-[side=left]:right-[-4px] data-[side=left]:rotate-[315deg]",
              "data-[side=right]:left-[-4px] data-[side=right]:rotate-[135deg]",
            )}
          >
            <span className="block h-2 w-2 border-b border-r border-border bg-surface" />
          </BasePopover.Arrow>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
