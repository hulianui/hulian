"use client";
import { useState, type ReactElement } from "react";
import { Popover as BasePopover } from "@base-ui-components/react/popover";
import { TriangleAlert } from "../_icons";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { Button } from "../button/button";
import { Popover, PopoverTrigger } from "../popover/popover";
import type { PopconfirmProps } from "./popconfirm.types";

// 与 Popover 同款过渡（transition 简写避 shorthand/longhand 混用警告，见 popover.tsx）。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

/**
 * 气泡确认：dogfood 瑚琏 Popover 引擎（Root/Trigger）+ 直接组合 Base UI 内容部件拿
 * Title/Description 的 a11y 串联 + icon-beside-title 布局；确认/取消按钮 dogfood 瑚琏 Button。
 * 中后台表格行内危险操作就地确认的高频浮层。onConfirm 支持 async（loading 态）。
 */
export function Popconfirm({
  title,
  description,
  icon,
  okText = "确认",
  cancelText = "取消",
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

  // 禁用：触发器照常渲染，不挂浮层。
  if (disabled) return children;

  // 默认图标随 danger 切色；icon===null 显式隐藏。
  const resolvedIcon =
    icon === undefined ? (
      <TriangleAlert className={cn("size-5 shrink-0", danger ? "text-danger" : "text-warning")} aria-hidden />
    ) : (
      icon
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={children as ReactElement<Record<string, unknown>>} />
      <BasePopover.Portal>
        <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
          <BasePopover.Popup
            className={cn(
              "w-[min(90vw,18rem)] rounded-[var(--radius)] border border-hairline bg-surface p-4 text-foreground shadow-xl outline-none",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
              className,
            )}
            style={overlayTransition}
          >
            <div className="flex gap-3">
              {resolvedIcon}
              <div className="min-w-0 flex-1">
                <BasePopover.Title className="text-sm font-semibold text-foreground">{title}</BasePopover.Title>
                {description != null && (
                  <BasePopover.Description className="mt-1 text-xs text-muted">
                    {description}
                  </BasePopover.Description>
                )}
                <div className="mt-3 flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={handleCancel}>
                    {cancelText}
                  </Button>
                  <Button
                    size="sm"
                    tone={danger ? "danger" : "brand"}
                    loading={loading}
                    onClick={() => {
                      void handleConfirm();
                    }}
                  >
                    {okText}
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
