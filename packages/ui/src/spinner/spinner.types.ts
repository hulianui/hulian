export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  tone?: "primary" | "current" | "muted";
  /** a11y 文案，默认「加载中」。 */
  label?: string;
  className?: string;
}
