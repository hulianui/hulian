// 桂冠几何 —— 把「一圈月桂叶」算成一组椭圆变换，供 AwardBadge 的 SVG 徽记渲染。
//
// 为什么算而不是贴一张手绘 path：叶片数量 / 弧度开口 / 叶形长宽 / 倾角都要能随尺寸与
// 消费方口味调，硬编码 path 一改就得重画。抽成纯函数后既可单测，也能被外部复用画自己的花环。
//
// 坐标系：SVG 默认 y 轴向下。角度 θ 从正 x 轴起算，顺时针为正 ——
//   θ=0° 正右、θ=90° 正下、θ=180° 正左、θ=270° 正上。
// 左枝默认从 104°（底部略偏左）扫到 244°（左上），底部与右枝几乎相接、顶部留出开口。
// 右枝不另算：渲染时对左枝整体做 translate(2·cx) scale(-1,1) 镜像。

export interface LaurelOptions {
  /** 单枝叶片数。@default 7 */
  count: number;
  /** 花环圆心。@default 50 / 52 */
  cx: number;
  cy: number;
  /** 枝干（叶片附着的那条弧）半径。@default 30 */
  radius: number;
  /** 起止角度（度）。@default 104 / 244 */
  from: number;
  to: number;
  /** 根部叶片的长半轴 / 短半轴。@default 8.4 / 3.6 */
  rx: number;
  ry: number;
  /** 叶片相对「径向朝外」再向枝梢倾斜的角度。@default 34 */
  tilt: number;
  /** 从根到梢的收缩比例（0 = 不收缩，1 = 收到 0）。@default 0.42 */
  taper: number;
}

export interface LaurelLeaf {
  /** 叶片中心（椭圆 cx/cy）。 */
  x: number;
  y: number;
  /** 椭圆绕自身中心的旋转角（度）。 */
  rotate: number;
  rx: number;
  ry: number;
}

export const laurelDefaults: LaurelOptions = {
  count: 7,
  cx: 50,
  cy: 52,
  radius: 30,
  from: 104,
  to: 244,
  rx: 8.4,
  ry: 3.6,
  tilt: 34,
  taper: 0.42,
};

const toRad = (deg: number) => (deg * Math.PI) / 180;
const round = (n: number) => Math.round(n * 100) / 100;

/** 算出单枝（左枝）的叶片列表：沿弧等角分布，向枝梢逐片收缩。 */
export function laurelLeaves(options: Partial<LaurelOptions> = {}): LaurelLeaf[] {
  const o = { ...laurelDefaults, ...options };
  const count = Math.max(0, Math.floor(o.count));
  const leaves: LaurelLeaf[] = [];

  for (let i = 0; i < count; i++) {
    // 单片时不做插值，直接落在起始角，避免 0/0。
    const t = count === 1 ? 0 : i / (count - 1);
    const angle = o.from + (o.to - o.from) * t;
    const shrink = 1 - o.taper * t;
    const rx = o.rx * shrink;
    const ry = o.ry * shrink;
    // 叶片中心落在枝干外侧半个叶长处，看起来像「长在枝上朝外张」而非压在枝干上。
    const r = o.radius + rx * 0.5;
    leaves.push({
      x: round(o.cx + r * Math.cos(toRad(angle))),
      y: round(o.cy + r * Math.sin(toRad(angle))),
      // 径向朝外是 angle，再向枝梢（切向 angle+90）倾 tilt。
      rotate: round(angle + o.tilt),
      rx: round(rx),
      ry: round(ry),
    });
  }
  return leaves;
}

/** 枝干弧的 path d。sweep=1：SVG 里 y 轴向下，角度递增即顺时针。 */
export function laurelStemPath(options: Partial<LaurelOptions> = {}): string {
  const o = { ...laurelDefaults, ...options };
  const x1 = round(o.cx + o.radius * Math.cos(toRad(o.from)));
  const y1 = round(o.cy + o.radius * Math.sin(toRad(o.from)));
  const x2 = round(o.cx + o.radius * Math.cos(toRad(o.to)));
  const y2 = round(o.cy + o.radius * Math.sin(toRad(o.to)));
  const largeArc = Math.abs(o.to - o.from) > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${o.radius} ${o.radius} 0 ${largeArc} 1 ${x2} ${y2}`;
}
