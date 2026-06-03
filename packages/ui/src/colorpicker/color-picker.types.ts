export type ColorFormat = "hex" | "rgb" | "hsl";

export interface ColorPickerProps {
  /** 受控颜色值。接受 hex / rgb() / hsl() 字符串，内部统一规范为 hex 作为单一真源。 */
  value?: string;
  /** 非受控初始值，默认 "#3b82f6"。 */
  defaultValue?: string;
  /** 颜色变更回调，参数为**当前所选格式**的字符串（format=hex→"#xxxxxx"，rgb→"rgb(...)"，hsl→"hsl(...)"）。切换格式也会触发。 */
  onValueChange?: (value: string) => void;
  /** 受控的输出/展示格式。传入即进入格式受控模式。 */
  format?: ColorFormat;
  /** 非受控初始格式，默认 "hex"。 */
  defaultFormat?: ColorFormat;
  /** 格式切换回调。 */
  onFormatChange?: (format: ColorFormat) => void;
  /** 禁用：罩层 + 屏蔽交互。 */
  disabled?: boolean;
  /** 是否显示文本输入（默认 true）。 */
  showInput?: boolean;
  /** 是否显示 HEX/RGB/HSL 格式切换器（默认 true）。 */
  showFormatSwitcher?: boolean;
  className?: string;
}
