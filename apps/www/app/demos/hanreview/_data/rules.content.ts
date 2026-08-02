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
    "fileForTestConfigurationIstestorconfig": "File for Test / Configuration (isTestOrConfig)",
    "testingAndProfileReviewHaveLowValue": "Testing and profile review have low value density; the Pai economic model Haiku has the lowest unit price.",
    "securitySensitivePathsSuchAsAuthenticationPayment": "Security-sensitive paths (such as authentication / payment / key)",
    "securityIssuesAreCostlyForcingADeep": "Security issues are costly, forcing a deep audit upgrade to the strongest model, Opus.",
    "largeFilesLines": "Large files (lines > 300)",
    "longDiffsRequireRobustLogicalReasoningSo": "Long diffs require robust logical reasoning, so the equilibrium model Sonnet is used.",
    "defaultStandardBusinessCode": "Default (standard business code)",
    "theVastMajorityOfPrGoesThrough": "The vast majority of PR goes through Sonnet, balancing quality and cost.",
    "estimatedCostsExceedCostcapAndAreNot": "Estimated costs exceed costCap and are not economic models",
    "costCapGuaranteesTheBottomAndOver": "Cost cap guarantees the bottom, and over-limit automatic downgrade to Haiku controlling the cost per review.",
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
