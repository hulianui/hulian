import type { TextareaHTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { textareaVariants } from "./textarea";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size" | "value">,
    VariantProps<typeof textareaVariants> {
  /**
   * 受控值。除原生类型外还收 `null`，按空串渲染（#220，同 [Input](../input/input.md)）。
   *
   * `useForm` 的 `register().value` 把「显式清空」的 `null` 原样给出来，而原生
   * `<textarea value={null}>` 会被 React 判成非受控并打告警——所以由本组件收口。
   * `undefined` 仍是「非受控」，不受影响。
   */
  value?: TextareaHTMLAttributes<HTMLTextAreaElement>["value"] | null;
  /** 独立使用时标红；在 hulian Field 内由 Field.Root invalid 自动驱动。 */
  invalid?: boolean;
  /** 随内容自适应高度（JS scrollHeight，rows 为下限）。 */
  autoResize?: boolean;
}
