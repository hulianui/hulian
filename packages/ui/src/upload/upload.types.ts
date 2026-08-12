import type { ReactNode, Ref } from "react";

export type UploadStatus = "ready" | "uploading" | "success" | "error";

/**
 * 用于展示的文件项（受控列表）。
 * `<Upload>` 本身仍不做网络传输——状态/进度由消费者（或 `useUpload`）回填。
 */
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
  /**
   * 上传完成后的远端地址。**纯附加字段**：不替代 `onSelect(File[])` 的 File 语义，
   * 也不参与任何组件内部逻辑，只供 `renderPreview` / 消费者回读。
   */
  url?: string;
  /**
   * 原始 File 句柄（若该项来自本次选择）。留给 `renderPreview` 生成本地缩略图
   * （`URL.createObjectURL(raw)`）；服务端回填的历史文件没有此字段，用 `url` 即可。
   */
  raw?: File;
}

export interface UploadRejection {
  file: File;
  /** size=超 maxSize；type=不符 accept；limit=超过 limit 数量上限。 */
  reason: "size" | "type" | "limit";
}

export interface UploadProps {
  /** 原生 accept（如 "image/*,.pdf"）；同时用于落区校验。 */
  accept?: string;
  /** 是否允许多选。@default false */
  multiple?: boolean;
  disabled?: boolean;
  /** 单文件字节上限；超限进 onReject(reason="size")。 */
  maxSize?: number;
  /**
   * 文件数量上限（按受控 `files.length` 计）。达到上限后触发器自动禁用，
   * 本次选择中超出剩余名额的文件进 onReject(reason="limit")。不传则不限。
   */
  limit?: number;
  /** 形态：拖拽落区 / 单按钮。@default "dropzone" */
  variant?: "dropzone" | "button";
  /**
   * 尺寸档（落区高度 / button 形态的按钮高度）。button 形态与 `<Button>` 的同名档等高。
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * 内层 `<input type="file">` 的 name。**给了它才是真表单控件**：原生 `<form>` +
   * `new FormData(form)` 能读到文件，`required` 才会被浏览器校验，input 也不再 `aria-hidden`。
   * 同时改变三处默认行为（都只在传了 name 时生效）：选完不再清空 `value`
   * （见 `resetInputAfterSelect`）、拖入的文件会写回 `input.files`、达到 `limit` 时
   * input 不跟着禁用（禁用的 input 会被 FormData 整个跳过，已选的文件会凭空消失）。
   */
  name?: string;
  /** 原生必填校验，透传到内层 input。**需同时给 `name`**，否则表单读不到这个控件。 */
  required?: boolean;
  /** 拿到内层 `<input type="file">` 的引用（自定义校验、手动清空、第三方表单库注册）。 */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * 选完是否清空 `input.value`（清了才能重复选同一个文件，但清了 FormData 就读不到）。
   * @default 未传 `name` 时 `true`；传了 `name` 时 `false`
   */
  resetInputAfterSelect?: boolean;
  /** 受控展示的文件列表（含状态/进度）；不传则不渲染列表。 */
  files?: UploadFile[];
  /**
   * 缩略图/自定义预览渲染钩子。返回非空节点时，列表项左侧渲染成 40px 方形预览位
   * （状态点降级为角标）；返回 null/undefined 走默认的状态圆点。
   */
  renderPreview?: (file: UploadFile) => ReactNode;
  /** 列表是否可拖拽调序（需同时传 onSort 才生效）。@default false */
  sortable?: boolean;
  /** 拖拽调序后的新顺序（组件不偷存顺序，由你写回 files）。 */
  onSort?: (files: UploadFile[]) => void;
  /** 通过校验的文件被选中（点击选择或拖入）。 */
  onSelect?: (files: File[]) => void;
  /** 被校验拒绝的文件（类型/大小/数量）。 */
  onReject?: (rejections: UploadRejection[]) => void;
  /** 列表项移除按钮点击。 */
  onRemove?: (id: string) => void;
  /**
   * 失败行的重试入口。**传了才渲染重试按钮**（与 onRemove 同口径：组件不偷偷替你决定有没有这个动作）。
   * 直接接 `useUpload` 的 `retry` 即可；自己管上传就把该项改回 `status="ready"` 再重发。
   */
  onRetry?: (id: string) => void;
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

/** `request` 的第二参：进度上报 + 取消信号。 */
export interface UploadRequestContext {
  /** 上报 0–100 的百分比（内部自动 clamp）。 */
  onProgress: (percent: number) => void;
  /** 该任务被 remove/clear/卸载时会 abort，请透传给 fetch/XHR。 */
  signal: AbortSignal;
}

/**
 * 消费者提供的传输函数。库内**不关心**它怎么发（fetch / XHR / OSS SDK），
 * 也不提供 action/headers/withCredentials/transformResponse——那些是应用层的闭包。
 */
export type UploadRequest = (
  file: File,
  ctx: UploadRequestContext,
) => Promise<{ url: string } & Record<string, unknown>>;

export interface UseUploadOptions {
  /** 传输函数（唯一必填）。resolve 出的 url 写入 UploadFile.url。 */
  request: UploadRequest;
  /** 并发上限，超出的排队。@default 3 */
  concurrency?: number;
  /** 任一次 files 变化（新增/进度/成败/移除/调序）后回调。 */
  onChange?: (files: UploadFile[]) => void;
  /** 单个文件上传成功。 */
  onSuccess?: (file: UploadFile, result: { url: string } & Record<string, unknown>) => void;
  /** 单个文件上传失败（不含被 abort 的取消）。 */
  onError?: (file: UploadFile, error: unknown) => void;
}

export interface UseUploadReturn {
  /** 直接喂给 `<Upload files={...}>`。 */
  files: UploadFile[];
  /** 接 `<Upload onSelect>`：入列并按并发上限自动开传。 */
  add: (picked: File[]) => void;
  /** 接 `<Upload onRemove>`：进行中的任务会被 abort。 */
  remove: (id: string) => void;
  /** 重传单个失败项。 */
  retry: (id: string) => void;
  /** 接 `<Upload onSort>`：仅改顺序，不影响进行中的任务。 */
  reorder: (next: UploadFile[]) => void;
  /** 全部取消并清空。 */
  clear: () => void;
  /** 是否还有排队中或进行中的任务。 */
  uploading: boolean;
}
