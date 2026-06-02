import type { TextareaHTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { textareaVariants } from "./textarea";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  /** 独立使用时标红；在 hulian Field 内由 Field.Root invalid 自动驱动。 */
  invalid?: boolean;
  /** 随内容自适应高度（JS scrollHeight，rows 为下限）。 */
  autoResize?: boolean;
}
