export interface HeatCell<X = string | number, Y = string | number> {
  x: X;
  y: Y;
  value: number;
}

/** 推导/规整行列标签 + 构建 (y,x)->value 查找。 */
export function buildMatrix(
  data: HeatCell[],
  xLabels?: (string | number)[],
  yLabels?: (string | number)[],
) {
  const xs = xLabels ?? [...new Set(data.map((d) => d.x))];
  const ys = yLabels ?? [...new Set(data.map((d) => d.y))];
  const map = new Map<string, number>();
  for (const d of data) map.set(`${d.y}|${d.x}`, d.value);
  return {
    xs,
    ys,
    get: (y: string | number, x: string | number) => map.get(`${y}|${x}`) ?? 0,
  };
}

/**
 * value→色阶档位 [0..scale]（0 表示无/≤值域下限）。
 * min 是值域下限（默认 0，行为与旧签名完全一致）；传入后按 (value-min)/(max-min)
 * 的值域比例分档——小数/比率数据（如掌握率 0.55~0.88 配 domain [0.5, 0.9]）也能均匀铺满色阶。
 */
export function bucketize(value: number, max: number, scale: number, min = 0): number {
  if (max <= min || value <= min) return 0;
  const ratio = (value - min) / (max - min);
  return Math.max(1, Math.min(scale, Math.ceil(ratio * scale)));
}
