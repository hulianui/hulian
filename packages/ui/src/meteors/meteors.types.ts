export interface MeteorsProps {
  /** 流星数量，默认 20 */
  number?: number;
  /** 最小延迟秒，默认 0.2 */
  minDelay?: number;
  /** 最大延迟秒，默认 1.2 */
  maxDelay?: number;
  /** 最短时长秒，默认 2 */
  minDuration?: number;
  /** 最长时长秒，默认 10 */
  maxDuration?: number;
  /** 下落角度（度），默认 215 */
  angle?: number;
  /** 透传到每颗流星 span 的额外类 */
  className?: string;
}
