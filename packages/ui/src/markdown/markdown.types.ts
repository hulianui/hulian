import type { ProseSize } from "../prose/prose.types";
import type { CodeBlockProps } from "../code-block/code-block.types";

export interface MarkdownProps {
  /** Markdown 源文本（只读渲染；编辑用 MarkdownEditor）。 */
  children?: string;
  /** 排版尺寸基准，透传给内部 Prose。@default "base" */
  size?: ProseSize;
  /**
   * 字号和行距跟父级走，内部不再钉 `text-base` / `leading-7`。
   * 阅读器把档位写在外层时打开。文档页保持关闭。
   * 打开后 `size` 不再生效。
   * @default false
   */
  inheritTypography?: boolean;
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
  /**
   * 透传给每个围栏代码块（内部是 CodeBlock）的展示选项，如 `{ maxLines: 20 }` 让 AI 回复里的
   * 长代码默认折叠、`{ defaultWrap: true }` 让日志类内容默认换行。`code` / `lang` 由源文本决定，不在此列。
   *
   * Markdown 是 memo 组件：在渲染函数里写字面量对象，每次父级渲染都是新引用，会让整篇重新解析。
   * 把对象提到组件外常量或用 useMemo 固定住。
   */
  codeBlock?: Pick<CodeBlockProps, "lineNumbers" | "defaultWrap" | "maxLines" | "copyable" | "highlight">;
  className?: string;
}
