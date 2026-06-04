import { Fragment, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { Prose } from "../prose";
import { CodeBlock } from "../code-block";
import { parseBlocks } from "./parse";
import type { MarkdownProps } from "./markdown.types";

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

// 段落内软换行 \n → <br/>
function renderText(text: string): ReactNode[] {
  const segs = text.split("\n");
  return segs.flatMap((seg, i) =>
    i === 0 ? renderInline(seg) : [<br key={`br${i}`} />, ...renderInline(seg)],
  );
}

export function Markdown({ children = "", size = "base", className }: MarkdownProps) {
  const blocks = parseBlocks(children);
  return (
    <Prose size={size} className={cn(className)}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "code":
            // 跳出 Prose 文字流，交给 CodeBlock（自带高亮 + 复制）
            return <CodeBlock key={i} code={b.code} lang={b.lang} className="my-3" />;
          case "heading": {
            const H = (`h${b.level}` as "h1" | "h2" | "h3");
            return <H key={i}>{renderInline(b.text)}</H>;
          }
          case "list":
            return b.ordered ? (
              <ol key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ol>
            ) : (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ul>
            );
          case "quote":
            return <blockquote key={i}>{renderInline(b.text)}</blockquote>;
          default:
            return <p key={i}>{renderText(b.text)}</p>;
        }
      })}
    </Prose>
  );
}
