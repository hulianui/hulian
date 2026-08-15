"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentProps } from "react";
import { X } from "../_icons";
import { useLocaleValue } from "../config/locale-context";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { DialogContentProps } from "./dialog.types";

// overlay 自管 mount/unmount（Base UI 等过渡结束才卸载），故不接 motion 的 AnimatePresence，
// 改用瑚琏动效 token 驱动其原生过渡 —— 与 Button(motion) 共享同一手感曲线，零混库。
// 用 transition 简写(而非长写)：Base UI 在过渡生命周期会往内联 style 注入 transition 简写，与长写
// 混在同一 style 对象 → React "shorthand/longhand 混用" 警告并丢弃长写。简写同属性覆盖无混用 → 警告消除。
// 同时覆盖 opacity+transform：backdrop 仅 opacity 变化(transform 段为空操作)，popup 两者皆动。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

export function Dialog(props: ComponentProps<typeof BaseDialog.Root>) {
  return <BaseDialog.Root {...props} />;
}

export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

export function DialogContent({
  title,
  extra,
  description,
  children,
  footer,
  showClose = true,
  closeLabel,
  titleClassName,
  descriptionClassName,
  backdrop = true,
  backdropClassName,
  scrollable = true,
  bodyClassName,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: DialogContentProps) {
  const loc = useLocaleValue("dialog", {
    close: "关闭",
  });
  // 与 DrawerContent 同一口径：title="" / null / undefined 都不渲染标题元素。
  const hasTitle = Boolean(title);
  // 同 DrawerContent：Base UI 的 aria-labelledby 只来自 Dialog.Title，没有 Title 时不回落，
  // 三个槽都不给就是个无名对话框。title 改可选（#272）后这条告警是唯一的兜底 ——
  // 而且它比改前的「必填」更严：title={null} 过得了类型检查，过不了这一关。
  if (!hasTitle && ariaLabel == null && ariaLabelledBy == null) {
    warnOnce(
      "dialog/no-accessible-name",
      "[hulian] DialogContent 既没有 title 也没有 aria-label / aria-labelledby，读屏用户拿到的是一个没有名字的对话框。可见 header 由你自己画时，传 aria-label 即可。",
    );
  }
  return (
    <BaseDialog.Portal>
      {/* 遮罩可关（#185）：自动弹出的「陪跑型」浮层里，40% 黑 + 模糊是错的默认值。
          关掉它 + Root 传 modal={false} 才是真正的非模态 —— 只关一边都不成立：
          Backdrop 那层 fixed inset-0 即使透明也照样吃掉整屏点击。 */}
      {backdrop && (
        <BaseDialog.Backdrop
          className={cn(
            "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            backdropClassName,
          )}
          style={overlayTransition}
        />
      )}
      <BaseDialog.Popup
        className={cn(
          // 三段式：max-h 封顶 + flex column，标题/footer 不压缩，正文自己滚。
          // 不封顶时长表单会顶穿视口，footer 被推到屏幕外 → 确定按钮点不到（DrawerContent
          // 早已是这个写法，Dialog 此前漏了，两者行为不一致）。
          // --hl-overlay-pad 与 p-6 必须同值：正文滚动区靠它做负边距补偿（见下方注释）。
          // 消费方若用 className 覆盖内边距（如 p-0 做铺满型抽屉），必须一并覆盖这个变量，
          // 否则正文会向 Popup 外溢出 —— 例：className="p-0 [--hl-overlay-pad:0px]"。
          "fixed left-1/2 top-1/2 z-50 flex max-h-[85dvh] w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[var(--radius)] border border-hairline bg-surface p-6 [--hl-overlay-pad:1.5rem] text-foreground shadow-xl outline-none",
          "data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.96] data-[ending-style]:opacity-0",
          className,
        )}
        style={overlayTransition}
        // 条件展开而非 aria-label={ariaLabel}：Base UI 的 mergeProps 用 `for...in` 遍历外部 props，
        // 键存在即覆盖、不看值是否 undefined —— 常规写法会把内部由 Dialog.Title 派生的
        // titleElementId 一并抹掉，全库对话框当场集体失去无障碍名（#272）。
        {...(ariaLabel != null && { "aria-label": ariaLabel })}
        {...(ariaLabelledBy != null && { "aria-labelledby": ariaLabelledBy })}
      >
        {/* 关闭按钮（#279，形状与默认值对齐 DrawerContent 的 #63）：只读详情型对话框
            （没有 footer、正文没有关闭控件的那种）此前唯一的可见退路只有点遮罩，
            键盘用户只剩 Esc，读屏用户对话框里根本没有「关闭」可达元素。
            绝对定位不占布局，对既有的 title/正文/footer 结构零影响；它落在正文滚动区
            之外（包含块是 fixed 的 Popup），不会被 overflow-y-auto 裁掉。 */}
        {showClose && (
          <BaseDialog.Close
            aria-label={closeLabel ?? loc.close}
            className="absolute right-3 top-3 z-10 grid size-8 shrink-0 cursor-pointer place-items-center rounded-[var(--radius)] text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden />
          </BaseDialog.Close>
        )}
        {/* extra 缺席时保持原样（标题直接是 Popup 的 flex 子项），不为了统一写法凭空多包一层 div。 */}
        {extra == null ? (
          hasTitle && (
            <BaseDialog.Title
              className={cn(
                "shrink-0 text-lg font-semibold",
                // 与 drawer 同款联动：开着关闭键就给标题让出右上角那 40px，长标题不钻到按钮底下。
                showClose && "pr-10",
                titleClassName,
              )}
            >
              {title}
            </BaseDialog.Title>
          )
        ) : (
          // 标题行（#272）：标题左、操作右。extra 是标题的**兄弟**而不是子节点 ——
          // `<h2>` 只收 phrasing content，且 aria-labelledby 指向整个 `<h2>`，
          // 按钮塞进去会被一并念进对话框的名字。
          <div
            className={cn(
              "flex shrink-0 items-center gap-2",
              hasTitle ? "justify-between" : "justify-end",
              // showClose 时整行让出右上角，extra 不被绝对定位的关闭按钮压住（同 drawer）。
              showClose && "pr-10",
            )}
          >
            {hasTitle && (
              <BaseDialog.Title className={cn("min-w-0 text-lg font-semibold", titleClassName)}>
                {title}
              </BaseDialog.Title>
            )}
            <div className="flex shrink-0 items-center gap-2">{extra}</div>
          </div>
        )}
        {description && (
          // descriptionClassName 走 twMerge：传 "sr-only" 即得到「只给读屏的说明」——
          // 面包屑式标题的弹窗里可见区域只有标题，但读屏仍需要那句说明（#179 评论）。
          <BaseDialog.Description
            className={cn("mt-1 shrink-0 text-sm text-muted-foreground", descriptionClassName)}
          >
            {description}
          </BaseDialog.Description>
        )}
        {/* min-h-0 必需：flex item 默认 min-height:auto，不给 0 则正文撑开父级、overflow 永不生效。
            横向的负边距 + 等量内边距不是排版微调，是为了不裁掉焦点环：CSS 规定一个轴非 visible 时
            另一轴的 visible 会被算成 auto，只写 overflow-y-auto 会让 overflow-x 一起变成裁剪；而
            滚动容器宽度恰好等于内容宽度，w-full 的表单控件左右边界与它完全重合（实测余量 0），
            于是 ring-2 + ring-offset-2 向外扩的那 4px 竖边整条落在 padding box 外被切掉
            （上下有富余高度所以还在，用户看到的就是「聚焦只剩上下两条线」）。
            负外边距把容器铺满 Popup 宽度、等量内边距把内容推回原位，让焦点环有地方画；
            净宽度变化为零，不会引入横向滚动条，代价只是滚动条改贴 Popup 边缘。
            走 --hl-overlay-pad 变量而不是写死 -mx-6：Popup 的内边距可被消费方用 className 覆盖，
            写死就等于把「Popup 一定是 p-6」硬编码进子节点，遇上 p-0 会让正文溢出到抽屉外。

            纵向同样要给焦点环留位（`mt-3 pt-1` 与 `-mb-1 pb-1`，视觉间距净变化为零）：
            表单最后一个控件的下边界与滚动容器完全贴合，它的环往下那 4px 一样会被切掉。
            但纵向**只留 4px 而不是跟横向一样借 24px**：上下方紧挨着标题和 footer，
            借多了滚动内容会从标题底下穿出来一大截；4px 恰好够环画，穿透幅度肉眼不可见。 */}
        <div
          className={cn(
            "mx-[calc(var(--hl-overlay-pad,1.5rem)*-1)] -mb-1 mt-3 min-h-0 flex-1 px-[var(--hl-overlay-pad,1.5rem)] pb-1 pt-1",
            // scrollable=false（#188）：正文不再是滚动盒，改成列向 flex 容器把确定高度传给
            // children —— 「左清单 + 右预览各自滚动」要的就是这个，否则子级写 flex-1 没有参照高度，
            // 只能拍一个 h-[58vh] 魔法数去凑「max-h 减标题减 footer」，标题多一行就漂。
            scrollable ? "overflow-y-auto" : "flex flex-col",
            bodyClassName,
          )}
        >
          {children}
        </div>
        {footer != null && (
          <div className="mt-6 flex shrink-0 items-center justify-end gap-2 border-t border-border pt-4">
            {footer}
          </div>
        )}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
