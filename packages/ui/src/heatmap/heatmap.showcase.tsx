"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Heatmap } from "./heatmap";
import type { HeatCell } from "./heatmap.matrix";

const WEEKDAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const MODULES = ["登录", "支付", "订单", "搜索", "推送"];

// 模块 × 周问题密度（确定性伪随机，避免 SSR/CSR 漂移）。
const moduleData: HeatCell[] = MODULES.flatMap((m, mi) =>
  WEEKDAYS.map((d, di) => ({ x: d, y: m, value: ((mi * 7 + di * 3 + 2) % 10) })),
);

// 12 周贡献活动。
const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
const contribData: HeatCell[] = ["一", "二", "三", "四", "五", "六", "日"].flatMap((day, dy) =>
  weeks.map((w, wi) => ({ x: w, y: day, value: ((dy * 5 + wi * 7) % 9) })),
);

// 考点掌握率（0–1 比率·确定性数据）：domain 收紧 + valueFormat 百分比 + 色阶图例
const TOPICS = ["有理数", "整式", "方程", "函数", "几何"];
const CLASSES = ["一班", "二班", "三班", "四班"];
const masteryData: HeatCell[] = CLASSES.flatMap((c, ci) =>
  TOPICS.map((t, ti) => ({ x: t, y: c, value: 0.5 + (((ci * 5 + ti * 3) % 8) / 20) })),
);

// 同一份掌握率数据，但「三班·函数 / 三班·几何」整格缺席（没作答），「四班·方程」是真实的 0 分。
// 不上色区分的话这三格会涂成同一个最浅色——界面就在对老师说谎。
const masterySparse: HeatCell[] = masteryData
  .filter((c) => !(c.y === "三班" && (c.x === "函数" || c.x === "几何")))
  .map((c) => (c.y === "四班" && c.x === "方程" ? { ...c, value: 0 } : c));

// 斜纹而不是另一档灰：条纹在色阶里没有对应物，读图人不会当成「又一级强度」。
const EMPTY_TONE = "repeating-linear-gradient(45deg, var(--color-border) 0 2px, transparent 2px 4px)";

