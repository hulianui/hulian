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

/** value→色阶档位 [0..scale]（0 表示无/最浅）。 */
export function bucketize(value: number, max: number, scale: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.max(1, Math.min(scale, Math.ceil((value / max) * scale)));
}
