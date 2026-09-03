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
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cn } from "../lib/cn";
import { overlayTransitions } from "../motion";
import type { HoverCardProps, HoverCardContentProps } from "./hover-card.types";

// Base UI rc.0 无 hover-card 原语，且 Popover.Root 不支持 openOnHover/delay。
// → 在 Popover 引擎上自研：受控 open + 自管 open/close 计时（复刻 Tooltip Provider 的 delay/closeDelay 范式）。
// 触发器与卡片都监听 mouseenter/leave，使指针在两者间移动时卡片保持打开；Esc/点外仍由 Popover 兜底关闭。
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
  anchor,
  className,
  onMouseEnter,
  onMouseLeave,
  style,
  ...rest
}: HoverCardContentProps) {
  const ctx = useContext(HoverCardContext);
  return (
    <BasePopover.Portal>
      {/* anchor 与 Popover 同一口径（#229）：这里包的就是同一个 Base UI Positioner，
          开一半会让「同样长相的两个浮层，一个能挪锚点一个不能」。区别只在触发器仍不可省 ——
          卡片是 hover 打开的，触发器就是那个被 hover 的东西。 */}
      <BasePopover.Positioner
        anchor={anchor}
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-50"
      >
        <BasePopover.Popup
          // 透传消费方的 div 属性（#201）。摆在最前是让内部关键 props 不被顶掉；指针进出与 style
          // 这两项内部另有用途，单独取出与消费方的合并——直接覆盖会让指针移入卡片就把它关掉。
          {...rest}
          // hover 卡片是非交互信息卡，绝不能抢焦点：否则「开→popup 抢焦点→触发器 onBlur 关
          // →Popover 关闭还原焦点回触发器→onFocus 又开」无限乒乓闪烁。initialFocus=false 开时不夺焦、
          // finalFocus=false 关时不还原 → 焦点始终留在触发器，与 Tooltip 同款焦点语义。
          initialFocus={false}
          finalFocus={false}
          onMouseEnter={(e) => {
            onMouseEnter?.(e);
            ctx?.open();
          }}
          onMouseLeave={(e) => {
            onMouseLeave?.(e);
            ctx?.close();
          }}
          className={cn(
            "w-[min(90vw,20rem)] rounded-[var(--radius)] border border-hairline bg-surface p-4 text-foreground shadow-xl outline-none",
            "origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={{ ...overlayTransitions.popup, ...style }}
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
