import { copy } from "./providers.content";
import type { ModelMeta, ProviderMeta } from "./types";

// 厂商目录。color 用于 logo 方块，glyph 为 1-2 字标识。
export const providers: ProviderMeta[] = [
  { id: "openai", name: "OpenAI", color: "#10a37f", glyph: "AI" },
  { id: "anthropic", name: "Anthropic", color: "#d97757", glyph: "An" },
  { id: "google", name: "Google", color: "#4285f4", glyph: "G" },
  { id: "deepseek", name: "DeepSeek", color: "#4d6bfe", glyph: "DS" },
  { id: "alibaba", name: copy("aliTongyi"), color: "#615ced", glyph: copy("pass") },
  { id: "moonshot", name: copy("darkSideOfTheMoon"), color: "#16161a", glyph: "Ki" },
  { id: "zhipu", name: copy("glm"), color: "#3859ff", glyph: copy("wisdom") },
];

// 模型目录 —— 定价 grounded 2026（USD / 1M tokens）。markup = 网关加价倍率。
export const models: ModelMeta[] = [
  { id: "gpt-5.5", name: "GPT-5.5", provider: "openai", inPrice: 5, outPrice: 30, context: 256_000, maxOutput: 32_000, capabilities: ["chat", "reason", "vision", "function", "longContext"], markup: 1.1, benchmark: 95, rpm: 500 },
  { id: "gpt-5.4", name: "GPT-5.4", provider: "openai", inPrice: 2.5, outPrice: 15, context: 256_000, maxOutput: 32_000, capabilities: ["chat", "reason", "vision", "function"], markup: 1.1, benchmark: 92, rpm: 800 },
  { id: "gpt-5-mini", name: "GPT-5 mini", provider: "openai", inPrice: 0.25, outPrice: 2, context: 128_000, maxOutput: 16_000, capabilities: ["chat", "function"], markup: 1.05, benchmark: 84, rpm: 2000 },
  { id: "claude-opus-4-7", name: "Claude Opus 4.7", provider: "anthropic", inPrice: 5, outPrice: 25, context: 200_000, maxOutput: 32_000, capabilities: ["chat", "reason", "vision", "function", "longContext"], markup: 1.1, benchmark: 96, rpm: 400 },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "anthropic", inPrice: 3, outPrice: 15, context: 200_000, maxOutput: 16_000, capabilities: ["chat", "reason", "vision", "function"], markup: 1.1, benchmark: 91, rpm: 1000 },
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "anthropic", inPrice: 1, outPrice: 5, context: 200_000, maxOutput: 8_000, capabilities: ["chat", "function"], markup: 1.05, benchmark: 85, rpm: 2000 },
  { id: "gemini-3-pro", name: "Gemini 3 Pro", provider: "google", inPrice: 2, outPrice: 12, context: 1_000_000, maxOutput: 32_000, capabilities: ["chat", "reason", "vision", "function", "longContext"], markup: 1.1, benchmark: 93, rpm: 600 },
  { id: "gemini-3-flash", name: "Gemini 3 Flash", provider: "google", inPrice: 0.3, outPrice: 2.5, context: 1_000_000, maxOutput: 16_000, capabilities: ["chat", "vision", "longContext"], markup: 1.05, benchmark: 86, rpm: 3000 },
  { id: "deepseek-v4", name: "DeepSeek V4", provider: "deepseek", inPrice: 0.55, outPrice: 2.2, context: 128_000, maxOutput: 16_000, capabilities: ["chat", "reason", "function"], markup: 1.0, benchmark: 89, rpm: 1500 },
  { id: "qwen3-max", name: "Qwen3-Max", provider: "alibaba", inPrice: 1.2, outPrice: 6, context: 256_000, maxOutput: 16_000, capabilities: ["chat", "reason", "vision", "function", "longContext"], markup: 1.05, benchmark: 90, rpm: 1200 },
  { id: "kimi-k2", name: "Kimi K2", provider: "moonshot", inPrice: 0.6, outPrice: 2.5, context: 256_000, maxOutput: 16_000, capabilities: ["chat", "longContext", "function"], markup: 1.05, benchmark: 87, rpm: 1500 },
  { id: "glm-5", name: "GLM-5", provider: "zhipu", inPrice: 0.5, outPrice: 2, context: 128_000, maxOutput: 16_000, capabilities: ["chat", "reason", "function"], markup: 1.0, benchmark: 86, rpm: 1500 },
  { id: "mimo-flash", name: "MiMo Flash", provider: "alibaba", inPrice: 0.09, outPrice: 0.29, context: 64_000, maxOutput: 8_000, capabilities: ["chat"], markup: 1.0, benchmark: 78, rpm: 5000 },
];

export const capabilityLabel: Record<string, string> = {
  chat: copy("dialogue"),
  reason: copy("reasoning"),
  vision: copy("vision"),
  function: copy("functionCall"),
  longContext: copy("longContext"),
};

export function providerOf(id: string): ProviderMeta {
  return providers.find((p) => p.id === id) ?? providers[0];
}

export function modelOf(id: string): ModelMeta | undefined {
  return models.find((m) => m.id === id);
}
