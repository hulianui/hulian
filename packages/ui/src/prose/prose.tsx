import type { ElementType } from "react";
import { cn } from "../lib/cn";
import type { ProseProps, ProseSize } from "./prose.types";

// 富文本 / markdown 排版容器（可 RSC，本体不加 "use client"）。
// 用后代选择器把标题/段落/列表/代码/引用/表格统一吃语义 token —— 消费者只管把渲染好的 HTML/JSX
// 塞进来（如 markdown→HTML、dangerouslySetInnerHTML、MDX 输出），排版样式由本容器统一接管。
// 全程零依赖、只消费语义 token，明暗自适配。
const proseBase = cn(
  "text-foreground leading-7",
  // 首尾子元素去外边距，间距由容器自身控制
  "[&>:first-child]:mt-0 [&>:last-child]:mb-0",
  // 标题：Tailwind preflight 把标题字号重置为继承（=正文），故必须显式给字号，
  // 否则 h1~h4 仅字重不同、字号全等于正文，标题层级塌成一片。
  "[&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:tracking-tight [&_h1]:text-foreground",
  "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:tracking-tight [&_h2]:text-foreground",
  "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-foreground",
  "[&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground",
  // 段落
  "[&_p]:my-4",
  // 强调
  "[&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic",
  // 链接
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary-hover",
  // 列表
  "[&_ul]:my-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:my-4 [&_ol]:ml-6 [&_ol]:list-decimal",
  "[&_li]:my-1 [&_li]:marker:text-muted-foreground",
  // 行内代码（排除 pre 内的 code）
  "[&_:not(pre)>code]:rounded-[min(var(--radius),0.375rem)] [&_:not(pre)>code]:bg-surface-hover [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.85em]",
  // 代码块
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-[var(--radius)] [&_pre]:border [&_pre]:border-border [&_pre]:bg-surface [&_pre]:p-4 [&_pre]:text-sm",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:font-mono",
  // 引用：不加 italic —— 中文字体没有真意大利体字形，浏览器会合成伪斜体把笔画拉变形。
  // 引用语义由左边线 + 弱化文字色承担，倾斜不表达任何东西。
  "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
  // 折叠块（GFM <details>/<summary>，markdown→HTML 的标配）：与 pre 同一视觉家族——
  // 同样的圆角 + border + surface 底，让它在正文里读起来是「一块可展开的容器」而不是裸文字。
  "[&_details]:my-4 [&_details]:rounded-[var(--radius)] [&_details]:border [&_details]:border-border [&_details]:bg-surface [&_details]:px-4 [&_details]:py-3",
  // summary 是连点目标（反复展开/收起），文本一律 select-none，否则双击会把标题刷成选区。
  "[&_summary]:cursor-pointer [&_summary]:select-none [&_summary]:font-semibold [&_summary]:text-foreground [&_summary:hover]:text-primary",
  // 展开后 summary 与首个内容块留一档（对齐容器 py-3），末元素外边距收敛进内距。
  "[&_details>summary+*]:mt-3 [&_details>:last-child]:mb-0",
  // 嵌套折叠块（教程长文里常见：外层「展开看答案」内套「展开看报错怎么读」）改用弱背景，
  // 与外层的 surface 拉开一档；亮色 surface(白) > subtle(gray-100)、暗色 surface(gray-900)
  // < subtle(gray-800)，两个方向相反但「内层与外层不同色」在明暗下都成立。
  "[&_details_details]:bg-subtle",
  // 分隔线 / 图片
  "[&_hr]:my-8 [&_hr]:border-border [&_img]:my-4 [&_img]:rounded-[var(--radius)]",
  // 表格
  "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
  "[&_th]:border-b [&_th]:border-border [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold",
  "[&_td]:border-b [&_td]:border-border [&_td]:p-2",
);

const SIZE: Record<ProseSize, string> = {
  sm: "text-sm",
  base: "text-base",
};

// 宽表兜底。Prose 两种内容形态都支持：children（JSX 子节点）与 dangerouslySetInnerHTML
// （markdown→HTML 字符串，经 ...props 透传）。children 形态下调用方完全可以自己把 table 包进
// 一层 overflow-x-auto 容器，那样更可控；但 HTML 字符串形态下本组件拿不到表格节点、包不了容器，
// 所以另外给一档只作用在 table 自身上的开关，让两种形态都有解。table 改 block 后由匿名表格盒接管内部
// 布局（border-collapse 是继承属性，照常生效），w-max 按内容撑开、max-w-full 封顶到版心。
// th 的 whitespace-nowrap 是**必需项**不是修饰：只写 overflow-x-auto 的话列会被压到 min-content
// （中文一列一字），内容永远不超出滚动容器，于是根本不滚。360px 实测六列表：只给 overflow
// → scrollWidth 360 = clientWidth、表头行高 112px；补上 th nowrap → scrollWidth 388 > 360 真滚、
// 表头回到 40px 单行。表头恒为短标签故可整体 nowrap，正文单元格照常换行（长描述别 nowrap，
// 一条长字符串会把表拖宽到别的列滚不到）。代价是窄表不再恒占满版心 —— 所以是可选档而非默认。
const SCROLLABLE_TABLES = cn(
  "[&_table]:block [&_table]:w-max [&_table]:max-w-full [&_table]:overflow-x-auto",
  "[&_th]:whitespace-nowrap",
);

export function Prose<E extends ElementType = "div">({
  as,
  size = "base",
  scrollableTables = false,
  className,
  ...props
}: ProseProps<E>) {
  const Comp = (as ?? "article") as ElementType;
  return <Comp className={cn(proseBase, SIZE[size], scrollableTables && SCROLLABLE_TABLES, className)} {...props} />;
}
