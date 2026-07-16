import type { ButtonHTMLAttributes } from "react";

/** VoiceRecord 组件的状态 */
export type VoiceRecordStatus = "idle" | "recording" | "processing" | "disabled";

export interface VoiceRecordProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick" | "onToggle"> {
  /** 当前状态：idle(默认) / recording(录音中) / processing(处理中) / disabled(禁用) */
  status?: VoiceRecordStatus;
  /** idle 态的标签文本 */
  labelIdle?: string;
  /** recording 态的标签文本 */
  labelRecording?: string;
  /** processing 态的标签文本 */
  labelProcessing?: string;
  /** 录音中的波形级别数组（0-1 的浮点值，驱动波纹动画） */
  levels?: number[];
  /** 大小：sm(80px) / md(104px) / lg(128px) */
  size?: "sm" | "md" | "lg";
  /**
   * 按住说话模式（GPT-Live 风格）。
   * true：按下开始→松开结束（onPointerDown / onPointerUp）
   * false：点击切换（onClick）
   * @default true
   */
  pressAndHold?: boolean;
  /** idle 态按下回调（pressAndHold=true 时） */
  onPress?: () => void;
  /** recording 态松开回调（pressAndHold=true 时） */
  onRelease?: () => void;
  /** 状态切换回调——idle→开始录音，recording→停止录音 */
  onToggle?: (status: VoiceRecordStatus) => void;
}
