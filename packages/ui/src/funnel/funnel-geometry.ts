import type { FunnelStage } from "./funnel.types";

export interface FunnelDatum<S extends FunnelStage = FunnelStage> {
  /** 原始阶段数据（透传全部字段，含 tone / 自定义字段）。 */
  stage: S;
  /** 宽度（vertical）/ 高度（horizontal）比例 = value / max；max=0 时为 0（不除零）。 */
  widthRatio: number;
  /** 级间转化率 = value[i] / value[i-1]；首级或上一级为 0 时为 null。 */
  conversion: number | null;
}

/**
 * 漏斗几何纯函数：把阶段列表算成每级的宽度比 + 级间转化率。
 *
 * - widthRatio = value / max（max 为所有 value 的最大值；max=0 时全部 0，不除零）。
 * - 首级 conversion = null（无上一级）。
 * - 级间 conversion = value[i] / value[i-1]；上一级为 0 时 null（不除零）。
 */
export function computeFunnel<S extends FunnelStage>(stages: S[]): FunnelDatum<S>[] {
  const max = stages.reduce((m, s) => (s.value > m ? s.value : m), 0);
  return stages.map((stage, i) => {
    const widthRatio = max === 0 ? 0 : stage.value / max;
    let conversion: number | null = null;
    if (i > 0) {
      const prev = stages[i - 1].value;
      conversion = prev === 0 ? null : stage.value / prev;
    }
    return { stage, widthRatio, conversion };
  });
}
