// 设备外框与预览视口的**唯一真源**。
//
// 起因（#139）：「有哪些设备、每种设备多大」此前存在两份互不相干的清单 ——
//   · mockups 分类的四个外框件各自写死 aspectRatio + 边框宽度（有 watch）；
//   · PreviewSandbox 自己一份 device → 视口尺寸表（有 desktop，没有 watch）。
// 两份内容不一致，加机型要改两处，而且没有任何东西保证它们会被同步改。
//
// 更要命的是接缝处那个谁都没定义的量：**内屏尺寸**。外框件定义的是「机身」比例，
// PreviewSandbox 定义的是「视口」尺寸，而内屏 = 机身 − 边框。三者对不上时 fit 缩放
// 两轴不等，短边留白，就是 #117 那圈白边（tablet 偏差最大：机身 0.714 vs 视口 0.750）。
//
// 解法：只声明**内屏逻辑分辨率 + 边框宽度**这两个物理量，机身尺寸一律由它们推导。
// 这样「内屏比例 == 视口比例」就不是需要维护的巧合，而是算出来的恒等式。

export interface DeviceMetrics {
  /**
   * 内屏逻辑分辨率（CSS px），同时也是 PreviewSandbox 的视口尺寸。
   * 取逻辑分辨率而非物理像素：预览内的媒体查询按逻辑像素匹配。
   */
  screen: { width: number; height: number };
  /** 机身边框宽度（四边等宽，px）。必须与组件里的 `border-[Npx]` 一致，单测会盯住这条。 */
  border: number;
  /** 不传 width / model 时的默认机身宽度（含边框，px）。 */
  defaultWidth: number;
}

export const DEVICE_METRICS = {
  iphone: { screen: { width: 390, height: 844 }, border: 10, defaultWidth: 280 },
  android: { screen: { width: 412, height: 915 }, border: 8, defaultWidth: 280 },
  tablet: { screen: { width: 834, height: 1112 }, border: 14, defaultWidth: 320 },
  watch: { screen: { width: 396, height: 484 }, border: 6, defaultWidth: 184 },
} as const satisfies Record<string, DeviceMetrics>;

export type DeviceKind = keyof typeof DEVICE_METRICS;

export const DEVICE_KINDS = Object.keys(DEVICE_METRICS) as DeviceKind[];

/**
 * 由机身宽度反推机身高度，使内屏比例严格等于 `screen` 的比例。
 *
 * 为什么不用 `aspectRatio`：边框是**固定 px**而内屏随宽度缩放，所以机身比例并不是常数
 * ——同一台设备画成 280px 宽和 360px 宽，机身比例不一样。写死一个 aspectRatio 就必然
 * 在某些宽度下让内屏比例偏掉，这正是白边的来源。直接给高度才是恒等的。
 *
 * 机身宽度小于两条边框时内屏会退化为 0，此处夹到 0 而不是让它变负数。
 */
export function bodyHeightPx(metrics: DeviceMetrics, bodyWidth: number): number {
  const { screen, border } = metrics;
  const innerWidth = Math.max(0, bodyWidth - border * 2);
  return innerWidth * (screen.height / screen.width) + border * 2;
}

/** 内屏尺寸（px）——给需要按真实内屏排版的消费方用，同样由机身宽度推导。 */
export function innerScreenPx(
  metrics: DeviceMetrics,
  bodyWidth: number,
): { width: number; height: number } {
  const innerWidth = Math.max(0, bodyWidth - metrics.border * 2);
  return { width: innerWidth, height: innerWidth * (metrics.screen.height / metrics.screen.width) };
}
