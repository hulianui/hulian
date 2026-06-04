export type DiffLineType = "add" | "del" | "context";

export interface DiffRow {
  type: DiffLineType;
  /** 旧文件行号（add 行为 null）。 */
  oldNo: number | null;
  /** 新文件行号（del 行为 null）。 */
  newNo: number | null;
  text: string;
}

function toLines(text: string): string[] {
  // 空文件视作 0 行（而非一行空串），避免无谓的 del/add 噪声
  return text === "" ? [] : text.split("\n");
}

/**
 * 行级 LCS diff（零依赖）：求最长公共子序列后回溯成 del/add/context 序列。
 * 时间/空间 O(n·m)，对常规代码块足够。
 */
export function diffLines(oldText: string, newText: string): DiffRow[] {
  const a = toLines(oldText);
  const b = toLines(newText);
  const n = a.length;
  const m = b.length;

  // dp[i][j] = a[i..] 与 b[j..] 的 LCS 长度
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const rows: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      rows.push({ type: "context", oldNo: i + 1, newNo: j + 1, text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: "del", oldNo: i + 1, newNo: null, text: a[i] });
      i++;
    } else {
      rows.push({ type: "add", oldNo: null, newNo: j + 1, text: b[j] });
      j++;
    }
  }
  while (i < n) rows.push({ type: "del", oldNo: i + 1, newNo: null, text: a[i++] });
  while (j < m) rows.push({ type: "add", oldNo: null, newNo: j + 1, text: b[j++] });
  return rows;
}

/** 统计增删行数（头部摘要用）。 */
export function diffStat(rows: DiffRow[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const r of rows) {
    if (r.type === "add") added++;
    else if (r.type === "del") removed++;
  }
  return { added, removed };
}
