import type { ReactNode } from "react";

export interface DarkVeilProps {
  /**
   * 色相偏移（角度，0–360），默认 0。
   * 对 CPPN 生成的暗色帷幕做 YIQ 色相旋转，调出冷蓝 / 暖紫 / 青绿等不同基调。
   * 直接映射到 GLSL uniform uHueShift。
   */
  hueShift?: number;

  /**
   * 颗粒噪声强度，默认 0。
   * 叠加随时间抖动的随机噪点，制造 CRT / 胶片颗粒质感；0 = 干净无颗粒。
   * 建议范围 0–0.1，过大画面发雪花。
   */
  noiseIntensity?: number;

  /**
   * 扫描线强度，默认 0。
   * 沿纵向叠加明暗扫描带（复古显示器观感）；0 = 无扫描线。
   * 建议范围 0–0.5，需配合 scanlineFrequency 调出条纹密度。
   */
  scanlineIntensity?: number;

  /**
   * 动画速度因子，越大帷幕流动越快，默认 0.5。
   * 直接缩放 uTime；0 = 静止（仍渲染一帧静态画面）。
   */
  speed?: number;

  /**
   * 扫描线频率，默认 0。
   * 控制扫描带的疏密，越大条纹越细密；需 scanlineIntensity > 0 才可见。
   */
  scanlineFrequency?: number;

  /**
   * 空间扭曲量，默认 0。
   * 对 UV 施加正余弦扰动，让帷幕产生波动 / 折射感；建议范围 0–0.2。
   */
  warpAmount?: number;

  /**
   * 渲染分辨率缩放，默认 1。
   * <1 降采样换性能（如 0.5 = 半分辨率），>1 超采样换清晰度（吃性能）。
   */
  resolutionScale?: number;

  /**
   * 额外 className，透传到根容器（或 reduced-motion fallback div）。
   * 组件自带 `absolute inset-0 z-0`，可叠加透明度 / 混合模式。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的暗色径向渐变装饰 div（贴近帷幕基调）。
   */
  fallback?: ReactNode;
}
