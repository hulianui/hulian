import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    integrations: "生态集成",
    connectToTheToolsYouAlreadyUse: "接入你已经在用的工具",
    connectGithubDockerKubernetesSlackPostgresAndDatadogOnceAndKeepThemInSyncHancloudConnectsYourExi: "GitHub、Docker、Kubernetes、Slack、Postgres、Datadog…… 一次连接，自动同步。瀚云不替换你的工具链，而是把它们串成一条顺畅的交付流水线。",
  },
  en: {
    integrations: "Integrations",
    connectToTheToolsYouAlreadyUse: "Connect to the tools you already use",
    connectGithubDockerKubernetesSlackPostgresAndDatadogOnceAndKeepThemInSyncHancloudConnectsYourExi: "Connect GitHub, Docker, Kubernetes, Slack, Postgres, and Datadog once and keep them in sync. HanCloud connects your existing tools into a smooth delivery pipeline instead of replacing them.",
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
  key: "demo-website-components-sections-integrations",
  content: t(content),
};

export default dictionary;
