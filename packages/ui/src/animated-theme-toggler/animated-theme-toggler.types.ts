import type { Theme } from "../theme/use-theme";

export interface AnimatedThemeTogglerProps {
  /**
   * 受控主题（#284）。传了即受控：按钮显示什么、切到哪，都由这里决定，忽略 ThemeProvider / 自持态的值；
   * 点击只回调 `onThemeChange`，不再调 `useTheme().toggle`。消费方自持主题 SSoT（例如 ThemeProvider
   * 挂着 `forcedTheme`、真值在自己的接口 / 存储里）时用这一档。不传维持原行为。
   */
  theme?: Theme;
  /** 主题即将切换时回调下一个值。受控与非受控都会触发；受控时它是唯一的落值出口。 */
  onThemeChange?: (next: Theme) => void;
  /** 圆形揭示动画时长(ms)。 */
  duration?: number;
  className?: string;
  "aria-label"?: string;
}
