export interface ParticlesProps {
  /** 额外 className，透传到容器 div */
  className?: string;
  /** 粒子数量，默认 100 */
  quantity?: number;
  /**
   * 静止系数（越大越不跟鼠标），默认 50。
   * 原理：位移增量 = mouseOffset / (staticity / magnetism)，值越大分母越大故位移越小。
   */
  staticity?: number;
  /**
   * 缓动系数（越大越迟钝），默认 50。
   * 原理：translateX += (target - current) / ease，值越大每帧跟随比例越小。
   */
  ease?: number;
  /** 粒子基础半径（px），默认 0.4，最终会在 [size, size+2] 随机 */
  size?: number;
  /**
   * 粒子颜色。不传时从挂载节点读 CSS 变量 `--color-foreground`（瑚琏 token），
   * 并监听 MutationObserver（data-theme 切换）自动更新，实现明暗主题跟随。
   * 传入时接受 `#rrggbb`、`#rgb`、`rgb(r,g,b)` 格式。
   */
  color?: string;
  /** X 轴常量漂移速度（px/帧），默认 0 */
  vx?: number;
  /** Y 轴常量漂移速度（px/帧），默认 0 */
  vy?: number;
  /**
   * 刷新信号——值变化时强制重绘粒子（等价于 MagicUI refresh prop）。
   * 可传任意可比较值（boolean / number / string）。
   */
  refresh?: boolean | number | string;
}
