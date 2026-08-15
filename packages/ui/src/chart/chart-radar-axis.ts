// 雷达图的逐轴归一（#277）—— 纯函数（零 React、零 recharts，可独立单测）。
//
// 为什么需要：recharts 的 RadarChart 只有一根半径轴，所有角轴共用一套刻度。销售额（十万级）
// 和退货率（0–100）放同一张图时，量纲大的那根会把其余全压成靠近圆心的一个点，
// 而雷达图读的就是形状对比 —— 图还在，信息没了。echarts 的 radar.indicator 每根轴各配一个
// max，正是为此。这里在喂给 recharts 之前把每行按该维度的满量程折算成 0–100。
//
// 原始值随行带走（RADAR_RAW），tooltip 显示它而不是归一值 —— 这正是消费方自己在业务侧
// 预处理时丢掉的那半截（运营看到 63.2 得自己换算回 31.6 万）。

/** 归一后每行挂原始值的键。以 `__hl` 起头，避免和消费方的数据字段撞名。 */
export const RADAR_RAW = "__hlRadarRaw";

export interface NormalizeRadarOptions {
  /** 原始数据行。 */
  data: ReadonlyArray<Record<string, unknown>>;
  /** 角轴字段名（每行在该字段上的值就是这根轴的名字）。 */
  xKey: string;
  /** 参与归一的序列 key。 */
  seriesKeys: ReadonlyArray<string>;
  /** 逐轴满量程，键是角轴名。 */
  axisMax: Record<string, number>;
}

export interface NormalizeRadarResult {
  /** 归一后的数据行，可直接喂给 recharts。 */
  data: Array<Record<string, unknown>>;
  /** `axisMax` 里没给出满量程、退回「本行最大值」的角轴名（供开发期告警）。 */
  missingAxes: string[];
}

/** 一行里参与归一的最大值；全非数字或全 ≤0 时返回 0（调用方据此跳过该行）。 */
function rowMax(row: Record<string, unknown>, seriesKeys: ReadonlyArray<string>): number {
  let max = 0;
  for (const key of seriesKeys) {
    const v = row[key];
    if (typeof v === "number" && Number.isFinite(v) && v > max) max = v;
  }
  return max;
}

/**
 * 把每行按该角轴的满量程折算到 0–100，并把原始值挂到 `RADAR_RAW` 上。
 *
 * 非数字的单元格原样保留（不参与归一也不报错）：雷达图的数据行里混一个字符串备注是常见写法。
 * 满量程 ≤ 0 或非有限数视同没给。
 */
export function normalizeRadarData({
  data,
  xKey,
  seriesKeys,
  axisMax,
}: NormalizeRadarOptions): NormalizeRadarResult {
  const missingAxes: string[] = [];
  const out = data.map((row) => {
    const axisName = String(row[xKey] ?? "");
    const configured = axisMax[axisName];
    const hasConfigured = typeof configured === "number" && Number.isFinite(configured) && configured > 0;
    // 缺配置时退回「本行最大值」而不是「不归一」：混着归一和不归一的图比全不归一更难读，
    // 而且错得不显眼 —— 那根轴会莫名其妙地贴着圆心或顶满外环。
    if (!hasConfigured && !missingAxes.includes(axisName)) missingAxes.push(axisName);
    const max = hasConfigured ? configured : rowMax(row, seriesKeys);
    const raw: Record<string, number> = {};
    const next: Record<string, unknown> = { ...row };
    for (const key of seriesKeys) {
      const v = row[key];
      if (typeof v !== "number" || !Number.isFinite(v)) continue;
      raw[key] = v;
      next[key] = max > 0 ? (v / max) * 100 : 0;
    }
    next[RADAR_RAW] = raw;
    return next;
  });
  return { data: out, missingAxes };
}