export const heatmapShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传稀疏点集 data + 行列标签，自动按值映射到主色透明度档。",
      code: `<Heatmap data={data} xLabels={WEEKDAYS} yLabels={MODULES} cellSize={18} />`,
      render: () => <Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} cellSize={18} />,
    },
    {
      title: "贡献活动图",
      description: "GitHub 风格的 12 周活动热力，格子调小更紧凑。",
      code: `<Heatmap
  data={contribData}
  xLabels={weeks}
  yLabels={["一", "二", "三", "四", "五", "六", "日"]}
  cellSize={14}
/>`,
      render: () => (
        <Heatmap
          data={contribData}
          xLabels={weeks}
          yLabels={["一", "二", "三", "四", "五", "六", "日"]}
          cellSize={14}
        />
      ),
    },
    {
      title: "色阶档数",
      description: "colorScale 控制色阶分档，档数越多过渡越细腻。",
      code: `<Heatmap data={data} xLabels={WEEKDAYS} yLabels={MODULES} colorScale={9} />`,
      render: () => <Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} colorScale={9} />,
    },
    {
      title: "无标签紧凑",
      description: "showLabels={false} 隐藏行列标签，适合放进卡片做缩略图。",
      code: `<Heatmap data={data} xLabels={WEEKDAYS} yLabels={MODULES} showLabels={false} cellSize={12} />`,
      render: () => (
        <Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} showLabels={false} cellSize={12} />
      ),
    },
    {
      title: "小数值域 / 百分比 + 图例",
      description:
        "比率数据（0–1）传 domain 收紧值域铺满色阶；valueFormat 让 tooltip 与图例自动带 %；showLegend 显示色阶图例。",
      code: `<Heatmap
  data={masteryData}            // value 是 0.5~0.85 的掌握率
  xLabels={TOPICS}
  yLabels={CLASSES}
  domain={[0.5, 0.9]}           // 按值域比例分档，低区间也能铺满色阶
  valueFormat={(v) => \`\${Math.round(v * 100)}%\`}
  showLegend
  cellSize={18}
/>`,
      render: () => (
        <Heatmap
          data={masteryData}
          xLabels={TOPICS}
          yLabels={CLASSES}
          domain={[0.5, 0.9]}
          valueFormat={(v) => `${Math.round(v * 100)}%`}
          showLegend
          cellSize={18}
        />
      ),
    },
    {
      title: "无数据 vs 值为 0",
      description:
        "缺席格（data 里没有这个点）默认与 0 档同色；传 emptyCellTone 把它涂成独立样式，才能和「真实的 0」分开。图例会自动补一块「无数据」样例。",
      code: `<Heatmap
  data={masterySparse}          // 三班的函数/几何整格缺席，四班·方程是真实 0
  xLabels={TOPICS}
  yLabels={CLASSES}
  domain={[0, 1]}
  valueFormat={(v) => \`\${Math.round(v * 100)}%\`}
  emptyCellTone="repeating-linear-gradient(45deg, var(--color-border) 0 2px, transparent 2px 4px)"
  showLegend
  formatTooltip={(c) => (c.empty ? \`\${c.y} · \${c.x}：未作答\` : \`\${c.y} · \${c.x}：\${Math.round(c.value * 100)}%\`)}
/>`,
      render: () => (
        <Heatmap
          data={masterySparse}
          xLabels={TOPICS}
          yLabels={CLASSES}
          domain={[0, 1]}
          valueFormat={(v) => `${Math.round(v * 100)}%`}
          emptyCellTone={EMPTY_TONE}
          showLegend
          cellSize={18}
          formatTooltip={(c) =>
            c.empty ? `${c.y} · ${c.x}：未作答` : `${c.y} · ${c.x}：${Math.round(c.value * 100)}%`
          }
        />
      ),
    },
    {
      title: "自定义提示 + 下钻",
      description: "formatTooltip 自定义悬停文案；传 onCellClick 后格子变为可点击按钮。",
      code: `<Heatmap
  data={data}
  xLabels={WEEKDAYS}
  yLabels={MODULES}
  formatTooltip={(c) => \`\${c.y} 在 \${c.x}：\${c.value} 个问题\`}
  onCellClick={(c) => alert(\`\${c.y} · \${c.x}\`)}
/>`,
      render: () => (
        <Heatmap
          data={moduleData}
          xLabels={WEEKDAYS}
          yLabels={MODULES}
          cellSize={18}
          formatTooltip={(c) => `${c.y} 在 ${c.x}：${c.value} 个问题`}
          onCellClick={() => {}}
        />
      ),
    },
  ],
  controls: [
    { prop: "colorScale", type: "number", defaultValue: 5, label: "色阶档数" },
    { prop: "cellSize", type: "number", defaultValue: 16, label: "格子边长" },
    { prop: "showLabels", type: "boolean", defaultValue: true, label: "显示标签" },
  ],
  states: [
    {
      name: "模块×周问题密度",
      render: () => <Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} cellSize={18} />,
    },
    {
      name: "12 周贡献活动",
      render: () => (
        <Heatmap data={contribData} xLabels={weeks} yLabels={["一", "二", "三", "四", "五", "六", "日"]} cellSize={14} />
      ),
    },
    {
      name: "无标签紧凑",
      render: () => <Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} showLabels={false} cellSize={12} />,
    },
    {
      name: "缺席格上色（无数据 ≠ 0）",
      render: () => (
        <Heatmap
          data={masterySparse}
          xLabels={TOPICS}
          yLabels={CLASSES}
          domain={[0, 1]}
          valueFormat={(v) => `${Math.round(v * 100)}%`}
          emptyCellTone={EMPTY_TONE}
          showLegend
          cellSize={18}
        />
      ),
    },
    {
      name: "掌握率（小数值域 + % 图例）",
      render: () => (
        <Heatmap
          data={masteryData}
          xLabels={TOPICS}
          yLabels={CLASSES}
          domain={[0.5, 0.9]}
          valueFormat={(v) => `${Math.round(v * 100)}%`}
          showLegend
          cellSize={18}
        />
      ),
    },
  ],
  renderWithProps: (p) => (
    <Heatmap
      data={moduleData}
      xLabels={WEEKDAYS}
      yLabels={MODULES}
      colorScale={Number(p.colorScale)}
      cellSize={Number(p.cellSize)}
      showLabels={p.showLabels as boolean}
    />
  ),
  toCode: (p) =>
    `<Heatmap data={data} colorScale={${Number(p.colorScale)}} cellSize={${Number(p.cellSize)}}${p.showLabels ? "" : " showLabels={false}"} />`,
};
