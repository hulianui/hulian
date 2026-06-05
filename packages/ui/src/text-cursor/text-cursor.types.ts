import type { HTMLAttributes, ReactNode } from "react";

export interface TextCursorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * 跟随光标拖出的文本 / 字形。默认 "瑚"。
   * 可传任意短字符串或 emoji（如 "✨"）。
   */
  text?: string;
  /**
   * 相邻字形之间的最小像素间距：光标每移动满 spacing 像素才落下一个新字形。
   * 值越小越密集、越大越稀疏。默认 80。
   */
  spacing?: number;
  /**
   * 字形是否沿光标移动方向旋转对齐（atan2 算角度）。
   * 关闭则所有字形保持水平。默认 true。
   */
  followMouseDirection?: boolean;
  /**
   * 字形落定后是否做随机微浮动（位移 + 轻微旋转的往复呼吸）。默认 true。
   * reduced-motion 下自动停用，仅保留淡出。
   */
  randomFloat?: boolean;
  /**
   * 字形淡出所需秒数（opacity 过渡时长）。默认 0.5。
   */
  exitDuration?: number;
  /**
   * 拖尾自动消减的轮询间隔（毫秒）：光标静止超过 ~100ms 后，
   * 每隔 removalInterval 从队首移除一个字形，形成自然回收。默认 30。
   */
  removalInterval?: number;
  /**
   * 拖尾同时存在的字形上限，超出则丢弃最旧的。默认 5。
   */
  maxPoints?: number;
  /**
   * 字号（任意 CSS 长度）。默认 "1.875rem"。
   */
  fontSize?: string;
  /**
   * 容器内可选的居中内容（提示语 / 标题），不影响拖尾层。
   */
  children?: ReactNode;
}
