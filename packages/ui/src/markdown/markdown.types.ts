import type { ProseSize } from "../prose/prose.types";

export interface MarkdownProps {
  /** Markdown 源文本（只读渲染；编辑用 MarkdownEditor）。 */
  children?: string;
  /** 排版尺寸基准，透传给内部 Prose。@default "base" */
  size?: ProseSize;
  className?: string;
}
