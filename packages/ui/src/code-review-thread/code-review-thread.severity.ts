import type { TagTone } from "../tag";

export type ReviewSeverity = "critical" | "major" | "minor" | "info";

export interface SeverityStyle {
  label: string;
  /** 映射到 Tag 的 tone（库无 info 色，minor→brand、info→neutral）。 */
  tagTone: TagTone;
  /** 左边色条字面类。 */
  border: string;
}

export const SEVERITY: Record<ReviewSeverity, SeverityStyle> = {
  critical: { label: "严重", tagTone: "danger", border: "border-l-danger" },
  major: { label: "重要", tagTone: "warning", border: "border-l-warning" },
  minor: { label: "次要", tagTone: "brand", border: "border-l-primary" },
  info: { label: "提示", tagTone: "neutral", border: "border-l-border" },
};

export function severityStyle(s?: ReviewSeverity, labels?: Record<ReviewSeverity, string>): SeverityStyle {
  const key = s ?? "info";
  return labels ? { ...SEVERITY[key], label: labels[key] } : SEVERITY[key];
}
