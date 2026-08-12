import type { ComponentProps, ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";

export type DrawerSide = "left" | "right" | "top" | "bottom";

/** 抽屉主轴尺寸档：left/right 映射宽度，top/bottom 映射高度。 */
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

export type DrawerProps = ComponentProps<typeof BaseDialog.Root>;

export interface DrawerContentProps {
  /** 贴边方向 + 对应的滑入方向，默认 right。 */
  side?: DrawerSide;
  /**
   * 主轴尺寸档，默认 `"md"`（即历史上写死的那两个值）。**同一档在横竖两轴上不是同一个值**
   * ——抽屉的主轴随 `side` 换：`left`/`right` 吃宽度，`top`/`bottom` 吃高度，
   * 而「一屏够看」的宽和高本来就不等长（视口通常宽 > 高）。
   *
   * | size | left / right 宽 | top / bottom 高 |
   * |------|------|------|
   * | `sm` | 20rem (320px) | 16rem (256px) |
   * | `md` | 24rem (384px) | 20rem (320px) |
   * | `lg` | 32rem (512px) | 32rem (512px) |
   * | `xl` | 48rem (768px) | 48rem (768px) |
   * | `full` | 100% | 100% |
   *
   * 除 `full` 外都带 `min(90vw, …)` / `min(90vh, …)` 上限，窄屏不会顶满整屏。
   * 交叉轴恒为 100%（右侧抽屉永远通高、底部抽屉永远通宽），不随此档变化。
   */
  size?: DrawerSize;
  /** 提供则渲 Dialog.Title 作 a11y label。 */
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /**
   * 钉底操作区（放按钮组）。带上分隔线，正文区独立滚动，footer 始终可见。
   * 表单 / 详情类抽屉的「取消 / 保存」「关闭」应放这里而非正文末尾。
   */
  footer?: ReactNode;
  /**
   * 就地挂载目标（元素或 ref）。提供后抽屉 portal 进该容器并改用 absolute 贴其边，
   * 而非默认 fixed 贴视口——适合手机框预览等需把抽屉收进局部容器的场景。
   * 容器须 position:relative + overflow-hidden。
   */
  /** 是否渲染右上角关闭按钮。@default true */
  showClose?: boolean;
  /** 关闭按钮的无障碍名（默认取 locale 的 drawer.close）。 */
  closeLabel?: string;
  /**
   * 追加到说明文案（默认 `text-sm text-muted-foreground`）。走 twMerge。
   * 传 `"sr-only"` 即「只给读屏的说明」：可见区域只留标题，读屏仍拿得到那句话。
   */
  descriptionClassName?: string;
  /**
   * 是否渲染遮罩层。默认 `true`。
   *
   * 关掉它才能得到真正的**非模态**浮层（进度、通知这类「陪跑型」自动弹出的面板）：
   * 只给 Root 传 `modal={false}` 是不够的 —— 遮罩那层 `inset-0` 即使透明也照样吃掉整屏点击，
   * 两边要一起关（#185）。
   */
  backdrop?: boolean;
  /**
   * 追加到遮罩层（默认 `bg-black/40 backdrop-blur-sm`）。走 twMerge，
   * 传 `bg-black/10 backdrop-blur-none` 即可把浓度调成自家设计系统的口径。
   */
  backdropClassName?: string;
  /**
   * 正文区是否自带纵向滚动。默认 `true`。
   *
   * 关掉它，正文区变成列向 flex 容器：确定高度直接传给 children，
   * 于是「左清单 + 右预览各自滚动」这类版式只要给子级写 `flex-1 min-h-0` 即可，
   * 不必再拍一个 `h-[58vh]` 去凑「max-h 减标题减 footer」（#188）。
   * 此时纵向滚动由消费方在自己的子容器上负责。
   */
  scrollable?: boolean;
  /** 追加到正文区容器（与 `scrollable` 配合，可把 `overflow-y-auto` 换成自家排版）。 */
  bodyClassName?: string;

  container?: ComponentProps<typeof BaseDialog.Portal>["container"];
  className?: string;
}
