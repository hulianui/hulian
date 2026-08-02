import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    luHeng: "陆衡",
    shenZhiwei: "沈知微",
    zhouMubai: "周慕白",
    linXi: "林夕",
    guYuanzhou: "顾远舟",
    aiReviewer: "AI 审查官",
    administrator: "管理员",
    reviewer: "审查者",
    viewOnly: "只读",
  },
  en: {
    luHeng: "Lu Heng",
    shenZhiwei: "Shen Zhiwei",
    zhouMubai: "Zhou Mubai",
    linXi: "Lin Xi",
    guYuanzhou: "Gu Yuanzhou",
    aiReviewer: "AI Reviewer",
    administrator: "Administrator",
    reviewer: "Reviewer",
    viewOnly: "View only",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey): string {
  return content[DOCS_LOCALE][key];
}

const dictionary: Dictionary = {
  key: "demo-hanreview-data-members",
  content: t(content),
};

export default dictionary;
