import { memo } from "react";
import { cn } from "../lib/cn";
import { ARROW_H, ARROW_W, ARROWS, annotationGeometry } from "./annotation.geometry";
import type { AnnotationProps, AnnotationSide, AnnotationTone } from "./annotation.types";

/**
 * tone 只设 `--hl-ann-color` 一个变量：荧光笔底色由它派生（见基础类里的 color-mix），
 * 所以外层不设 color —— 否则被标注的正文会跟着染色。
 */
const toneClass: Record<AnnotationTone, string> = {
  neutral: "[--hl-ann-color:var(--color-muted-foreground)]",
  primary: "[--hl-ann-color:var(--color-primary)]",
  success: "[--hl-ann-color:var(--color-success)]",
  warning: "[--hl-ann-color:var(--color-warning)]",
  danger: "[--hl-ann-color:var(--color-danger)]",
  // 色相循环。@property --hl-ann-hue（见 tokens/preset.css）让色相可插值，
  // 动画挂在宿主上、靠继承传给箭头与标签。motion-safe 让降低动效偏好下停在起始色。
  rainbow:
    "[--hl-ann-color:oklch(0.65_0.28_var(--hl-ann-hue))] motion-safe:animate-[hulian-annotation-hue_3s_linear_infinite]",
};

/**
 * 手写风格标注：给一段行内内容画上荧光笔底色 + 手绘箭头 + 手写小标签，
 * 用来在文档 / 演示 / 组件解剖图里就地讲解「这一块是什么」。
 *
 * 与 Callout（整块 admonition 提示框）互补：Callout 是**打断**正文的块级提示，
 * Annotation 是**贴着**正文的旁注，不占布局位置。
 *
 * 实现取向（与 CSS-only 的同类方案的差别）：
 * - 标签是**真实 DOM 节点**而非 `::after` + `content: attr()`。伪元素只能吃字符串，
 *   真节点能放 ReactNode（内嵌 Code、链接），读屏也能正常读到。
 * - 箭头是**真实 SVG 元素**而非 `mask: url(data:...)`。直接吃 currentColor，
 *   省掉一层遮罩合成，笔画粗细也能按需调。
 * - 八个方位共用两条定位规则（箭头头贴目标、标签接箭头尾），几何算在
 *   annotation.geometry.ts 的纯函数里，可单测。
 *
 * ⚠️ 标签是绝对定位的，会溢出目标盒子。若某个祖先是 `overflow: hidden`
 * （ScrollArea、卡片裁剪、表格单元格），标签会被裁掉 —— 给那个祖先留出内边距，
 * 或换一个 side。
 */
function AnnotationImpl({
  note,
  side = "ne",
  tone = "neutral",
  mark = true,
  rotate = -4,
  labelWidth = 150,
  gap = 5,
  labelGap = 6,
  offset,
  handwritten = true,
  as: Tag = "span",
  children,
  className,
  labelClassName,
}: AnnotationProps) {
  const hasNote = note != null && note !== "" && note !== false;
  const geometry = annotationGeometry({
    side,
    gap,
    labelGap,
    offsetX: offset?.x ?? 0,
    offsetY: offset?.y ?? 0,
  });
  const arrow = ARROWS[side];

  return (
    <Tag
      className={cn(
        "relative inline-block leading-[1.15]",
        // 荧光笔底色由 tone 色派生；暗色底上同样 alpha 会发闷，提到 24%。
        "[--hl-ann-mark:color-mix(in_oklch,var(--hl-ann-color)_12%,transparent)]",
        "dark:[--hl-ann-mark:color-mix(in_oklch,var(--hl-ann-color)_24%,transparent)]",
        toneClass[tone],
        // 左右各外扩一点，模仿马克笔涂过头 —— 用 box-shadow 而不是 padding，
        // 免得把行内文字挤开、破坏原本的排版节奏。
        // 外扩量走 --hl-ann-spread：几条标注紧挨着时（同一行里逐块标注）默认量会让
        // 底色连成一整片，此时用 className="[--hl-ann-spread:0.1em]" 收窄或设 0 断开。
        mark &&
          "rounded-[3px] bg-(--hl-ann-mark) [--hl-ann-spread:0.3em] shadow-[calc(-1*var(--hl-ann-spread))_0_0_0_var(--hl-ann-mark),var(--hl-ann-spread)_0_0_0_var(--hl-ann-mark)]",
        className,
      )}
    >
      {children}
      {hasNote && (
        <>
          <svg
            aria-hidden
            viewBox={`0 0 ${ARROW_W} ${ARROW_H}`}
            width={ARROW_W}
            height={ARROW_H}
            fill="none"
            stroke="var(--hl-ann-color)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            // forced-colors 下 currentColor 系会被系统色覆盖成不可见，显式钉到 CanvasText
            className="pointer-events-none absolute z-10 opacity-90 forced-colors:stroke-[CanvasText]"
            style={geometry.arrow}
          >
            <path d={arrow.stem} />
            <path d={arrow.head} />
          </svg>
          <span
            className={cn(
              "pointer-events-none absolute z-10 w-max text-[0.95rem] leading-[1.05] font-normal opacity-90",
              "break-words whitespace-normal text-(--hl-ann-color)",
              handwritten && "font-(family-name:--hl-annotation-font)",
              labelClassName,
            )}
            style={{
              ...geometry.label,
              maxWidth: labelWidth,
              // 倾斜要接在方位自带的 translate 之后，否则居中的那一轴会被转歪。
              transform: `${geometry.label.transform ?? ""} rotate(${rotate}deg)`.trim(),
            }}
          >
            {note}
          </span>
        </>
      )}
    </Tag>
  );
}
AnnotationImpl.displayName = "Annotation";

// 解剖图 / 讲解稿里一屏挂十几条标注，每条都要重跑一遍八方位几何（annotationGeometry）。
// props 全是稳定原语时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
// 几何仍是每次渲染现算（纯函数、无缓存），memo 只是让「稳定 props 下压根不渲染」。
export const Annotation = memo(AnnotationImpl);
Annotation.displayName = "Annotation";
