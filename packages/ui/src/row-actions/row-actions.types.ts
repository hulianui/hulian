import type { HTMLAttributes, ReactElement, ReactNode } from "react";

/** 动作语气。层级靠它表达，而不是靠调用点自己涂色。 */
export type RowActionTone = "neutral" | "brand" | "danger";

/** 二次确认。给了就先弹确认，确认后才跑 `onSelect`。 */
export interface RowActionConfirm {
  /** 确认框标题，一句话说清「要发生什么」。 */
  title: ReactNode;
  /** 补充说明，通常写不可逆的后果。 */
  description?: ReactNode;
  /** 确认键文案，默认取本地化的「确定」。 */
  confirmText?: ReactNode;
  /** 取消键文案，默认取本地化的「取消」。 */
  cancelText?: ReactNode;
}

export interface RowActionItem {
  /** React key，同时是 `onAction` 回调里的标识。 */
  key: string;
  /**
   * 动作名。**必须是纯字符串**：它同时要当无障碍名（图标档下按钮上没有别的可读文本）、
   * 悬浮提示、以及菜单的键盘 type-ahead 检索词——这三处都只认字符串。
   */
  label: string;
  /** 图标。文字档里作前缀，图标档里是按钮的全部内容。 */
  icon?: ReactNode;
  /** 语气，默认 `"neutral"`。主操作标 `"brand"`、破坏性标 `"danger"`。 */
  tone?: RowActionTone;
  /** 不可用。仍可聚焦并读到名字（见 `disabledReason`）。 */
  disabled?: boolean;
  /**
   * 不可用的原因。**这是 `disabled` 的搭子，不是可选装饰**：后台表格里「这个按钮为什么是灰的」
   * 是最常见的困惑，而灰按钮本身答不了。给了它，悬浮/聚焦时说明为什么，收进菜单时直接写在名字后面。
   */
  disabledReason?: ReactNode;
  /** 二次确认；破坏性动作应当给。 */
  confirm?: RowActionConfirm;
  /** 按权限藏起来。写在数据里比在调用点写一串 `&&` 整齐，也不会把间距一起藏没。 */
  hidden?: boolean;
  /** 点击回调。有 `confirm` 时在确认之后才调。 */
  onSelect?: () => void;
  /**
   * 换成别的元素来渲染，典型是路由 `<Link>`。
   *
   * 「查看详情」这类动作本质是导航：用 `onSelect` 做 `router.push` 会丢掉浏览器的原生能力
   * （Cmd+点击开新标签、中键、右键复制链接），而这些恰恰是后台用户天天用的。
   */
  render?: ReactElement;
}

export interface RowActionsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** 动作列表。`hidden` 的项先被剔掉，再算折叠。 */
  actions: RowActionItem[];
  /** 文字档还是图标档，默认 `"text"`。图标档省横向空间，但要求每个动作都有 `icon`。 */
  variant?: "text" | "icon";
  /**
   * 最多**露出**几个，默认 3。超出时露出前 `max - 1` 个、其余收进溢出菜单——
   * 而不是露满 `max` 个再加一颗菜单键，那样实际控件数会比 `max` 还多，列宽反而失控。
   */
  max?: number;
  /** 密度档，默认 `"sm"`（表格行天生密集）。 */
  size?: "sm" | "md";
  /** 列内对齐，默认 `"start"`。 */
  align?: "start" | "center" | "end";
  /** 溢出菜单触发器的无障碍名，默认取本地化的「更多操作」。 */
  moreLabel?: string;
}
