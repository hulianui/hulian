export interface MarkdownEditorProps {
  /** 受控 markdown 字符串 */
  value?: string;
  /** 非受控初值 */
  defaultValue?: string;
  /** 内容变化回调，参数为 markdown 字符串 */
  onChange?: (markdown: string) => void;
  /** 桥给原生表单 / Field 的隐藏 input name */
  name?: string;
  placeholder?: string;
  /** 校验失败态：外壳变 danger（也可由外层 Field 经 data-invalid 驱动） */
  invalid?: boolean;
  disabled?: boolean;
  /** 内容区最小高度（行），默认 6 */
  minRows?: number;
  className?: string;
  "aria-label"?: string;
}
