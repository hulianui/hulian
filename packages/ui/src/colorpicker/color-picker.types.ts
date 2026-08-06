export type ColorFormat = "hex" | "rgb" | "hsl";

export interface ColorPickerProps {
  /** 受控颜色值。接受 hex / rgb() / hsl() 字符串，内部统一规范为 hex 作为单一真源。 */
  value?: string;
  /** 非受控初始值，默认 "#3b82f6"。 */
  defaultValue?: string;
  /**
   * 颜色变更回调，参数为**当前所选格式**的字符串（format=hex→"#xxxxxx"，rgb→"rgb(...)"，hsl→"hsl(...)"）。切换格式也会触发。
   *
   * **高频**：拖动取色面板 / 色相条时**每帧**触发，一次拖动可达几十上百次。
   * 只关心「这次编辑结束后的值」（写 undo 栈、发请求、触发重排）请改用 `onValueCommitted`。
   */
  onValueChange?: (value: string) => void;
  /**
   * 值提交回调：**一次确定的编辑结束**时触发一次，参数格式与 `onValueChange` 完全一致。
   *
   * 触发时机（每次只触发一次）：
   * - 取色面板 / 色相条拖动结束（`pointerup`）
   * - 文本输入框失焦（blur）或按下回车
   * - 切换输出格式（HEX/RGB/HSL，输出串变了算一次确定的值变更）
   *
   * 不触发：`pointercancel`——被系统或其它手势打断的拖动不算一次确定的提交，
   * 此时消费方应保留上一次 committed 的值。
   *
   * 语义是「一次编辑结束」而不是「值变了」：在色板上点一下没拖动、颜色其实没变，
   * 松手时**仍会**触发一次。要去重请自己比对上一次收到的值。
   */
  onValueCommitted?: (value: string) => void;
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
