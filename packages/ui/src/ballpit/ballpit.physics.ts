// Ballpit 纯函数物理/几何模块（零 DOM 依赖，供组件与单测共用）。
//
// 治"窄容器超填充 → 重叠分离永不收敛 → 稳态剧烈抖动"的根：
// 1. fitToContainer：按容器面积推导有效半径/球数 —— 球总面积 ≤ 容器面积 × MAX_FILL，
//    超出先等比缩半径（下限 MIN_RADIUS_SCALE），仍超则减数量；单球半径另受
//    短边比例上限（MAX_RADIUS_FRACTION）约束。容器再窄也不会初始即超填充；
//    resize 时重新调用即可重约束。
// 2. stepPhysics：重叠分离只做位置校正（按重叠深度比例推开 × 松弛系数，留 slop 死区，
//    不向速度注入分离脉冲）；动量交换仅在两球趋近时发生（sequential impulse 多轮迭代，
//    恢复系数只在首轮计入），低相对速度按完全非弹性处理 —— 吃掉重力每帧灌入的微小速度，
//    堆积可真正静止；速度全程钳制上限；触底低速直接归零 + 低速强阻尼帮助 sleep。

export interface BallBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/** 球总面积 ≤ 容器面积的占用率上限 */
export const MAX_FILL = 0.42;
/** 单球半径 ≤ 容器短边的占比上限 */
export const MAX_RADIUS_FRACTION = 0.22;
/** 自适应时半径最多缩到原始的多少（再小就改为减数量，避免球小到看不清） */
export const MIN_RADIUS_SCALE = 0.55;
/** 速度模长硬上限（px/s） */
export const MAX_SPEED = 1600;
/** 低于此反弹/相对速度（px/s）按完全非弹性处理，消稳态微弹跳 */
export const REST_SPEED = 40;
/** 低于此速度（px/s）施加强阻尼，帮助堆积进入静止（仅重力场景） */
export const SLEEP_SPEED = 6;

export interface FitResult {
  count: number;
  rMin: number;
  rMax: number;
}

/**
 * 按容器尺寸约束球数与半径范围。
 * 半径均匀分布时单球期望面积 E[πr²] = π(lo² + lo·hi + hi²) / 3。
 */
export function fitToContainer(
  count: number,
  rMin: number,
  rMax: number,
  w: number,
  h: number,
): FitResult {
  const cw = Math.max(w, 1);
  const ch = Math.max(h, 1);
  const area = cw * ch;
  const rCap = Math.max(1, Math.min(cw, ch) * MAX_RADIUS_FRACTION);
  let lo = Math.max(Math.min(Math.min(rMin, rMax), rCap), 1);
  let hi = Math.max(Math.min(Math.max(rMin, rMax), rCap), lo);
  let n = Math.max(0, Math.floor(count));
  if (n === 0) return { count: 0, rMin: lo, rMax: hi };

  const avgArea = () => (Math.PI * (lo * lo + lo * hi + hi * hi)) / 3;
  const budget = area * MAX_FILL;
  if (n * avgArea() > budget) {
    // 先缩半径（√需求比，下限 MIN_RADIUS_SCALE）……
    const scale = Math.max(
      Math.sqrt(budget / (n * avgArea())),
      MIN_RADIUS_SCALE,
    );
    lo = Math.max(lo * scale, 1);
    hi = Math.max(hi * scale, lo);
    // ……仍超则减数量（至少留 1 颗：单球不存在互撞抖动）
    n = Math.min(n, Math.max(1, Math.floor(budget / avgArea())));
  }
  return { count: n, rMin: lo, rMax: hi };
}

export interface StepOptions {
  /** 帧时间（秒），调用方应已钳制（≤ ~0.033） */
  dt: number;
  w: number;
  h: number;
  /** 重力（px/s²） */
  gravity: number;
  /** 弹性 0–1 */
  bounce: number;
  /** 光标排斥球（无则 null/undefined） */
  pointer?: { x: number; y: number; r: number; strength: number } | null;
}

