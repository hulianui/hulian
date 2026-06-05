import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import { resolveGrade, DEFAULT_GRADES } from "./score-ring.grade";
import type { ScoreRingProps } from "./score-ring.types";

// 评分环：带 A-F 等级带的半径仪表盘，区别于线性 Meter/Progress。
// 圆环用 SVG stroke-dasharray + dashoffset 控进度（非 CSS transform，见库 svg-circular-progress-ring 约定）。
// CSS var 颜色须走 style（SVG 属性不解析 var()）。
export function ScoreRing({
  value,
  max = 100,
  grades = DEFAULT_GRADES,
  size = 96,
  thickness = 8,
  label,
  showGrade = true,
  className,
}: ScoreRingProps) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const grade = resolveGrade(value, grades);
  const toneColor = resolveTone(grade.tone);

  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          className="stroke-surface-hover"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ stroke: toneColor }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <div>
          <div className="text-xl font-bold tabular-nums text-foreground">{Math.round(value)}</div>
          {showGrade && (
            <div className="mt-0.5 text-xs font-semibold" style={{ color: toneColor }}>
              {grade.label}
            </div>
          )}
          {label && <div className="mt-0.5 text-[11px] text-muted">{label}</div>}
        </div>
      </div>
    </div>
  );
}
