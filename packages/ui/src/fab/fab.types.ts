import type { ReactNode } from "react";

export type FabPosition = "bottom-right" | "bottom-left" | "bottom-center";

export interface FabAction {
  key: string;
  /** 子动作图标。 */
  icon: ReactNode;
  /** 子动作文字标签（展开时显示在图标侧，并作为 aria-label）。 */
  label?: string;
  onClick?: () => void;
}

export interface FabProps {
  /** 主按钮图标，默认 Plus；展开 speed-dial 时旋转 45°。 */
  icon?: ReactNode;
  /**
   * 主按钮文字（extended FAB / 胶囊态）。提供后主钮从圆形变为「图标 + 文字」自适应宽度胶囊，
   * 并默认用作 aria-label。适合「返回示例库」这类需自解释的悬浮操作。
   */
  label?: string;
  /** 子动作（speed-dial）；提供则点击主钮展开/收起，否则主钮直接触发 onClick。 */
  actions?: FabAction[];
  /** 贴边位置，默认 bottom-right。 */
  position?: FabPosition;
  /** 尺寸，默认 md（56px 主钮）。sm（48px）更适合手机框内等紧凑场景。 */
  size?: "sm" | "md";
  /**
   * 可拖拽：按住主钮拖动重定位（指针位移 > 3px 视为拖拽，该次不触发 onClick）。
   * 适合悬浮钮可能遮挡内容、需用户自行挪开的场景（如 demo 预览）。默认 false。
   */
  draggable?: boolean;
  /** 无 actions 时的主按钮点击。 */
  onClick?: () => void;
  /** 主按钮无障碍标签，默认「操作」。 */
  "aria-label"?: string;
  className?: string;
}
