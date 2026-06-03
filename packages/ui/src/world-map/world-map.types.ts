/** 一个地理坐标点（可带标签，本期不渲染文字）。 */
export interface WorldMapPoint {
  lat: number;
  lng: number;
  label?: string;
}

/** 一条连线对（起点 → 终点）。 */
export interface WorldMapDot {
  start: WorldMapPoint;
  end: WorldMapPoint;
}

export interface WorldMapProps {
  /** 要画的连线对（经纬度）。不传 / 空数组则只显示点阵底图。 */
  dots?: WorldMapDot[];
  /** 弧线颜色（CSS 颜色，默认 chart token）。 */
  lineColor?: string;
  /** 点阵颜色（CSS 颜色，默认 border token）。 */
  dotColor?: string;
  /** 单条弧线画入时长(s)。 */
  duration?: number;
  className?: string;
}
