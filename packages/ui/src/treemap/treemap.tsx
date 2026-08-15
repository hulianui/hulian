"use client";
// 矩形树图（#276）：一组扁平数据按值占面积铺满一块矩形，大项一眼可见。
//
// 什么时候用它而不是 HBarList：读者要的是「谁占了大头」这个一眼的观感。50 家门店按会员数
// 排成横条列表，数据一个不少，但「面积即占比」那半截没了 —— 前三名和第四十名的差距要靠
// 读数字才能感到。反过来，需要精确比较相邻两项、或要排序阅读时，横条列表更好。
//
// recharts 引擎（squarify 布局）+ 瑚琏皮肤：格子色走 chart token，格内文字按尺寸取舍
// （放不下就不画，见 treemap-label）。单层，不做层级下钻 —— 消费场景是「点一格钻到列表页」，
// 钻取语义由 onItemClick 交给业务侧。
import { memo } from "react";
import { ResponsiveContainer, Tooltip, Treemap as ReTreemap } from "recharts";
import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import { chartColor, tooltipContentStyle, tooltipLabelStyle } from "../chart/chart-theme";
import { TREEMAP_LABEL_PAD, treemapLabelFit } from "./treemap-label";
import type { TreemapDatum, TreemapProps } from "./treemap.types";

const NAME_FONT = 12;
const VALUE_FONT = 11;

interface CellProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  depth?: number;
  name?: string;
  value?: number;
  data: TreemapDatum[];
  showValue: boolean;
  format: (value: number) => string;
  onItemClick?: TreemapProps["onItemClick"];
}

function TreemapCell({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = 0,
  depth = 1,
  name = "",
  value = 0,
  data,
  showValue,
  format,
  onItemClick,
}: CellProps) {
  // recharts 会把 content 也套用在根节点上（depth 0 = 铺满整块画布的那个父矩形）。
  // 不挡掉的话会多画一个盖住全图的格子，它的 index 是 0 —— 于是点任何地方都报「第一项」。
  if (depth === 0) return null;
  const datum = data[index];
  const fill = resolveTone(datum?.color) ?? chartColor(index);
  const fit = treemapLabelFit({
    width,
    height,
    name,
    nameFontSize: NAME_FONT,
    valueFontSize: VALUE_FONT,
    showValue,
  });
  const clickable = onItemClick != null && datum != null;
  return (
    <g
      className={clickable ? "cursor-pointer" : undefined}
      onClick={clickable ? () => onItemClick({ datum, index }) : undefined}
    >
      {/* stroke 用 surface 而非 border：格子之间要的是「切开」而不是「描边」，
          与 PieChart 各片之间的分隔同一手法，暗色下自动跟着底色走。 */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="var(--color-surface)"
        strokeWidth={2}
      />
      {fit.name && (
        <text
          x={x + TREEMAP_LABEL_PAD}
          y={y + TREEMAP_LABEL_PAD + NAME_FONT}
          // 格子填的是 chart 色（深浅不一），文字固定用白：跟着 foreground 走会在浅色格上
          // 变成浅灰对浅底。与 Pie 的扇区标签同口径。
          fill="#fff"
          fontSize={NAME_FONT}
          className="pointer-events-none select-none"
        >
          {name}
          {fit.value && (
            <tspan x={x + TREEMAP_LABEL_PAD} dy={VALUE_FONT * 1.2} fontSize={VALUE_FONT} opacity={0.85}>
              {format(value)}
            </tspan>
          )}
        </text>
      )}
    </g>
  );
}

function TreemapImpl({
  data,
  height = 280,
  className,
  onItemClick,
  showValue = false,
  valueFormat,
}: TreemapProps) {
  const format = valueFormat ?? String;
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height={height} minWidth={0} minHeight={0}>
        <ReTreemap
          // recharts 的 TreemapDataType 要求索引签名（它支持任意附加字段 + children 嵌套），
          // 而 TreemapDatum 是三个具名字段的闭合形状 —— 结构上兼容，只是 TS 不认。
          // 放开成索引签名类型会让消费方失去字段拼写检查，这里只在边界断言一次。
          data={data as unknown as Array<Record<string, unknown>>}
          dataKey="value"
          nameKey="name"
          // 不画默认描边：格子的分隔由 TreemapCell 自己的 stroke 负责，两套叠加会出现双线。
          stroke="none"
          isAnimationActive={false}
          content={
            <TreemapCell
              data={data}
              showValue={showValue}
              format={format}
              onItemClick={onItemClick}
            />
          }
        >
          <Tooltip
            contentStyle={tooltipContentStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value) => format(Number(value))}
          />
        </ReTreemap>
      </ResponsiveContainer>
    </div>
  );
}

TreemapImpl.displayName = "Treemap";

// 稳定父更新时整棵子树 bail out —— 与 Funnel/Button/Checkbox/Chip 同一处方（性能门禁的
// avoidable-render 规则实测报到 14 次白跑）。recharts 的 squarify 布局与 391 个格子的
// SVG 不该跟着无关的父级重算。
export const Treemap = memo(TreemapImpl);
