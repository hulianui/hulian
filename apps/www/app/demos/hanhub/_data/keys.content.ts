import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "productionEnvironmentMainService": "生产环境 · 主服务",
    "produce": "生产",
    "dataDashboardReadOnlyAnalysis": "数据看板 · 只读分析",
    "produce2": "生产",
    "mobileApp": "移动端 App",
    "client": "客户端",
    "experimentPlayground": "实验 · Playground",
    "test": "测试",
    "legacyIntegrationDiscontinued": "旧版集成（已停用）",
    "archive": "归档",
    "produce3": "生产",
    "client2": "客户端",
    "test2": "测试",
    "archive2": "归档",
  },
  en: {
    "productionEnvironmentMainService": "Production environment · Main service",
    "produce": "produce",
    "dataDashboardReadOnlyAnalysis": "Data dashboard · Read-only analysis",
    "produce2": "produce",
    "mobileApp": "Mobile App",
    "client": "client",
    "experimentPlayground": "Experiment · Playground",
    "test": "test",
    "legacyIntegrationDiscontinued": "Legacy integration (discontinued)",
    "archive": "Archive",
    "produce3": "produce",
    "client2": "client",
    "test2": "test",
    "archive2": "Archive",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhub-data-keys",
  content: t(content),
};

export default dictionary;
