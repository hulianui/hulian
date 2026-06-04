// 零依赖、只读 Markdown 块级解析器（覆盖 assistant 输出常见子集，非完整 CommonMark）。
// 纯函数无副作用，便于单测；行内解析见 renderInline（在 markdown.tsx 消费）。
// 支持：围栏代码块 ```lang / 标题 #~### / 引用 > / 有序无序列表 / 段落。

export type MdBlock =
  | { type: "code"; lang?: string; code: string }
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "para"; text: string };

const FENCE = /^```/;
const HEADING = /^(#{1,3})\s+(.*)$/;
const QUOTE = /^>\s?/;
const LIST = /^(\s*)([-*]|\d+\.)\s+/;
const BLANK = /^\s*$/;

export function parseBlocks(src: string): MdBlock[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 围栏代码块：```lang … ```
    if (FENCE.test(line)) {
      const lang = line.slice(3).trim() || undefined;
      const buf: string[] = [];
      i++;
      while (i < lines.length && !FENCE.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; // 跳过收尾围栏
      blocks.push({ type: "code", lang, code: buf.join("\n") });
      continue;
    }

    if (BLANK.test(line)) {
      i++;
      continue;
    }

    const h = HEADING.exec(line);
    if (h) {
      blocks.push({ type: "heading", level: h[1].length as 1 | 2 | 3, text: h[2] });
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i])) {
        buf.push(lines[i].replace(QUOTE, ""));
        i++;
      }
      blocks.push({ type: "quote", text: buf.join(" ") });
      continue;
    }

    if (LIST.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && LIST.test(lines[i])) {
        items.push(lines[i].replace(LIST, ""));
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // 段落：收集到空行或下一个块级起始
    const buf: string[] = [];
    while (
      i < lines.length &&
      !BLANK.test(lines[i]) &&
      !FENCE.test(lines[i]) &&
      !HEADING.test(lines[i]) &&
      !QUOTE.test(lines[i]) &&
      !LIST.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: "para", text: buf.join("\n") });
  }

  return blocks;
}
