"use client";
import { Fragment } from "react";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { parseMath } from "./math-text.parse";
import type { MathNode, MathTextProps } from "./math-text.types";

// 行内数学排版：把 \frac / \sqrt / 上下标 / 填空槽渲染成真正的数学版式。
// 零依赖（不引 KaTeX/MathJax），纯 CSS 叠放 —— 因此可 RSC，也能安全地嵌在任意正文里。
// 分数用 inline-flex 竖排 + 分数线 border，而非 <sup>/<sub> 拼接：后者在中文正文里
// 行高会被撑乱，且分数线对不齐。

function renderNodes(
  nodes: MathNode[],
  opts: { blankWidth: number; scriptScale: number; blankLabel: string },
): React.ReactNode {
  return nodes.map((node, i) => <Fragment key={i}>{renderNode(node, opts)}</Fragment>);
}

function renderNode(
  node: MathNode,
  opts: { blankWidth: number; scriptScale: number; blankLabel: string },
): React.ReactNode {
  switch (node.kind) {
    case "text":
      return node.text;

    case "frac":
      return (
        <span className="inline-flex flex-col items-center align-middle leading-none mx-[0.15em] text-[0.92em]">
          <span className="px-[0.25em] pb-[0.12em]">{renderNodes(node.num, opts)}</span>
          <span className="w-full border-t border-current" />
          <span className="px-[0.25em] pt-[0.12em]">{renderNodes(node.den, opts)}</span>
        </span>
      );

    case "sqrt":
      return (
        <span className="inline-flex items-start align-middle">
          {node.index ? (
            <span
              className="self-start leading-none translate-y-[0.1em]"
              style={{ fontSize: `${opts.scriptScale * 0.85}em` }}
            >
              {renderNodes(node.index, opts)}
            </span>
          ) : null}
          <span aria-hidden>√</span>
          {/* 被开方数上加一条横线，才是完整的根号；只写 √ 会让 √a+b 有歧义 */}
          <span className="border-t border-current pt-[0.08em] px-[0.1em]">
            {renderNodes(node.radicand, opts)}
          </span>
        </span>
      );

    case "decorate":
      // 上划线用 border-top（\overline{AB} 表示线段），下划线同理走 border-bottom
      if (node.style === "overline" || node.style === "underline") {
        return (
          <span className={node.style === "overline" ? "border-t border-current" : "underline"}>
            {renderNodes(node.children, opts)}
          </span>
        );
      }
      // 向量箭头：杆用 border 拉伸、箭头尖用不变形的 SVG。
      // 不用 → 字符叠加 —— 字符宽度定死，盖不住 \overrightarrow{AB} 这种多字母内容。
      if (node.style === "arrow") {
        return (
          // leading-none 让本盒高度等于字号而非行盒，箭头的 top 才有稳定含义：
          // 不加的话偏移是从行盒顶算起，行高一变箭头就飘到上一行去
          <span className="relative inline-block leading-none">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-[0.28em] flex items-center"
            >
              <span className="h-0 flex-1 border-t border-current" />
              <svg
                viewBox="0 0 6 6"
                className="h-[0.34em] w-[0.34em] shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1.4 1.4 L4.4 3 L1.4 4.6" />
              </svg>
            </span>
            {renderNodes(node.children, opts)}
          </span>
        );
      }
      // 帽子用组合字符叠加
      return (
        <span className="relative inline-block">
          <span
            aria-hidden
            className="absolute inset-x-0 -top-[0.45em] text-center leading-none"
            style={{ fontSize: `${opts.scriptScale}em` }}
          >
            ⌢
          </span>
          {renderNodes(node.children, opts)}
        </span>
      );

    case "overset":
      // 上方记号不加 aria-hidden：它是有语义的内容（弧号等），不是纯装饰线
      return (
        <span className="relative inline-block leading-none">
          <span
            className="absolute inset-x-0 -top-[0.62em] text-center leading-none"
            style={{ fontSize: `${opts.scriptScale}em` }}
          >
            {renderNodes(node.above, opts)}
          </span>
          {renderNodes(node.children, opts)}
        </span>
      );

    case "sup":
      return (
        <sup className="leading-none" style={{ fontSize: `${opts.scriptScale}em` }}>
          {renderNodes(node.children, opts)}
        </sup>
      );

    case "sub":
      return (
        <sub className="leading-none" style={{ fontSize: `${opts.scriptScale}em` }}>
          {renderNodes(node.children, opts)}
        </sub>
      );

    case "blank":
      return (
        <span
          className="inline-block border-b border-current align-baseline mx-[0.2em]"
          style={{ minWidth: `${opts.blankWidth}em` }}
          role="img"
          aria-label={opts.blankLabel}
        />
      );
  }
}

export function MathText({
  children,
  blankWidth = 2.5,
  scriptScale = 0.75,
  className,
}: MathTextProps) {
  const locale = useComponentLocale().mathText ?? { blank: "填空", rowSeparator: "；" };
  const nodes = parseMath(children ?? "", { rowSeparator: locale.rowSeparator });
  return (
    <span className={cn("[&_sup]:align-super [&_sub]:align-sub", className)}>
      {renderNodes(nodes, { blankWidth, scriptScale, blankLabel: locale.blank })}
    </span>
  );
}
