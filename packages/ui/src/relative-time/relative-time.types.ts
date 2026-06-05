export type RelativeTimeLocale = "zh" | "en";

export interface RelativeTimeProps {
  /** 目标时间：Date / ISO 字符串 / 毫秒时间戳。 */
  value: Date | string | number;
  /**
   * 参照的「现在」。传入则固定不走实时 tick（SSR 确定性 / 测试 / 列表统一基准）；
   * 省略则取实时 new Date() 并按 updateInterval 自动刷新。
   */
  base?: Date | string | number;
  /** 自动刷新间隔(ms)。@default 60000（每分钟）。设 0 关闭刷新。 */
  updateInterval?: number;
  /** @default "zh" */
  locale?: RelativeTimeLocale;
  /** 鼠标悬停 title 显示绝对时间。@default true */
  withTitle?: boolean;
  className?: string;
}
