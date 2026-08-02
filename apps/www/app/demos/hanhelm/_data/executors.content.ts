import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "anthropicExtremelyFastAndLightweight": "Anthropic · 极速轻量",
    "anthropicBalanceTheMainForce": "Anthropic · 均衡主力",
    "anthropicFlagshipReasoning": "Anthropic · 旗舰推理",
    "inDepthExplorationUltraLowCost": "深度求索 · 超低成本",
    "coralPictureScrollFlux": "瑚琏绘卷 Flux",
    "imageGenerationHighFidelity": "图像生成 · 高保真",
    "retrievalEnhancementAgent": "检索增强 Agent",
    "ragVectorLibraryRearrangement": "RAG · 向量库 + 重排",
    "contentReviewAgent": "内容审核 Agent",
    "complianceReviewMultipleStrategiesRunInParallel": "合规审核 · 多策略并行",
    "orchestrationAndSchedulingAgents": "编排调度 Agent",
    "multiAgentOrchestrationPlanExecuteSummarize": "多 agent 编排 · 计划-执行-汇总",
    "structuredExtractionOfAgents": "结构化抽取 Agent",
    "documentExtractionTableFieldParsing": "文档抽取 · 表格/字段解析",
  },
  en: {
    "anthropicExtremelyFastAndLightweight": "Anthropic · Extremely fast and lightweight",
    "anthropicBalanceTheMainForce": "Anthropic · Balance the main force",
    "anthropicFlagshipReasoning": "Anthropic · Flagship Reasoning",
    "inDepthExplorationUltraLowCost": "In-depth exploration · Ultra-low cost",
    "coralPictureScrollFlux": "Coral Picture Scroll Flux",
    "imageGenerationHighFidelity": "Image generation · High fidelity",
    "retrievalEnhancementAgent": "Retrieval enhancement agent",
    "ragVectorLibraryRearrangement": "RAG · Vector library + rearrangement",
    "contentReviewAgent": "Content Review Agent",
    "complianceReviewMultipleStrategiesRunInParallel": "Compliance Review · Multiple strategies run in parallel",
    "orchestrationAndSchedulingAgents": "Orchestration and scheduling agents",
    "multiAgentOrchestrationPlanExecuteSummarize": "Multi-agent orchestration · Plan-execute-summarize",
    "structuredExtractionOfAgents": "Structured extraction of agents",
    "documentExtractionTableFieldParsing": "Document extraction · Table/field parsing",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-data-executors",
  content: t(content),
};

export default dictionary;
