// 矩形树图格内文字的取舍 —— 纯函数（零 React、零 recharts，可独立单测）。
//
// 树图的格子大小由数据决定，长尾那一批必然小到放不下任何字。放不下还硬画，得到的是
// 一片互相压叠的碎字（echarts 的默认行为也是按尺寸决定 label 显隐）。这里把「这一格能放
// 几行字」的判断抽出来，因为它是这个组件唯一有分支的逻辑，而在 jsdom 里量不到真实尺寸。

/** 与 chart-theme 的轴文字同源：CJK 全角 ≈ fontSize，半角 ≈ 0.62×fontSize。 */
export function textWidth(text: string, fontSize: number): number {
  let w = 0;
  for (const ch of text) {
    w += (ch.codePointAt(0) ?? 0) > 0xff ? fontSize : fontSize * 0.62;
  }
  return w;
}

export interface TreemapLabelFit {
  /** 名字放不放得下。 */
  name: boolean;
  /** 数值那一行放不放得下（要求 `showValue` 且名字已放下）。 */
  value: boolean;
}

export interface TreemapLabelFitOptions {
  width: number;
  height: number;
  name: string;
  nameFontSize: number;
  valueFontSize: number;
  showValue: boolean;
}

/** 格内四周留白：文字贴着格子边缘会和相邻格连成一片，读不出边界。 */
export const TREEMAP_LABEL_PAD = 6;

/**
 * 这一格放得下哪几行字。
 *
 * 判据是「减去内边距之后还剩多少」，宽高都要过 —— 只看宽会让又扁又长的格子把两行字
 * 画到格子外面去（SVG 的 text 不会被 rect 裁掉，溢出是直接盖在邻格上）。
 */
export function treemapLabelFit({
  width,
  height,
  name,
  nameFontSize,
  valueFontSize,
  showValue,
}: TreemapLabelFitOptions): TreemapLabelFit {
  const innerW = width - TREEMAP_LABEL_PAD * 2;
  const innerH = height - TREEMAP_LABEL_PAD * 2;
  const fitsName = innerW >= textWidth(name, nameFontSize) && innerH >= nameFontSize;
  if (!fitsName) return { name: false, value: false };
  // 数值行按「两行文字的总高」判断，行距按 1.2 倍字号算（与下面渲染时的 dy 同源）。
  const twoLineH = nameFontSize + valueFontSize * 1.2;
  return { name: true, value: showValue && innerH >= twoLineH };
}
