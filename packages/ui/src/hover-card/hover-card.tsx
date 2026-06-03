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
          {/* 箭头：surface 方块 + 外两边 border（同 Popover）。 */}
          <BasePopover.Arrow className="-z-10">
            <span className="block h-2 w-2 rotate-45 border-b border-r border-border bg-surface" />
          </BasePopover.Arrow>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
