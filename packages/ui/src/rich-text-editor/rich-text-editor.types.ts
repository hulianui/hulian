import type { HTMLAttributes } from "react";
import type { AnyExtension } from "@tiptap/react";
import type { NormalizeLegacyHtmlOptions } from "./rich-text-editor.legacy";

/**
 * 工具栏条目。`"divider"` 只是竖线，不带命令。
 *
 * 中后台常见的一档就是默认值：
 * 加粗 / 斜体 / 下划线 / 删除线 / 标题 / 字号 / 颜色 / 对齐 / 列表 / 引用 / 链接 / 图片 / 表格 / 清格式。
 */
export type RichTextToolbarItem =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "heading"
  | "fontSize"
  | "color"
  /** 文字底色。写出来的是 `<span style="background-color">`，**不是** `<mark>`（#210）。 */
  | "backgroundColor"
  | "align"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "link"
  | "image"
  | "table"
  | "clear"
  | "divider";

/**
 * 存量 HTML 兼容的分档开关。
 *
 * 三档各自要的东西不一样，所以既有纯函数也有 schema：
 * - `font` —— `<font color|face|size>` 翻成 `<span style>`（纯函数），
 *   同时把 color / font-size / **font-family** / **background-color** 四个 mark 属性装进 schema
 *   （缺一个就在载入时被清掉）。后两个没有对应的工具栏按钮，装它们纯粹是为了别把存量的排版丢了。
 * - `imgStyle` —— `<img>` 上的 `style` 进 schema 属性（`max-width` / `width` / `height` 白名单）。
 *   纯函数救不了这一档：schema 里没有的属性，解析那一刻就没了。
 * - `align` —— `<section>` / `<div>` / `align="center"` / `<center>` 上的对齐下推到子块（纯函数）。
 */
export interface LegacyHtmlOptions extends NormalizeLegacyHtmlOptions {
  /** `<img>` 上的内联 `style`（`max-width` / `width` / `height`）。 */
  imgStyle?: boolean;
}

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 表单受控件必须能接 react-hook-form 的 `Controller` —— 尤其 `field.onBlur` 传不进去时
 * `touchedFields` 永不更新、`mode: "onBlur"` 的表单静默失效（同 MarkdownEditor）。
 */
export interface RichTextEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** 受控 **HTML 片段串**（存量数据库里躺的就是它，前台 `v-html` / 小程序 `rich-text` 直接吃）。 */
  value?: string;
  /** 非受控初值（HTML 串）。 */
  defaultValue?: string;
  /** 内容变化回调，参数是 HTML 串。 */
  onChange?: (html: string) => void;
  /** 桥给原生表单 / Field 的隐藏 input name（值为 HTML 串）。 */
  name?: string;
  placeholder?: string;
  /** 校验失败态：外壳变 danger（也可由外层 Field 经 data-invalid 驱动）。 */
  invalid?: boolean;
  disabled?: boolean;
  /** 内容区最小高度（行），默认 8。 */
  minRows?: number;
  /**
   * 内容区**最大**高度（行，与 `minRows` 同一套单位）。超过就让**正文自己内部滚动**，
   * 工具栏留在滚动区外 —— 不给上限时编辑区高度完全跟着正文长度走，
   * 存量长文（隐私条款 / 商品详情，动辄七八千字）会把整页撑到上万 px，把「保存」顶出视口。
   *
   * 这一档只能由库来给：业务侧套 `max-h` 只能包在**整个外壳**上，工具栏在外壳里面，
   * 于是工具栏会跟着正文一起滚走，比不加更糟。
   */
  maxRows?: number;
  /**
   * 内容区最大高度的**长度**写法（数值按 px，字符串按任意 CSS 长度，如 `"60vh"`）。
   * 与 `maxRows` 同一件事、两种单位；**两个都给时以 `maxHeight` 为准**（dev 下告警）。
   */
  maxHeight?: number | string;
  /**
   * 工具栏条目与顺序。不传即完整一档；传 `[]` 则整条工具栏不渲染（只读预览式编辑）。
   * 裁掉某一档同时会**关掉对应扩展**（如不给 `"table"` 就不装表格扩展），
   * 因此裁剪不只是省按钮，也决定了粘贴/回填时哪些标签能活下来 —— 见文档「禁忌 / 坑」。
   */
  toolbar?: RichTextToolbarItem[];
  /**
   * 图片上传：把 `File` 交给消费方，拿回可访问的 URL 后插入 `<img src>`。
   *
   * 不传则工具栏的图片按钮改为「填 URL」，**永远不会内联 base64** ——
   * 那会让一篇正文膨胀几 MB 并塞爆数据库字段。传输层（鉴权头、OSS 直传、进度）
   * 一律交还消费方，同 `Upload` 的 `useUpload` 口径。
   */
  onUploadImage?: (file: File) => Promise<{ url: string }>;
  /**
   * 粘贴净化：从 Word / 网页粘进来的内容洗掉 `class`、`on*`、`<style>`、`javascript:` 协议，
   * 并把内联 `style` 过一遍属性白名单（保留 color / text-align / font-size 这类真排版）。
   * @default true
   */
  sanitizePaste?: boolean;
  /**
   * 存量 HTML 兼容（微信编辑器 / Word / 老 UEditor 迁过来的正文）：默认**关**，显式开。
   *
   * `true` = 三档全开；给对象则**只开写明的那几档**（`{ font: true }` 只翻译 `<font>`）。
   * 关着时组件行为与不认识这个 prop 时**逐字节一致** —— 存量消费方不会被静默改掉。
   *
   * 开之前记得先看「禁忌 / 坑」：它保住的是排版，`<section>` 这类结构标签仍会被规范化。
   * @default false
   */
  legacyHtml?: boolean | LegacyHtmlOptions;
  /**
   * 追加自定义 TipTap 扩展（如给存量内容里的 `<iframe>` 视频加一个节点类型）。
   *
   * 编辑器的 schema 决定了哪些标签能活下来：schema 之外的标签在**载入时**就被丢掉，
   * 保存回去即数据丢失。存量 HTML 里有超出内置一档的标签时，用这个口子补节点，
   * 别指望「不碰它就不会掉」。
   */
  extensions?: AnyExtension[];
  className?: string;
  "aria-label"?: string;
}
