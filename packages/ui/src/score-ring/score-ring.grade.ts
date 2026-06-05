export interface Grade {
  /** 命中该等级的最低分（含）。 */
  min: number;
  /** 等级标签（A/B/C/D/F 等）。 */
  label: string;
  /** 等级颜色。可传语义色名（"success"/"warning"/"danger"/"chart-2" 等，经 resolveTone 解析）、CSS 颜色或 var()。 */
  tone?: string;
}

// 默认 A-F 五档。库无 info 语义色，统一用 success/warning/danger 三色带表达好/中/差。
export const DEFAULT_GRADES: Grade[] = [
  { min: 90, label: "A", tone: "var(--color-success)" },
  { min: 80, label: "B", tone: "var(--color-success)" },
  { min: 70, label: "C", tone: "var(--color-warning)" },
  { min: 60, label: "D", tone: "var(--color-warning)" },
  { min: 0, label: "F", tone: "var(--color-danger)" },
];

/** 命中第一个 value>=min 的等级（内部按 min 降序，调用方无需预排序）。 */
export function resolveGrade(value: number, grades: Grade[] = DEFAULT_GRADES): Grade {
  const sorted = [...grades].sort((a, b) => b.min - a.min);
  return sorted.find((g) => value >= g.min) ?? sorted[sorted.length - 1];
}
