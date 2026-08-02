export type QRCodeLevel = "L" | "M" | "Q" | "H";

export interface QRCodeLogo {
  src: string;
  /** logo 边长 px，默认约二维码的 22%。 */
  size?: number;
  /**
   * 是否在 logo 底下垫一块底色把模块抠空。`false` 则 logo 直接叠在码上
   * （半透明水印式 logo 才这么用；不抠空又不透明会盖掉模块，扫不出来）。
   * @default true
   */
  excavate?: boolean;
  /** logo 不透明度（做水印时配 excavate={false}）。@default 1 */
  opacity?: number;
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
  /**
   * 版本下限（1–40）：内容变长会自动升版本导致模块变密、观感尺寸跳变；
   * 钉住下限可让一组码密度一致。内容装不下时自动用更大的版本，不会截断。
   */
  minVersion?: number;
  /** 在**不升版本**的前提下自动提升纠错级别（有余量就白拿鲁棒性）。@default true */
  boostLevel?: boolean;
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
