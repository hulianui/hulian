import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    platformCapabilities: "平台能力",
    onePlatformForEveryStepFromCodeToProduction: "一个平台，覆盖应用上线的每一环",
    deploymentElasticComputeAndEndToEndObservabilityWorkTogetherWithoutAPatchworkOfToolsAndScripts: "从部署到弹性算力，再到端到端可观测——不必再拼凑五六套工具与脚本。",
  },
  en: {
    platformCapabilities: "Platform capabilities",
    onePlatformForEveryStepFromCodeToProduction: "One platform for every step from code to production",
    deploymentElasticComputeAndEndToEndObservabilityWorkTogetherWithoutAPatchworkOfToolsAndScripts: "Deployment, elastic compute, and end-to-end observability work together, without a patchwork of tools and scripts.",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-website-components-sections-features",
  content: t(content),
};

export default dictionary;
