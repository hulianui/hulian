import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    auroraTechnology: "极光科技",
    yuntuData: "云图数据",
    farsailGlobal: "远帆出海",
    wenxinFinance: "稳信金融",
    galaxyMedia: "星河传媒",
    wanxiangRetail: "万象零售",
    text18000TeamsHaveBuiltAndDeliveredOnHancloud: "已有 18,000+ 团队在瀚云上构建与交付",
  },
  en: {
    auroraTechnology: "Aurora Technology",
    yuntuData: "Yuntu Data",
    farsailGlobal: "FarSail Global",
    wenxinFinance: "Wenxin Finance",
    galaxyMedia: "Galaxy Media",
    wanxiangRetail: "Wanxiang Retail",
    text18000TeamsHaveBuiltAndDeliveredOnHancloud: "18,000+ teams have built and delivered on HanCloud",
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
  key: "demo-website-components-sections-trust-bar",
  content: t(content),
};

export default dictionary;
