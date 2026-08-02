import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    normal: "正常",
    busy: "繁忙",
    warning: "告警",
    clickTheNodeToDrillDown: "点击节点下钻",
    globalNodeDistributionCrossBorderSchedulingLinks: "全球节点分布 · 跨境调度链路",
  },
  en: {
    normal: "Healthy",
    busy: "Busy",
    warning: "Alert",
    clickTheNodeToDrillDown: "Select a node to inspect it",
    globalNodeDistributionCrossBorderSchedulingLinks:
      "Global edge nodes · Cross-region routing links",
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
  key: "demo-dashboard-components-globe-panel",
  content: t(content),
};

export default dictionary;
