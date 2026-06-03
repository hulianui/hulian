import type { ReactNode } from "react";

export type UploadStatus = "ready" | "uploading" | "success" | "error";

/** 用于展示的文件项（受控列表）。组件本身不做网络传输，状态/进度由消费者回填。 */
export interface UploadFile {
  id: string;
  name: string;
  /** 字节数，用于展示。 */
  size?: number;
  status?: UploadStatus;
  /** 0–100，仅 status="uploading" 时展示进度条。 */
  progress?: number;
  /** status="error" 时的错误文案。 */
  error?: string;
}

export interface UploadRejection {
  file: File;
  reason: "size" | "type";
}

export interface UploadProps {
  /** 原生 accept（如 "image/*,.pdf"）；同时用于落区校验。 */
  accept?: string;
  /** 是否允许多选。@default false */
  multiple?: boolean;
  disabled?: boolean;
  /** 单文件字节上限；超限进 onReject(reason="size")。 */
  maxSize?: number;
  /** 形态：拖拽落区 / 单按钮。@default "dropzone" */
  variant?: "dropzone" | "button";
  /** 受控展示的文件列表（含状态/进度）；不传则不渲染列表。 */
  files?: UploadFile[];
  /** 通过校验的文件被选中（点击选择或拖入）。 */
  onSelect?: (files: File[]) => void;
  /** 被校验拒绝的文件（类型/大小）。 */
  onReject?: (rejections: UploadRejection[]) => void;
  /** 列表项移除按钮点击。 */
  onRemove?: (id: string) => void;
  /** 落区主文案。 */
  label?: ReactNode;
  /** 落区辅助说明（格式/大小限制提示）。 */
  hint?: ReactNode;
  /** button 形态的按钮文案。@default "选择文件" */
  buttonLabel?: ReactNode;
  /** 自定义落区内容（覆盖 label/hint）。 */
  children?: ReactNode;
  className?: string;
}
