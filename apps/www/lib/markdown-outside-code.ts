// markdown-outside-code.ts —— 只改「代码之外」的 Markdown 文本。
//
// 站点里有两处要在文档 Markdown 上做词级改写（组件文档的相对链接重写、更新日志的
// 组件名链接化），两处都必须放过围栏代码块与行内代码：`Button` 出现在代码里是标识符，
// 出现在正文里才是对组件的引用。
//
// 围栏/行内代码的判定规则与 scripts/check-component-doc-translations.mjs 同源（那支
// Node 脚本自带一份，因为它不进 Next 的模块图）；此处是 Next server 侧的运行时镜像。

function backtickRun(markdown: string, index: number): number {
  if (markdown[index] !== "`") return 0;
  let end = index;
  while (markdown[end] === "`") end += 1;
  return end - index;
}

function hasClosingBacktickRunBeforeFence(
  markdown: string,
  index: number,
  length: number,
): boolean {
  for (let cursor = index; cursor < markdown.length; ) {
    const lineEnd = markdown.indexOf("\n", cursor);
    const end = lineEnd < 0 ? markdown.length : lineEnd;
    if (
      (cursor === 0 || markdown[cursor - 1] === "\n") &&
      /^ {0,3}(`{3,}|~{3,})/.test(markdown.slice(cursor, end))
    ) {
      return false;
    }
    for (let next = markdown.indexOf("`", cursor); next >= 0 && next < end; ) {
      const run = backtickRun(markdown, next);
      if (run === length) return true;
      next = markdown.indexOf("`", next + run);
    }
    if (lineEnd < 0) return false;
    cursor = lineEnd + 1;
  }
  return false;
}

/**
 * 对 Markdown 中「不在代码里」的纯文本段调用 `rewrite`，代码块与行内代码原样保留。
 *
 * 行内代码可以跨行（CommonMark 的 code span 允许），故这里按行扫描但把未闭合的反引号
 * 状态带到下一行；只有确认存在闭合围栏的行内代码才整段跳过，否则当普通字符放行 ——
 * 否则一个落单的反引号会把后面整行正文吞进代码里。
 */
export function rewriteOutsideCode(
  markdown: string,
  rewrite: (text: string) => string,
  /**
   * 可选：同一行内闭合的行内代码（含两侧反引号）交给它改写；不传则原样保留。
   * `line` / `start` 是该代码段在本行里的位置，供调用方判断它是否已在某个链接里。
   * 跨行的行内代码与围栏块永远原样保留。
   */
  rewriteInlineCode?: (span: string, line: string, start: number) => string,
): string {
  const lines = markdown.match(/.*(?:\n|$)/g)?.filter(Boolean) ?? [];
  let fence: string | null = null;
  let inlineTicks = 0;
  let globalOffset = 0;
  return lines
    .map((line) => {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})/)?.[1];
      if (fence) {
        if (marker?.[0] === fence[0] && marker.length >= fence.length) fence = null;
        globalOffset += line.length;
        return line;
      }
      if (marker) {
        inlineTicks = 0;
        fence = marker;
        globalOffset += line.length;
        return line;
      }

      let output = "";
      let cursor = 0;
      while (cursor < line.length) {
        if (inlineTicks) {
          let close = line.indexOf("`", cursor);
          while (close >= 0 && backtickRun(line, close) !== inlineTicks) {
            close += backtickRun(line, close);
            close = line.indexOf("`", close);
          }
          if (close < 0) {
            output += line.slice(cursor);
            cursor = line.length;
            continue;
          }
          const end = close + inlineTicks;
          output += line.slice(cursor, end);
          cursor = end;
          inlineTicks = 0;
          continue;
        }

        const opening = line.indexOf("`", cursor);
        if (opening < 0) {
          output += rewrite(line.slice(cursor));
          cursor = line.length;
          continue;
        }
        const length = backtickRun(line, opening);
        const end = opening + length;
        if (!hasClosingBacktickRunBeforeFence(markdown, globalOffset + end, length)) {
          output += rewrite(line.slice(cursor, end));
          cursor = end;
          continue;
        }
        output += rewrite(line.slice(cursor, opening));
        if (rewriteInlineCode) {
          let close = line.indexOf("`", end);
          while (close >= 0 && backtickRun(line, close) !== length) {
            close += backtickRun(line, close);
            close = line.indexOf("`", close);
          }
          if (close >= 0) {
            const spanEnd = close + length;
            output += rewriteInlineCode(line.slice(opening, spanEnd), line, opening);
            cursor = spanEnd;
            continue;
          }
        }
        output += line.slice(opening, end);
        cursor = end;
        inlineTicks = length;
      }
      globalOffset += line.length;
      return output;
    })
    .join("");
}
