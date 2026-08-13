"use client";
import { useState, type ReactNode } from "react";
import { Ellipsis } from "../_icons";
import { AlertDialog, AlertDialogClose, AlertDialogContent } from "../alert-dialog";
import { Button } from "../button";
import { useComponentLocale } from "../config/locale-context";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "../menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { cn } from "../lib/cn";
import { pressableClass } from "../motion";
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
  revealOnHover = false,
  className,
  ...props
}: RowActionsProps) {
  const locale = useComponentLocale().rowActions ?? LOCALE_FALLBACK;
  const [pending, setPending] = useState<Pending>(null);
  /** 正在执行的动作 key。异步动作转圈期间，同一行里其他动作一并按住。 */
  const [runningKey, setRunningKey] = useState<string | null>(null);

  const visible = actions.filter((action) => !action.hidden);
  // 权限把这一行的动作全筛没了：什么都不渲染，而不是留一个带 gap 的空 flex 壳。
  // 空壳会在表格里占出一段说不清是什么的间距，还会让「这一格是不是加载中」变得可疑。
  if (visible.length === 0) return null;
  // 超出时留一格给菜单键本身：露满 max 个再加一颗「⋯」，实际控件数就是 max+1，
  // 列宽会比消费方以为的宽一格。
  const collapse = visible.length > max;
  const inline = collapse ? visible.slice(0, Math.max(max - 1, 0)) : visible;
  const overflow = collapse ? visible.slice(Math.max(max - 1, 0)) : [];

  /**
   * 真正执行。返回 thenable 时进 loading 并把结果回报给调用处（确认框要靠它决定关不关）。
   *
   * 认 thenable 而不是 `instanceof Promise`：消费方的提交常来自 axios / SWR mutate 这类自带
   * promise 实现的库，同步返回时也不该白挂一个 loading。
   * 失败只结束 loading、不吞不报：错误文案要看业务语义，只能由消费方在 onSelect 里自己 catch
   * （与 CellEditor 的 onCommit 同一条契约）。
   */
  const invoke = (action: RowActionItem): Promise<boolean> => {
    const result: unknown = action.onSelect?.();
    if (typeof (result as Promise<unknown> | undefined)?.then !== "function")
      return Promise.resolve(true);
    setRunningKey(action.key);
    return Promise.resolve(result as Promise<unknown>).then(
      () => {
        setRunningKey(null);
        return true;
      },
      () => {
        setRunningKey(null);
        return false;
      },
    );
  };

  const run = (action: RowActionItem) => {
    // 已在跑的时候整组按住：一行里同时发两个写操作，服务端看到的顺序基本是随机的。
    if (action.disabled || runningKey != null) return;
    if (action.confirm) {
      setPending({ action });
      return;
    }
    void invoke(action);
  };

  /** 确认框里那个动作正在跑：确认键转圈、整个框按住不关。 */
  const confirming = pending != null && runningKey === pending.action.key;

  const buttonSize = variant === "icon" ? (size === "sm" ? "iconSm" : "icon") : size === "sm" ? "sm" : "md";
  // 三档只差「有多明显」：文字档不画边框（列表里一排边框会把表格切碎），
  // 按钮档画描边（动作真的会改数据时，可点性不该靠猜），图标档用 ghost 让图标自己说话。
  const buttonVariant = variant === "text" ? "link" : variant === "button" ? "outline" : "ghost";

  const renderInline = (action: RowActionItem) => {
    const tone = TONE_CLASS[action.tone ?? "neutral"];
    const running = runningKey === action.key;
    // 别人正在跑的时候本项也点不动，但**不显示成禁用态**：它没有被禁用，只是这一瞬间轮不到它。
    const held = runningKey != null && !running;
    const button = (
      <Button
        // 导航型动作换成 <Link>：Cmd+点击开新标签、中键、右键复制链接这些原生能力
        // 只有真的渲染成 <a> 才有，用 onSelect 做 router.push 会把它们一起丢掉。
        render={action.render}
        type="button"
        variant={buttonVariant}
        tone={tone}
        size={buttonSize}
        // 刻意不用原生 disabled：禁用的按钮既不可聚焦、也不派发指针事件，于是
        // 「为什么这个按钮是灰的」这条提示永远弹不出来——而那正是最需要它的时候。
        // aria-disabled 保住可聚焦与可读名，点击由下面的 run() 自己短路。
        loading={running}
        aria-disabled={action.disabled || held || undefined}
        // pressableClass 必须排在最后：它自带完整的 transition-property 列表，而 tailwind-merge
        // 把 transition-* 视作同一组只留最后一个 —— 写在 Button 基类的 transition-colors 之前
        // 会被整条丢掉，颜色与按压二选一都没有。
        className={cn(action.disabled && "pointer-events-auto opacity-50", pressableClass)}
        aria-label={variant === "icon" ? action.label : undefined}
        onClick={() => run(action)}
      >
        {action.icon}
        {/* 只有图标档不渲染文字（名字改由 aria-label 与提示承担），文字档与按钮档都要有可见名字 */}
        {variant === "icon" ? null : action.label}
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
          // 悬浮才显现：Tailwind 的 hover 变体本身就带 (hover: hover) 媒体门，所以触屏上
          // group-hover 永远不成立 —— 必须显式把无悬浮设备恢复成恒显，否则那些设备上
          // 这一列等于消失了。focus-within 保住键盘用户。
          revealOnHover &&
            // 时长与曲线取自动效体系的 fast 档（贴身微交互），不自己写数字；
            // reduced-motion 下直接切换不过渡 —— 这条偏好一律由库负责，不指望消费方去关。
            "opacity-0 transition-opacity duration-150 ease-out motion-reduce:transition-none group-hover/row:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100",
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
                  variant={variant === "button" ? "outline" : "ghost"}
                  tone="neutral"
                  size={size === "sm" ? "iconSm" : "icon"}
                  aria-label={moreLabel ?? locale.more}
                  className={pressableClass}
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
      <AlertDialog
        open={pending != null}
        // 执行中不许关：Esc / 点遮罩 / 取消键三条路都走这里。关掉的话动作还在飞，
        // 用户却以为自己取消了 —— 而它根本没被取消。
        onOpenChange={(open) => {
          if (!open && !confirming) setPending(null);
        }}
      >
        <AlertDialogContent
          title={pending?.action.confirm?.title}
          description={pending?.action.confirm?.description}
        >
          <AlertDialogClose
            render={
              <Button
                type="button"
                variant="outline"
                tone="neutral"
                size="sm"
                aria-disabled={confirming || undefined}
              >
                {pending?.action.confirm?.cancelText ?? locale.cancel}
              </Button>
            }
          />
          {/* 确认键刻意**不是** AlertDialogClose：那会点完立刻关，而异步动作这时才刚发出去。
              先跑，成功才关；失败留在原地让用户能重试（错误文案由消费方在 onSelect 里自己给）。 */}
          <Button
            type="button"
            tone={pending?.action.tone === "danger" ? "danger" : "brand"}
            size="sm"
            loading={confirming}
            onClick={() => {
              const action = pending?.action;
              if (!action || confirming) return;
              void invoke(action).then((ok) => {
                if (ok) setPending(null);
              });
            }}
          >
            {pending?.action.confirm?.confirmText ?? locale.confirm}
          </Button>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
