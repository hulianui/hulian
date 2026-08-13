"use client";
import { useState, type ReactNode } from "react";
import { Ellipsis } from "../_icons";
import { AlertDialog, AlertDialogClose, AlertDialogContent } from "../alert-dialog";
import { Button } from "../button";
import { useComponentLocale } from "../config/locale-context";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "../menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { cn } from "../lib/cn";
import type { RowActionItem, RowActionTone, RowActionsProps } from "./row-actions.types";

// 表格行的操作区。
//
// 为什么值得单开一件，而不是让每张表自己 `<div className="flex gap-1">` 拼按钮（本仓此前
// 就是这么写的）：那样拼出来的东西有三个共同毛病，且每张表都会各犯一遍——
//   1. 没有层级。查看 / 编辑 / 删除长成同一颗按钮，破坏性动作与只读动作一样重。
//   2. 动作一多就堆在一起。没有「露出几个 + 其余收进菜单」这条线，列宽随动作数飘，
//      窄屏下要么挤成一团要么把整行撑高。
//   3. 每处都要重写同一批琐事：图标按钮的无障碍名、禁用原因的提示、破坏性动作的二次确认。
// 这三件都不是某张表的业务，是「行操作」这个模式本身的形状。

const TONE_CLASS: Record<RowActionTone, "neutral" | "brand" | "danger"> = {
  neutral: "neutral",
  brand: "brand",
  danger: "danger",
};

const LOCALE_FALLBACK = { more: "更多操作", confirm: "确定", cancel: "取消" };

/** 待确认的动作：确认框是**组件自己持有**的一份，不依赖消费方在根上挂任何 Provider。 */
type Pending = { action: RowActionItem } | null;

export function RowActions({
  actions,
  variant = "text",
  max = 3,
  size = "sm",
  align = "start",
  moreLabel,
  className,
  ...props
}: RowActionsProps) {
  const locale = useComponentLocale().rowActions ?? LOCALE_FALLBACK;
  const [pending, setPending] = useState<Pending>(null);

  const visible = actions.filter((action) => !action.hidden);
  // 超出时留一格给菜单键本身：露满 max 个再加一颗「⋯」，实际控件数就是 max+1，
  // 列宽会比消费方以为的宽一格。
  const collapse = visible.length > max;
  const inline = collapse ? visible.slice(0, Math.max(max - 1, 0)) : visible;
  const overflow = collapse ? visible.slice(Math.max(max - 1, 0)) : [];

  const run = (action: RowActionItem) => {
    if (action.disabled) return;
    if (action.confirm) {
      setPending({ action });
      return;
    }
    action.onSelect?.();
  };

  const buttonSize = variant === "icon" ? (size === "sm" ? "iconSm" : "icon") : size === "sm" ? "sm" : "md";

  const renderInline = (action: RowActionItem) => {
    const tone = TONE_CLASS[action.tone ?? "neutral"];
    const button = (
      <Button
        // 导航型动作换成 <Link>：Cmd+点击开新标签、中键、右键复制链接这些原生能力
        // 只有真的渲染成 <a> 才有，用 onSelect 做 router.push 会把它们一起丢掉。
        render={action.render}
        type="button"
        variant={variant === "icon" ? "ghost" : "link"}
        tone={tone}
        size={buttonSize}
        // 刻意不用原生 disabled：禁用的按钮既不可聚焦、也不派发指针事件，于是
        // 「为什么这个按钮是灰的」这条提示永远弹不出来——而那正是最需要它的时候。
        // aria-disabled 保住可聚焦与可读名，点击由下面的 run() 自己短路。
        aria-disabled={action.disabled || undefined}
        className={cn(action.disabled && "pointer-events-auto opacity-50")}
        aria-label={variant === "icon" ? action.label : undefined}
        onClick={() => run(action)}
      >
        {action.icon}
        {variant === "text" ? action.label : null}
      </Button>
    );

    // 图标档没有可见文字，名字只在提示里；禁用时无论哪档都要说清原因。
    const tip: ReactNode = action.disabled ? action.disabledReason : variant === "icon" ? action.label : null;
    if (tip == null || tip === "") return <span key={action.key}>{button}</span>;
    return (
      <Tooltip key={action.key}>
        <TooltipTrigger render={button} />
        <TooltipContent>{tip}</TooltipContent>
      </Tooltip>
    );
  };

  // 破坏性动作在菜单里排到最后并用分隔线隔开：菜单是「手滑就点中」的地方，
  // 把删除排在编辑旁边等于在鼓励误触。
  const overflowSafe = overflow.filter((a) => a.tone !== "danger");
  const overflowDanger = overflow.filter((a) => a.tone === "danger");

  const renderMenuItem = (action: RowActionItem) => (
    <MenuItem
      key={action.key}
      label={action.label}
      disabled={action.disabled}
      variant={action.tone === "danger" ? "danger" : "default"}
      onClick={() => run(action)}
    >
      <span className="flex items-center gap-2">
        {action.icon}
        {action.label}
        {/* 菜单里没有悬浮提示的位置（悬浮就要选中它），禁用原因直接写在名字后面 */}
        {action.disabled && action.disabledReason ? (
          <span className="text-xs text-muted-foreground">{action.disabledReason}</span>
        ) : null}
      </span>
    </MenuItem>
  );

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-1",
          align === "center" && "justify-center",
          align === "end" && "justify-end",
          className,
        )}
        {...props}
      >
        {inline.map(renderInline)}

        {overflow.length > 0 && (
          <Menu>
            <MenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  tone="neutral"
                  size={size === "sm" ? "iconSm" : "icon"}
                  aria-label={moreLabel ?? locale.more}
                >
                  <Ellipsis className="size-4" aria-hidden />
                </Button>
              }
            />
            <MenuContent>
              {overflowSafe.map(renderMenuItem)}
              {overflowSafe.length > 0 && overflowDanger.length > 0 && <MenuSeparator />}
              {overflowDanger.map(renderMenuItem)}
            </MenuContent>
          </Menu>
        )}
      </div>

      {/* 确认框由本组件自己持有一份（受控），不走命令式 modal：
          命令式那条要求消费方在根上挂 <ModalProvider />，漏挂时 modal.confirm() 是**静默无事发生** ——
          用户点了删除、什么都没弹、动作也没跑，而控制台一声不响。行操作是最不该踩这个的地方。
          自己持有还有一个好处：同一个动作被折进菜单前后，确认体验完全一致。 */}
      <AlertDialog open={pending != null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent
          title={pending?.action.confirm?.title}
          description={pending?.action.confirm?.description}
        >
          <AlertDialogClose
            render={
              <Button type="button" variant="outline" tone="neutral" size="sm">
                {pending?.action.confirm?.cancelText ?? locale.cancel}
              </Button>
            }
          />
          <AlertDialogClose
            render={
              <Button
                type="button"
                tone={pending?.action.tone === "danger" ? "danger" : "brand"}
                size="sm"
                onClick={() => pending?.action.onSelect?.()}
              >
                {pending?.action.confirm?.confirmText ?? locale.confirm}
              </Button>
            }
          />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
