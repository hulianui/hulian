// 一次性烘焙脚本（作者本地跑，**不进运行时依赖**）。
// 作用：用 dotted-map（默认 mercator/WGS84 椭球 + grid:diagonal）生成全球点阵，
// 抽出每个点的 (localx, localy) 写进 world-map.dots.ts，并烘出投影所需的
// X_MIN / X_RANGE / Y_MAX / Y_RANGE / WIDTH / HEIGHT 常量。
// 运行时组件据此用纯数学复刻同款椭球 mercator → arc 端点与点阵精确对齐，零依赖。
//
// 复现方式（在装有 dotted-map 的临时目录）：
//   node world-map.bake.mjs > world-map.dots.ts
//
// 选 height=35：diagonal 网格出 ~1049 点，DOM 量级可控、大陆轮廓清晰。

import DottedMap from "dotted-map";
import proj4 from "proj4";

const HEIGHT_INPUT = 35;
const m = new DottedMap({ height: HEIGHT_INPUT, grid: "diagonal" });

// dotted-map 实例上的投影参数（见其源码 getMap）
const { X_MIN, Y_MAX, X_RANGE, Y_RANGE, width, height } = m;

// 点阵：getPoints() 给 { x, y } —— 即 SVG 坐标空间的 (localx, localy)
const dots = m
  .getPoints()
  .map((p) => [Math.round(p.x * 100) / 100, Math.round(p.y * 1000) / 1000]);

// ── 自检：纯数学椭球 mercator vs proj4，必须一致（否则 arc 会偏离点阵）──
const A = 6378137;
const E = 0.08181919084262149; // WGS84 第一偏心率
function mercForward(lng, lat) {
  const d = Math.PI / 180;
  const lr = lat * d;
  const x = A * (lng * d);
  const es = E * Math.sin(lr);
  const y = A * Math.log(Math.tan(Math.PI / 4 + lr / 2) * Math.pow((1 - es) / (1 + es), E / 2));
  return [x, y];
}
const proj = proj4("+proj=merc +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m");
let maxErr = 0;
for (const [lat, lng] of [[0, 0], [39.9, 116.4], [40.7, -74], [-33.9, 151.2], [51.5, -0.1], [-23.5, -46.6], [71, 168], [-56, -168]]) {
  const [px, py] = proj.forward([lng, lat]);
  const [mx, my] = mercForward(lng, lat);
  maxErr = Math.max(maxErr, Math.abs(px - mx), Math.abs(py - my));
}
if (maxErr > 1) {
  // 单位是米；>1m 误差视为复刻不一致，停手报错（绝不静默产出偏移数据）
  console.error(`[bake] 椭球 mercator 复刻与 proj4 不一致, maxErr=${maxErr}m`);
  process.exit(1);
}
console.error(`[bake] 投影自检通过 maxErr=${maxErr.toExponential(2)}m · dots=${dots.length} · ${width}x${height}`);

// ── 输出 world-map.dots.ts ──
const out = `// 由 world-map.bake.mjs 一次性生成 —— 请勿手改。
// dotted-map(height:${HEIGHT_INPUT}, grid:diagonal, mercator/WGS84) 烘出的全球点阵 + 投影常量。
// arc 端点用 projectPoint() 复刻同款椭球 mercator，与点阵共享同一坐标空间(精确对齐)。

/** 点阵坐标 [localx, localy]，落在 viewBox 0 0 ${width} ${height} 内。 */
export const WORLD_DOTS: ReadonlyArray<readonly [number, number]> = ${JSON.stringify(dots)};

/** 点阵 / arc 共享的 viewBox 尺寸。 */
export const VIEWBOX = { w: ${width}, h: ${height} } as const;

// 投影常量（烘焙期由 dotted-map 实例读出）
const X_MIN = ${X_MIN};
const X_RANGE = ${X_RANGE};
const Y_MAX = ${Y_MAX};
const Y_RANGE = ${Y_RANGE};
const A = 6378137;
const E = 0.08181919084262149; // WGS84 第一偏心率

/** 经纬度 → viewBox 坐标（椭球 mercator，与点阵同款投影）。 */
export function projectPoint(lat: number, lng: number): { x: number; y: number } {
  const d = Math.PI / 180;
  const lr = lat * d;
  const px = A * (lng * d);
  const es = E * Math.sin(lr);
  const py = A * Math.log(Math.tan(Math.PI / 4 + lr / 2) * Math.pow((1 - es) / (1 + es), E / 2));
  return {
    x: (VIEWBOX.w * (px - X_MIN)) / X_RANGE,
    y: (VIEWBOX.h * (Y_MAX - py)) / Y_RANGE,
  };
}
`;
process.stdout.write(out);
