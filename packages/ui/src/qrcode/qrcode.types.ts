export type QRCodeLevel = "L" | "M" | "Q" | "H";

export interface QRCodeLogo {
  src: string;
  /** logo 边长 px，默认约二维码的 22%。 */
  size?: number;
}

export interface QRCodeProps {
  /** 编码内容（URL/文本，UTF-8）。 */
  value: string;
  /** 边长 px，默认 160。 */
  size?: number;
  /** 纠错级别，默认 M（带 logo 建议 H）。 */
  level?: QRCodeLevel;
  /** 静默区模块数，默认 2。 */
  margin?: number;
  /** 暗块颜色，默认继承 currentColor（吃 text-foreground）。 */
  color?: string;
  /** 背景色，默认透明。 */
  background?: string;
  /** 中心 logo（务必配 level="H" 留足纠错冗余）。 */
  logo?: QRCodeLogo;
  /** 无障碍标签，默认取 value。 */
  "aria-label"?: string;
  className?: string;
}
