import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "zhouLan": "周澜",
    "zhou": "周",
    "headOfTheDispatchPlatform": "调度平台负责人",
    "linAn": "林岸",
    "forest": "林",
    "routingStrategyEngineer": "路由策略工程师",
    "suWan": "苏晚",
    "su": "苏",
    "actuatorOperationsAndMaintenanceSre": "执行器运维 SRE",
    "chenZhao": "陈昭",
    "chen": "陈",
    "costGovernanceAnalyst": "成本治理分析师",
    "hanChe": "韩澈",
    "han": "韩",
    "slaAndAlertDuty": "SLA 与告警值班",
    "guTang": "顾棠",
    "look": "顾",
    "agentOrchestrationDevelopment": "Agent 编排开发",
  },
  en: {
    "zhouLan": "Zhou Lan",
    "zhou": "Zhou",
    "headOfTheDispatchPlatform": "Head of the dispatch platform",
    "linAn": "Lin An",
    "forest": "Forest",
    "routingStrategyEngineer": "Routing Strategy Engineer",
    "suWan": "Su Wan",
    "su": "Su",
    "actuatorOperationsAndMaintenanceSre": "Executor Operations and Maintenance (SRE).",
    "chenZhao": "Chen Zhao",
    "chen": "Chen",
    "costGovernanceAnalyst": "Cost governance analyst",
    "hanChe": "Han Che",
    "han": "Han",
    "slaAndAlertDuty": "SLA and alert duty",
    "guTang": "Gu Tang",
    "look": "Look",
    "agentOrchestrationDevelopment": "Agent orchestration development",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-data-members",
  content: t(content),
};

export default dictionary;
