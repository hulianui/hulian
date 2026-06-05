import type { Severity } from "./types";

// 全部确定性写死 / 公式生成，严禁 Math.random / Date.now（SSR/CSR 漂移）。

// 近 30 日质量分趋势（70-92 波动，确定性正弦 + 轻微锯齿）。
export const QUALITY_TREND: { date: string; score: number }[] = Array.from(
  { length: 30 },
  (_, i) => {
    // 确定性公式映射到 70-92。
    const base = 81;
    const wave = Math.round(Math.sin(i / 3) * 6 + Math.cos(i / 5) * 4);
    const score = Math.max(70, Math.min(92, base + wave));
    return { date: dateOf(i), score };
  },
);

// 近 30 日成本趋势（¥，确定性，随审查量起伏）。
export const COST_TREND: { date: string; cost: number }[] = Array.from(
  { length: 30 },
  (_, i) => {
    const base = 12.5;
    const wave = Math.sin(i / 4) * 5 + Math.cos(i / 7) * 3;
    const cost = Math.round((base + wave + (i % 6 === 0 ? 4 : 0)) * 100) / 100;
    return { date: dateOf(i), cost: Math.max(3, cost) };
  },
);

// 工具：第 i 天（从 2026-05-07 起算 30 天，到 2026-06-05）。
function dateOf(i: number): string {
  const start = Date.UTC(2026, 4, 7); // 2026-05-07
  const d = new Date(start + i * 86_400_000);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `2026-${mm}-${dd}`;
}

// 严重度分布（与 findings 大致呼应：critical 少、minor 多）。
export const SEVERITY_DIST: { severity: Severity; count: number }[] = [
  { severity: "critical", count: 4 },
  { severity: "major", count: 11 },
  { severity: "minor", count: 14 },
  { severity: "info", count: 7 },
];

// 模块 × 周 问题密度热力（喂 Heatmap）。
// x = 周 W1..W8，y = 5 个模块，value 0-9，确定性公式。
const HOTSPOT_MODULES = ["支付网关", "密钥库", "工作台", "商城端", "审计日志"];
export const HOTSPOT: { x: string; y: string; value: number }[] = (() => {
  const rows: { x: string; y: string; value: number }[] = [];
  for (let m = 0; m < HOTSPOT_MODULES.length; m++) {
    for (let w = 0; w < 8; w++) {
      // 确定性密度：支付/密钥库（高敏感）整体更热，末几周收敛。
      const baseByModule = [7, 6, 4, 5, 3][m];
      const wk = Math.abs(((m + 1) * (w + 2)) % 5) - 2; // -2..2
      const decay = Math.floor(w / 3); // 越往后越收敛
      const value = Math.max(0, Math.min(9, baseByModule + wk - decay));
      rows.push({ x: `W${w + 1}`, y: HOTSPOT_MODULES[m], value });
    }
  }
  return rows;
})();

// 各模型调用量与累计成本（¥）。
export const MODEL_USAGE: { modelId: string; calls: number; cost: number }[] = [
  { modelId: "haiku", calls: 482, cost: 18.64 },
  { modelId: "sonnet", calls: 731, cost: 96.32 },
  { modelId: "opus", calls: 156, cost: 124.8 },
  { modelId: "deepseek-v4", calls: 203, cost: 6.71 },
  { modelId: "gemini-3-pro", calls: 88, cost: 21.44 },
];
