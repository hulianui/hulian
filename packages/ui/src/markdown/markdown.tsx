"use client";
import { Fragment, memo, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { Prose } from "../prose";
import { CodeBlock } from "../code-block";
import { parseBlocks, type MdBlock } from "./parse";
import type { MarkdownProps } from "./markdown.types";
import { useComponentLocale } from "../config/locale-context";

// 零依赖只读 Markdown 渲染：parseBlocks 切块 → Prose 排版皮肤 + 围栏代码块委托 CodeBlock。
// 行内支持 `代码` / **粗体** / *斜体* / [链接](url)。区别 MarkdownEditor(可编辑·TipTap)：本件纯渲染、RSC 安全。
// 与 StreamingText 配合：流式中用 StreamingText 逐字、done 后切 Markdown 出完整富文本。

// 行内标记：代码优先（其内不再解析），其次粗体、斜体、链接。
const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (let m = INLINE.exec(text); m; m = INLINE.exec(text)) {
    if (m.index > last) out.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>);
    const tok = m[0];
    if (tok.startsWith("`")) {
      out.push(<code key={key++}>{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith("**")) {
      out.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("*")) {
      out.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    } else {
      // [label](url)
      const sep = tok.indexOf("](");
      const label = tok.slice(1, sep);
      const url = tok.slice(sep + 2, -1);
      out.push(
        <a key={key++} href={url} target="_blank" rel="noreferrer noopener">
          {label}
        </a>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  return out;
}

// 段落内软换行 \n → <br/>。每行包一层带唯一 key 的 Fragment——
// 否则各行 renderInline 的内部 key 都从 0 起，平铺进同一 <p> 会撞 key（重复 key 警告）。
function renderText(text: string): ReactNode[] {
  return text.split("\n").map((seg, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {renderInline(seg)}
    </Fragment>
  ));
}

type ProseBlock = Exclude<MdBlock, { type: "code" }>;

// 渲染单个非代码块（在 Prose 排版作用域内，吃 Prose 的标题/段落/列表/引用样式）。
function renderProseBlock(b: ProseBlock, key: number, dataTableLabel: string) {
  switch (b.type) {
    case "heading": {
      const H = `h${b.level}` as "h1" | "h2" | "h3";
      return <H key={key}>{renderInline(b.text)}</H>;
    }
    case "list":
      return b.ordered ? (
        <ol key={key}>
          {b.items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ol>
      ) : (
        <ul key={key}>
          {b.items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    case "quote":
      return <blockquote key={key}>{renderInline(b.text)}</blockquote>;
    case "table":
      // 圆角描边容器 + 表头浅色底 + 行斑马纹 + 仅横向分隔（去满格网格线，主题感知）。
      return (
        <div key={key} className="my-4 overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto" tabIndex={0} aria-label={dataTableLabel}>
            <table className="w-full border-collapse text-[0.92em] [&_tr:last-child>td]:border-b-0">
              <thead>
                <tr className="bg-muted/[0.06]">
                  {b.header.map((h, j) => (
                    <th
                      key={j}
                      className="border-b border-border px-3.5 py-2 text-left font-semibold whitespace-nowrap"
                    >
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((row, r) => (
                  <tr key={r} className="even:bg-muted/[0.03]">
                    {row.map((cell, c) => (
                      <td key={c} className="border-b border-border/60 px-3.5 py-2 align-top">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    default:
      return <p key={key}>{renderText(b.text)}</p>;
  }
}

function MarkdownImpl({ children = "", size = "base", className }: MarkdownProps) {
  const labels = useComponentLocale().markdown ?? { dataTable: "数据表格" };
  const blocks = parseBlocks(children);
  // 连续文本块分组进 Prose，围栏代码块作为独立 CodeBlock 夹在中间 ——
  // 关键：CodeBlock 不能当 Prose 的后代 pre，否则 Prose 的 [&_pre] 样式(p-4/border/bg)会覆盖
  // CodeBlock 自己的 pt-8 避让与边框，导致语言标签/复制钮压住首行 + 双重边框。
  const out: ReactNode[] = [];
  let run: ProseBlock[] = [];
  let key = 0;
  const flush = () => {
    if (!run.length) return;
    const items = run;
    out.push(
      <Prose key={`p${key++}`} size={size}>
        {items.map((b, j) => renderProseBlock(b, j, labels.dataTable))}
      </Prose>,
    );
    run = [];
  };
  for (const b of blocks) {
    if (b.type === "code") {
      flush();
      out.push(<CodeBlock key={`c${key++}`} code={b.code} lang={b.lang} />);
    } else {
      run.push(b);
    }
  }
  flush();
  return <div className={cn("space-y-3", className)}>{out}</div>;
}

export const Markdown = memo(MarkdownImpl);
Markdown.displayName = "Markdown";
