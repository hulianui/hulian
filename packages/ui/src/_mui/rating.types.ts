export interface RatingProps {
  value?: number;
  defaultValue?: number;
  /** 瑚琏命名受控回调（替代 MUI onChange(e,v)） */
  onValueChange?: (value: number | null) => void;
  max?: number;
  readOnly?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}
