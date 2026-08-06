/**
 * 语言标识：透传给着色器。列出的是有专门规则的几种，
 * `string & Record<never, never>` 保留联合提示又不封死其它语言（未知语言按 JS 家族着色）。
 */
export type CodeEditorLanguage =
  | "typescript"
  | "tsx"
  | "javascript"
  | "jsx"
  | "json"
  | "css"
  | "bash"
  | (string & Record<never, never>);

/** 强制主题：不传时跟随全局 `[data-theme]`。 */
export type CodeEditorTheme = "light" | "dark";

export interface CodeEditorProps {
  /** 受控代码文本（必须配合 onChange 回写，否则编辑会被 React 回滚） */
  value: string;
  /** 文本变化回调（键盘增强与普通输入走同一条回调） */
  onChange?: (value: string) => void;
  /** 语言：决定着色器、注释符与成对符号规则 */
  language?: CodeEditorLanguage;
  /** 只读：textarea 仍可聚焦/选中/复制，但不接受输入与键盘增强 */
  readOnly?: boolean;
  /** 是否显示行号槽 */
  lineNumbers?: boolean;
  /** 是否高亮光标所在行（仅聚焦时显示） */
  highlightActiveLine?: boolean;
  /** 行高倍数（无单位），同时作用于行号槽与代码区 */
  lineHeight?: number;
  /** 一级缩进宽度（空格数），同时作为 tab-size */
  tabSize?: number;
  /** 无内容时的占位文案 */
  placeholder?: string;
  /** 默认可见行数（未给外层确定高度时决定组件高度） */
  rows?: number;
  /** 强制主题（逃生口）；不传则跟随全局主题 */
  theme?: CodeEditorTheme;
  /** 无障碍名称；不传时回退为「代码编辑器」+ 语言 */
  ariaLabel?: string;
  /** 外层类名（给高度/宽度/最大高度） */
  className?: string;
  /** 聚焦 */
  onFocus?: () => void;
  /** 失焦 */
  onBlur?: () => void;
}
