import type { InputHTMLAttributes, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { inputShellVariants } from "./input";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix">,
    VariantProps<typeof inputShellVariants> {
  /** 独立使用时标红；在 hulian Field 内由 Field.Root invalid 自动驱动，无需重复传。 */
  invalid?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
}
