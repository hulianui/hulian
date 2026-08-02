import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "winRate": "赢率",
    "opportunityMoved": "已移动商机",
    "businessOpportunityBoard": "商机看板",
    "boardSummary": "共 {0} 个商机 · 进行中金额 {1} · 拖拽卡片跨列移动阶段（亦支持键盘：聚焦后空格抓起·方向键移动）",
    "allPersonsInCharge": "全部负责人",
    "allPersonsInCharge2": "全部负责人",
    "loadingOpportunities": "加载商机中…",
    "linWanqing": "林晚晴",
    "zhouMingyuan": "周明远",
    "gaoMin": "高敏",
    "chenCe": "陈策",
    "suXiao": "苏晓",
  },
  en: {
    "winRate": "Win rate ",
    "opportunityMoved": "Opportunity moved",
    "businessOpportunityBoard": "Opportunity pipeline",
    "boardSummary": "{0} opportunities · {1} active pipeline · Drag cards between stages. Keyboard users can press Space to pick up a card and use the arrow keys to move it.",
    "allPersonsInCharge": "All owners",
    "allPersonsInCharge2": "All owners",
    "loadingOpportunities": "Loading opportunities...",
    "linWanqing": "Lin Wanqing",
    "zhouMingyuan": "Zhou Mingyuan",
    "gaoMin": "Gao Min",
    "chenCe": "Chen Ce",
    "suXiao": "Su Xiao",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-crm-app-opportunities-page",
  content: t(content),
};

export default dictionary;
