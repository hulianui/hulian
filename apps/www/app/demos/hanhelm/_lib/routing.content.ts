import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "abilityNotMetValue": "能力不满足: {0}",
    "actuatorsAreOffline": "执行器离线",
    "optimalComprehensiveSixDimensionsValueAbilityMatching": "综合六维最优：{0}（能力匹配，综合分 {1}）",
    "noOnlineExecutorMeetingCapabilityRequirementsTasks": "无满足能力要求的在线执行器，任务进入等待重试。",
  },
  en: {
    "abilityNotMetValue": "Ability not met: {0}",
    "actuatorsAreOffline": "Executors are offline",
    "optimalComprehensiveSixDimensionsValueAbilityMatching": "Optimal Comprehensive Six Dimensions: {0} (Ability Matching, Comprehensive Score {1})",
    "noOnlineExecutorMeetingCapabilityRequirementsTasks": "No online executor meeting capability requirements; tasks enter and wait for retry.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-lib-routing",
  content: t(content),
};

export default dictionary;
