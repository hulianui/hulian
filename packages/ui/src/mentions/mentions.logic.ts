// Mentions 纯逻辑（零 React/零 DOM 几何）——可独立单测。
// caret 像素几何在 mentions.caret.ts（需 DOM 布局，靠截图验证）。

export interface ActiveTrigger {
  /** 触发符 prefix 起始下标。 */
  start: number;
  /** prefix 之后到光标的查询串（不含空白）。 */
  query: string;
}

/**
 * 从光标回看是否正处在一次 @提及输入中。
 * 命中条件：① prefix 子串存在于光标前；② prefix 前一字符为行首或空白（避免 a@b 邮件误触）；
 * ③ prefix 与光标之间（query）不含空白/换行（一旦打了空格即结束本次提及）。
 */
export function findTrigger(value: string, caretPos: number, prefix: string): ActiveTrigger | null {
  if (!prefix) return null;
  const before = value.slice(0, caretPos);
  const start = before.lastIndexOf(prefix);
  if (start === -1) return null;
  const prevChar = start === 0 ? "" : value[start - 1];
  if (prevChar && !/\s/.test(prevChar)) return null;
  const query = before.slice(start + prefix.length);
  if (/\s/.test(query)) return null;
  return { start, query };
}

/**
 * 用所选项替换正在输入的 `prefix + query` 片段，结果为 `prefix + label + " "`（末尾补空格）。
 * 返回新值与替换后的光标位置（落在补的空格之后）。
 */
export function insertMention(
  value: string,
  triggerStart: number,
  caretPos: number,
  prefix: string,
  label: string,
): { value: string; caret: number } {
  const inserted = `${prefix}${label} `;
  const next = value.slice(0, triggerStart) + inserted + value.slice(caretPos);
  return { value: next, caret: triggerStart + inserted.length };
}

export interface MentionSegment {
  text: string;
  /** 是否为一段提及（prefix + 非空白串），供高亮背板着色用。 */
  mention: boolean;
}

/**
 * 把整段文本切成「普通文本 / 提及」交替片段，供高亮背板逐段套色。
 * 提及判定与 findTrigger 同口径：prefix 前为行首或空白（避开 a@b 邮件），prefix 后取非空白串
 * （遇空白即结束），且至少含一个字符。返回片段拼接后等于原文（无丢字）。
 */
export function segmentMentions(value: string, prefix: string): MentionSegment[] {
  if (!prefix || !value) return value ? [{ text: value, mention: false }] : [];
  const out: MentionSegment[] = [];
  let i = 0;
  let plainStart = 0;
  const flushPlain = (end: number) => {
    if (end > plainStart) out.push({ text: value.slice(plainStart, end), mention: false });
  };
  while (i < value.length) {
    if (value.startsWith(prefix, i)) {
      const prev = i === 0 ? "" : value[i - 1];
      if (!prev || /\s/.test(prev)) {
        let j = i + prefix.length;
        while (j < value.length && !/\s/.test(value[j])) j++;
        if (j > i + prefix.length) {
          flushPlain(i);
          out.push({ text: value.slice(i, j), mention: true });
          i = j;
          plainStart = i;
          continue;
        }
      }
    }
    i++;
  }
  flushPlain(value.length);
  return out;
}

/** 内置默认过滤：大小写不敏感子串匹配 label 或 value。 */
export function defaultFilter(option: { label: string; value: string }, query: string): boolean {
  const q = query.toLowerCase();
  return option.label.toLowerCase().includes(q) || option.value.toLowerCase().includes(q);
}
