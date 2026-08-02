import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "fileForTestConfigurationIstestorconfig": "文件为测试 / 配置（isTestOrConfig）",
    "testingAndProfileReviewHaveLowValue": "测试与配置文件审查价值密度低，派经济模型 Haiku，单价最低。",
    "securitySensitivePathsSuchAsAuthenticationPayment": "安全敏感路径（securitySensitive，如鉴权 / 支付 / 密钥）",
    "securityIssuesAreCostlyForcingADeep": "安全问题代价高，强制升级到最强模型 Opus 做深度审计。",
    "largeFilesLines": "大文件（lines > 300）",
    "longDiffsRequireRobustLogicalReasoningSo": "长 diff 需要稳健的逻辑推理，派均衡模型 Sonnet。",
    "defaultStandardBusinessCode": "默认（普通业务代码）",
    "theVastMajorityOfPrGoesThrough": "绝大多数 PR 走 Sonnet，质量与成本平衡。",
    "estimatedCostsExceedCostcapAndAreNot": "预估成本超出 costCap 且非经济模型",
    "costCapGuaranteesTheBottomAndOver": "成本封顶兜底，超限自动降级到 Haiku 控制单次审查开销。",
  },
  en: {
    "fileForTestConfigurationIstestorconfig": "Test or configuration file (isTestOrConfig)",
    "testingAndProfileReviewHaveLowValue": "Tests and configuration usually need a focused review, so route them to the lower-cost Haiku model.",
    "securitySensitivePathsSuchAsAuthenticationPayment": "Security-sensitive paths such as authentication, payments, or secrets",
    "securityIssuesAreCostlyForcingADeep": "Security failures are costly, so route these files to Opus for the deepest review.",
    "largeFilesLines": "Large files (lines > 300)",
    "longDiffsRequireRobustLogicalReasoningSo": "Long diffs need sustained reasoning, so route them to the balanced Sonnet model.",
    "defaultStandardBusinessCode": "Default (standard business code)",
    "theVastMajorityOfPrGoesThrough": "Route most pull requests through Sonnet to balance review quality and cost.",
    "estimatedCostsExceedCostcapAndAreNot": "Estimated cost exceeds costCap; fall back to the low-cost model",
    "costCapGuaranteesTheBottomAndOver": "When the estimated cost exceeds the cap, route the review to Haiku to keep per-review spending within budget.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanreview-data-rules",
  content: t(content),
};

export default dictionary;
