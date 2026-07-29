"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
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

export function DialogContent({ title, description, children, footer, className }: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
        style={overlayTransition}
      />
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
      >
        <BaseDialog.Title className="shrink-0 text-lg font-semibold">{title}</BaseDialog.Title>
        {description && (
          <BaseDialog.Description className="mt-1 shrink-0 text-sm text-muted">
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
        <div className="mx-[calc(var(--hl-overlay-pad,1.5rem)*-1)] -mb-1 mt-3 min-h-0 flex-1 overflow-y-auto px-[var(--hl-overlay-pad,1.5rem)] pb-1 pt-1">
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
