import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    hancloudTheIntegratedCloudNativeApplicationPlatform: "瀚云 HanCloud · 一体化云原生应用平台",
    hancloudTakesYouFromGitPushToAGlobalReleaseWithDeploymentElasticComputeAndEndToEndObservabilityO: "从 git push 到全球上线，瀚云把部署、弹性算力与端到端可观测收进同一个平台。",
  },
  en: {
    hancloudTheIntegratedCloudNativeApplicationPlatform: "HanCloud · The integrated cloud-native application platform",
    hancloudTakesYouFromGitPushToAGlobalReleaseWithDeploymentElasticComputeAndEndToEndObservabilityO: "HanCloud takes you from git push to a global release with deployment, elastic compute, and end-to-end observability on one platform.",
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
  key: "demo-website-site-page",
  content: t(content),
};

export default dictionary;
