import type { ProseSize } from "../prose/prose.types";

export interface MarkdownProps {
  /** Markdown 源文本（只读渲染；编辑用 MarkdownEditor）。 */
  children?: string;
  /** 排版尺寸基准，透传给内部 Prose。@default "base" */
  size?: ProseSize;
  /**
   * 给渲染出的标题挂锚点 id（规则见 `slugifyHeading`），使长文可做目录与 `#片段` 深链。
   *
   * 默认 false：id 是全局命名空间，Markdown 常被嵌进已有 id 的页面里，
   * 默认生成等于让所有存量调用点在升级后凭空多出一批可能撞车的 id。
   *
   * 传字符串则同时开启并把它当 id 前缀（如 `headingIds="doc-"` → `doc-props`）——
   * 正文与宿主页面共处一个 id 命名空间，只要这页别处可能出现同名 id（页面自己的分节、
   * 或某个示例渲染出的元素），就该用前缀把这批 id 关进自己的命名空间。
   *
   * 目录项用 `extractHeadings(src, prefix)` 从同一份源文本抽，两侧规则与前缀一致才不会错位。
   * @default false
   */
  headingIds?: boolean | string;
  className?: string;
}