/** 推进一帧物理（原地修改 balls） */
export function stepPhysics(balls: BallBody[], opts: StepOptions): void {
  const { dt, w, h, gravity, bounce, pointer } = opts;
  if (!(dt > 0) || balls.length === 0) return;
  const e = Math.min(Math.max(bounce, 0), 1);

  // 积分：重力 + 光标排斥 + 速度上限 + 墙壁回弹
  for (const b of balls) {
    b.vy += gravity * dt;
    if (pointer) {
      const dx = b.x - pointer.x;
      const dy = b.y - pointer.y;
      const d2 = dx * dx + dy * dy;
      const reach = pointer.r + b.r;
      if (d2 < reach * reach && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const push = ((reach - d) / reach) * pointer.strength;
        b.vx += (dx / d) * push * dt;
        b.vy += (dy / d) * push * dt;
      }
    }
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > MAX_SPEED) {
      const k = MAX_SPEED / sp;
      b.vx *= k;
      b.vy *= k;
    }
    b.vx *= 0.999;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // 墙壁：回弹方向恒取"指向容器内"，位置校正挤出时不会被反向再翻转
    if (b.x - b.r < 0) {
      b.x = b.r;
      b.vx = Math.abs(b.vx) * e;
    } else if (b.x + b.r > w) {
      b.x = w - b.r;
      b.vx = -Math.abs(b.vx) * e;
    }
    if (b.y - b.r < 0) {
      b.y = b.r;
      b.vy = Math.abs(b.vy) * e;
    } else if (b.y + b.r > h) {
      b.y = h - b.r;
      let up = Math.abs(b.vy) * e;
      if (up < REST_SPEED) up = 0; // 触底低速 → 静置，消每帧重力灌入的微弹跳
      b.vy = -up;
      b.vx *= 0.98; // 地面摩擦
    }
  }

  // 球球碰撞：位置校正（松弛迭代）+ 趋近时交换动量（首轮带恢复系数，后续纯非弹性）
  const ITERATIONS = 4;
  const SLOP = 0.5; // 允许的微小重叠死区（px），消校正来回抖
  const RELAX = 0.35; // 每轮只消除部分重叠，避免猛推过冲
  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let i = 0; i < balls.length; i++) {
      const a = balls[i]!;
      for (let j = i + 1; j < balls.length; j++) {
        const c = balls[j]!;
        const dx = c.x - a.x;
        const dy = c.y - a.y;
        const dist = Math.hypot(dx, dy);
        const min = a.r + c.r;
        if (dist >= min) continue;
        const nx = dist > 1e-6 ? dx / dist : 1;
        const ny = dist > 1e-6 ? dy / dist : 0;

        // 位置校正：只动位置，不注入速度
        const corr = (Math.max(min - dist - SLOP, 0) * RELAX) / 2;
        a.x -= nx * corr;
        a.y -= ny * corr;
        c.x += nx * corr;
        c.y += ny * corr;

        // 动量交换：仅趋近时；低相对速度完全非弹性（堆积可收敛）
        const sep = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
        if (sep < 0) {
          const rest = iter === 0 && -sep > REST_SPEED ? e : 0;
          const imp = (-(1 + rest) * sep) / 2; // 等质量
          a.vx -= nx * imp;
          a.vy -= ny * imp;
          c.vx += nx * imp;
          c.vy += ny * imp;
        }
      }
    }
    // 接触收尾：贴地球被上方球压出的低速下沉直接归零，
    // 让"地面吸收"在同一帧内沿堆叠链向上传导（否则堆顶速度逐帧累积不收敛）
    for (const b of balls) {
      if (b.y + b.r >= h - SLOP && b.vy > 0 && b.vy < REST_SPEED) b.vy = 0;
    }
  }

  // 低速阻尼（仅重力堆积场景；失重漂浮保持巡游不被冻住）：
  // < REST_SPEED 温和衰减（视觉上近静止的余动渐熄），< SLEEP_SPEED 强阻尼直接入睡
  if (gravity > 0) {
    for (const b of balls) {
      const sp = Math.hypot(b.vx, b.vy);
      if (sp < SLEEP_SPEED) {
        b.vx *= 0.8;
        b.vy *= 0.8;
      } else if (sp < REST_SPEED) {
        b.vx *= 0.97;
        b.vy *= 0.97;
      }
    }
  }

  // 位置校正可能把球挤出墙外 → 收尾 clamp（只动位置）
  for (const b of balls) {
    if (b.x - b.r < 0) b.x = b.r;
    else if (b.x + b.r > w) b.x = w - b.r;
    if (b.y - b.r < 0) b.y = b.r;
    else if (b.y + b.r > h) b.y = h - b.r;
  }
}
