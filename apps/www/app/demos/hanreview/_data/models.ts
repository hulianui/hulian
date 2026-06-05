import type { ReviewModel } from "./types";

// 审查模型池（grounded 2026 价位，$/1M token）。
// id 须含 "haiku"/"sonnet"/"opus"——routing.ts 直接引用这些 id。
export const MODELS: ReviewModel[] = [
  {
    id: "haiku",
    name: "Claude Haiku 4.5",
    vendor: "Anthropic",
    inPrice: 1,
    outPrice: 5,
    caps: ["快速响应", "高吞吐", "格式检查"],
    fit: "测试与配置文件、风格扫描等大批量轻审查，单价最低、首选兜底。",
    tier: "economy",
  },
  {
    id: "sonnet",
    name: "Claude Sonnet 4.6",
    vendor: "Anthropic",
    inPrice: 3,
    outPrice: 15,
    caps: ["代码理解", "逻辑推理", "重构建议"],
    fit: "日常业务代码审查的均衡之选，质量与成本平衡，覆盖绝大多数 PR。",
    tier: "balanced",
  },
  {
    id: "opus",
    name: "Claude Opus 4.7",
    vendor: "Anthropic",
    inPrice: 5,
    outPrice: 25,
    caps: ["安全审计", "深度推理", "长上下文"],
    fit: "安全敏感路径（鉴权、支付、密钥）与复杂架构改动，最强但最贵。",
    tier: "frontier",
  },
  {
    id: "deepseek-v4",
    name: "DeepSeek V4",
    vendor: "DeepSeek",
    inPrice: 0.55,
    outPrice: 2.2,
    caps: ["代码理解", "成本极低", "中文注释"],
    fit: "对成本极度敏感的内部仓库批量审查，性价比标杆。",
    tier: "economy",
  },
  {
    id: "gemini-3-pro",
    name: "Gemini 3 Pro",
    vendor: "Google",
    inPrice: 2,
    outPrice: 12,
    caps: ["长上下文", "多文件关联", "依赖分析"],
    fit: "跨文件大改动与超长 diff，百万级上下文窗口适合整仓关联分析。",
    tier: "balanced",
  },
];
