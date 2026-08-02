import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "throughputQps": "吞吐 QPS",
    "p50Latency": "P50 延迟",
    "p95Latency": "P95 延迟",
    "queueDepth": "队列深度",
    "article": "条",
    "cost": "成本",
    "missionsPouringIn": "任务涌入",
    "successfulRouting": "成功路由",
    "proceedToExecution": "进入执行",
    "successfullyCompleted": "成功完成",
    "translationCategory": "翻译类",
    "extractionCategory": "抽取类",
    "searchQA": "检索问答",
    "reviewCategory": "审核类",
    "imageCategory": "图像类",
    "arrangementCategory": "编排类",
    "sixDimensionalSmartRouter": "六维智能路由器",
    "scrollFlux": "绘卷 Flux",
    "agentCluster": "Agent 集群",
  },
  en: {
    "throughputQps": "Throughput QPS",
    "p50Latency": "P50 latency",
    "p95Latency": "P95 latency",
    "queueDepth": "Queue depth",
    "article": "tasks",
    "cost": "Cost",
    "missionsPouringIn": "Tasks received",
    "successfulRouting": "Successful routing",
    "proceedToExecution": "Started execution",
    "successfullyCompleted": "Successfully completed",
    "translationCategory": "Translation category",
    "extractionCategory": "Extraction category",
    "searchQA": "Search Q&A",
    "reviewCategory": "Review category",
    "imageCategory": "Image category",
    "arrangementCategory": "Orchestration category",
    "sixDimensionalSmartRouter": "Six-dimensional smart router",
    "scrollFlux": "Hulian Image Flux",
    "agentCluster": "Agent cluster",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-data-metrics",
  content: t(content),
};

export default dictionary;
