// 计费纯函数 —— 费用是 HanHub 的核心主线，全部可单测。
import type { ModelMeta } from "../_data/types";

/** 按 token 用量算费用（USD）：(promptTok×in + completionTok×out) / 1e6 × markup。 */
export function costOf(
  promptTokens: number,
  completionTokens: number,
  inPrice: number,
  outPrice: number,
  markup = 1,
): number {
  return ((promptTokens * inPrice + completionTokens * outPrice) / 1_000_000) * markup;
}

/** 按模型算费用（吃模型自身单价与网关倍率）。 */
export function costOfModel(promptTokens: number, completionTokens: number, model: ModelMeta): number {
  return costOf(promptTokens, completionTokens, model.inPrice, model.outPrice, model.markup);
}

/** 充值手续费（USD）：max(金额×5.5%, $0.80)。grounded：OpenRouter 充值费。 */
export function topupFee(amount: number): number {
  return Math.max(amount * 0.055, 0.8);
}

/** 格式化美元（自适应小数位：小额保 4 位，大额保 2 位）。 */
export function formatUsd(v: number): string {
  if (v === 0) return "$0";
  if (Math.abs(v) < 0.01) return `$${v.toFixed(4)}`;
  if (Math.abs(v) < 1) return `$${v.toFixed(3)}`;
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** 单价展示（$/1M tokens）。 */
export function formatPrice(perMillion: number): string {
  return `$${perMillion.toFixed(2)}`;
}
