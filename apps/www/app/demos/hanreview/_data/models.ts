import { copy } from "./models.content";
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
    caps: [copy("quickResponse"), copy("heWasEloquentAndSpokeLoudly"), copy("formatChecking")],
    fit: copy("largeScaleLightReviewOfTestingProfile"),
    tier: "economy",
  },
  {
    id: "sonnet",
    name: "Claude Sonnet 4.6",
    vendor: "Anthropic",
    inPrice: 3,
    outPrice: 15,
    caps: [copy("codeUnderstanding"), copy("logicalReasoning"), copy("andReconstructedThePlan")],
    fit: copy("aBalancedChoiceForDailyBusinessCode"),
    tier: "balanced",
  },
  {
    id: "opus",
    name: "Claude Opus 4.7",
    vendor: "Anthropic",
    inPrice: 5,
    outPrice: 25,
    caps: [copy("securityAudit"), copy("inDepthReasoning"), copy("lengthyContext")],
    fit: copy("securitySensitivePathsAuthenticationPaymentKeysAnd"),
    tier: "frontier",
  },
  {
    id: "deepseek-v4",
    name: "DeepSeek V4",
    vendor: "DeepSeek",
    inPrice: 0.55,
    outPrice: 2.2,
    caps: [copy("codeUnderstanding2"), copy("theCostIsExtremelyLow"), copy("chineseNotes")],
    fit: copy("batchReviewsOfInternalWarehousesWithExtreme"),
    tier: "economy",
  },
  {
    id: "gemini-3-pro",
    name: "Gemini 3 Pro",
    vendor: "Google",
    inPrice: 2,
    outPrice: 12,
    caps: [copy("lengthyContext2"), copy("multipleFileAssociations"), copy("dependencyAnalysis")],
    fit: copy("majorCrossFileChangesAndUltraLong"),
    tier: "balanced",
  },
];
