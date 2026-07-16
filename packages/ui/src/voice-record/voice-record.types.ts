import type { ButtonHTMLAttributes } from "react";

/** VoiceRecord 组件的状态 */
export type VoiceRecordStatus = "idle" | "recording" | "processing" | "disabled";

export interface VoiceRecordProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick" | "onToggle"> {
  /** 当前状态：idle(默认) / recording(录音中) / processing(处理中) / disabled(禁用) */
  status?: VoiceRecordStatus;
  /** idle 态的标签文本 */
  labelIdle?: string;
  /** recording 态的标签文本 */
  labelRecording?: string;
  /** processing 态的标签文本 */
  labelProcessing?: string;
  /** 录音中的波形级别数组（0-1 的浮点值，驱动波纹动画；传入空数组则律动归零但状态保持） */
  levels?: number[];
  /** 大小：sm(80px) / md(104px) / lg(128px) */
  size?: "sm" | "md" | "lg";
  /** 点击回调——idle 态触发开始，recording 态触发停止 */
  onToggle?: (status: VoiceRecordStatus) => void;
}
