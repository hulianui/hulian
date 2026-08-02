import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "quickResponse": "快速响应",
    "heWasEloquentAndSpokeLoudly": "高吞吐",
    "formatChecking": "格式检查",
    "largeScaleLightReviewOfTestingProfile": "测试与配置文件、风格扫描等大批量轻审查，单价最低、首选兜底。",
    "codeUnderstanding": "代码理解",
    "logicalReasoning": "逻辑推理",
    "andReconstructedThePlan": "重构建议",
    "aBalancedChoiceForDailyBusinessCode": "日常业务代码审查的均衡之选，质量与成本平衡，覆盖绝大多数 PR。",
    "securityAudit": "安全审计",
    "inDepthReasoning": "深度推理",
    "lengthyContext": "长上下文",
    "securitySensitivePathsAuthenticationPaymentKeysAnd": "安全敏感路径（鉴权、支付、密钥）与复杂架构改动，最强但最贵。",
    "codeUnderstanding2": "代码理解",
    "theCostIsExtremelyLow": "成本极低",
    "chineseNotes": "中文注释",
    "batchReviewsOfInternalWarehousesWithExtreme": "对成本极度敏感的内部仓库批量审查，性价比标杆。",
    "lengthyContext2": "长上下文",
    "multipleFileAssociations": "多文件关联",
    "dependencyAnalysis": "依赖分析",
    "majorCrossFileChangesAndUltraLong": "跨文件大改动与超长 diff，百万级上下文窗口适合整仓关联分析。",
  },
  en: {
    "quickResponse": "Quick response",
    "heWasEloquentAndSpokeLoudly": "High throughput",
    "formatChecking": "Format checking",
    "largeScaleLightReviewOfTestingProfile": "Fast, low-cost reviews for tests, configuration files, and style-only changes.",
    "codeUnderstanding": "Code understanding",
    "logicalReasoning": "Logical reasoning",
    "andReconstructedThePlan": "Refactoring plans",
    "aBalancedChoiceForDailyBusinessCode": "A balanced choice for routine application-code reviews, covering most pull requests at a practical cost.",
    "securityAudit": "Security audit",
    "inDepthReasoning": "In-depth reasoning",
    "lengthyContext": "Lengthy context",
    "securitySensitivePathsAuthenticationPaymentKeysAnd": "Use for security-sensitive paths such as authentication, payments, and secrets, or for complex architectural changes. This is the strongest and most expensive tier.",
    "codeUnderstanding2": "Code understanding",
    "theCostIsExtremelyLow": "The cost is extremely low",
    "chineseNotes": "Chinese-language comments",
    "batchReviewsOfInternalWarehousesWithExtreme": "Cost-efficient batch reviews for internal repositories.",
    "lengthyContext2": "Lengthy context",
    "multipleFileAssociations": "Cross-file context",
    "dependencyAnalysis": "Dependency analysis",
    "majorCrossFileChangesAndUltraLong": "Designed for large cross-file changes and very long diffs that require repository-wide context.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanreview-data-models",
  content: t(content),
};

export default dictionary;
