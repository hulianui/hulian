"use client";
import { cloneElement, useState, type MouseEvent, type ReactElement } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { TriangleAlert } from "../_icons";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { overlayTransitions } from "../motion";
import { Button } from "../button/button";
import { Popover, PopoverTrigger } from "../popover/popover";
import type { PopconfirmProps } from "./popconfirm.types";
import { useComponentLocale } from "../config/locale-context";

/**
 * 气泡确认：dogfood 瑚琏 Popover 引擎（Root/Trigger）+ 直接组合 Base UI 内容部件拿
 * Title/Description 的 a11y 串联 + icon-beside-title 布局；确认/取消按钮 dogfood 瑚琏 Button。
 * 中后台表格行内危险操作就地确认的高频浮层。onConfirm 支持 async（loading 态）。
 */
export function Popconfirm({
  title,
  description,
  icon,
  okText,
  cancelText,
  danger = false,
  onConfirm,
  onCancel,
  open: openProp,
  defaultOpen,
  onOpenChange,
  side = "top",
  align = "center",
  sideOffset = 8,
  disabled = false,
  children,
  className,
}: PopconfirmProps) {
  const componentLocale = useComponentLocale().popconfirm ?? { confirm: "确认", cancel: "取消" };
  const resolvedOkText = okText ?? componentLocale.confirm;
  const resolvedCancelText = cancelText ?? componentLocale.cancel;
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const open = openProp ?? internalOpen;
  const [loading, setLoading] = useState(false);

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const handleConfirm = async () => {
    const r = onConfirm?.();
    if (r instanceof Promise) {
      setLoading(true);
      try {
        await r;
        setOpen(false);
      } catch {
        // reject：保持打开，由消费者自行反馈错误（同 Ant Popconfirm）。
      } finally {
        setLoading(false);
      }
    } else {
      setOpen(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  // 触发器：**替换**子元素的 onClick，而不是与它合并（#267）。
  //
  // Base UI 的 `render` 走 mergeProps —— 同名 handler 依次调用。于是「给已有按钮套一层
  // Popconfirm 加二次确认」这个最自然的用法，得到的是「危险动作已经跑完 + 确认框事后
  // 弹出来问一句」：安全网静默失效，此时点「取消」也无济于事。Popconfirm 与 Popover 的
  // 分野正在这里 —— 后者「打开浮层」不该吃掉子元素原有行为（合并是对的），而前者存在的
  // 意义就是**拦住**那个动作。所以只有这一个组件改成替换语义。
  const trigger = children as ReactElement<{ onClick?: (event: MouseEvent<HTMLElement>) => void }>;
  const childOnClick = trigger.props?.onClick;
  if (childOnClick) {
    warnOnce(
      "popconfirm-child-onclick",
      "[hulian] Popconfirm：children 自带的 onClick 已被忽略 —— 二次确认要拦住的正是它。" +
        "把动作挪进 onConfirm（disabled 档会跳过确认直接执行它）。",
    );
  }
  const triggerElement = childOnClick ? cloneElement(trigger, { onClick: undefined }) : trigger;

  // 禁用：不弹确认，但**照样执行动作** —— 动作统一住在 onConfirm，这一档的语义是
  // 「这次不用问」而不是「这个按钮失效」。（要让按钮失效请在子元素上写 disabled。）
  if (disabled) {
    return cloneElement(trigger, {
      onClick: () => {
        const result = onConfirm?.();
        // 没有浮层可 loading、可保持打开，失败反馈仍归消费方（同 onConfirm 的既有口径）。
        if (result instanceof Promise) void result.catch(() => {});
      },
    });
  }

  // 默认图标随 danger 切色；icon===null 显式隐藏。
  const resolvedIcon =
    icon === undefined ? (
      <TriangleAlert
        className={cn("size-5 shrink-0", danger ? "text-danger" : "text-warning")}
        aria-hidden
      />
    ) : (
      icon
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={triggerElement as ReactElement<Record<string, unknown>>} />
      <BasePopover.Portal>
        <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
          <BasePopover.Popup
            className={cn(
              "w-[min(90vw,18rem)] rounded-[var(--radius)] border border-hairline bg-surface p-4 text-foreground shadow-xl outline-none",
              "origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
              className,
            )}
            style={overlayTransitions.popup}
          >
            <div className="flex gap-3">
              {resolvedIcon}
              <div className="min-w-0 flex-1">
                <BasePopover.Title className="text-sm font-semibold text-foreground">
                  {title}
                </BasePopover.Title>
                {description != null && (
                  <BasePopover.Description className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </BasePopover.Description>
                )}
                <div className="mt-3 flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={handleCancel}>
                    {resolvedCancelText}
                  </Button>
                  <Button
                    size="sm"
                    tone={danger ? "danger" : "brand"}
                    loading={loading}
                    onClick={() => {
                      void handleConfirm();
                    }}
                  >
                    {resolvedOkText}
                  </Button>
                </div>
              </div>
            </div>
            {/* 箭头：同 Popover，按 data-side 推出边缘并旋转。 */}
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
    </Popover>
  );
}
