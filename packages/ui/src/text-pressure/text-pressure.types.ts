export interface TextPressureProps {
  /** 要渲染的文字（逐字符响应鼠标"压力"形变）。默认 "Compressa"。 */
  text?: string;
  /**
   * 字体族。默认用系统无衬线栈——此时 wdth 轴大概率无效，瑚琏化版本会自动
   * 以 transform:scaleX + font-weight + opacity 模拟"压感"，无需远程可变字体。
   * 若传入真正的可变字体（含 wght/wdth/ital 轴），则同时驱动 font-variation-settings。
   */
  fontFamily?: string;
  /**
   * 自定义 @font-face 的字体 URL。瑚琏化默认 undefined（不注入远程字体，遵守
   * "禁远程资源"门禁）。仅当显式传入本地/自托管字体地址时才注入 @font-face。
   */
  fontUrl?: string;
  /** 是否驱动 wdth（宽度）轴 + scaleX 模拟横向挤压。默认 true。 */
  width?: boolean;
  /** 是否驱动 wght（字重）轴 / font-weight 随接近度变粗。默认 true。 */
  weight?: boolean;
  /** 是否驱动 ital（倾斜）轴（仅可变字体生效）。默认 true。 */
  italic?: boolean;
  /** 是否驱动 opacity（接近时更不透明）。默认 false。 */
  alpha?: boolean;
  /** 是否用 flex space-between 横向铺满字符。默认 true。 */
  flex?: boolean;
  /** 是否描边（字心透明 + token 描边色，制造空心轮廓）。默认 false。 */
  stroke?: boolean;
  /** 是否纵向拉伸字块填满容器高度。默认 false。 */
  scale?: boolean;
  /**
   * 文字颜色。瑚琏化默认用 token var(--color-foreground)（明暗自适配），
   * 替原始写死 #FFFFFF。可传任意 CSS 颜色。
   */
  textColor?: string;
  /**
   * 描边颜色（stroke=true 时生效）。默认 token var(--color-primary)，替原始 #FF0000。
   */
  strokeColor?: string;
  /** 最小字号（px）。容器较窄时字号下限。默认 24。 */
  minFontSize?: number;
  /** 透传到根 div 的 className（cn 合并）。 */
  className?: string;
}
