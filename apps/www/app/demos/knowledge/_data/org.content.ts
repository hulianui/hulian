import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    rDCenter: "研发中心",
    frontEndGroup: "前端组",
    forestIslandFrontEndLead: "林屿（前端 Lead）",
    chenMo: "陈墨",
    zhaoYi: "赵一",
    backendGroups: "后端组",
    sunHao: "孙昊",
    qianWen: "钱文",
    designCenter: "设计中心",
    yangShuHeadOfDesign: "杨舒（设计负责人）",
    moJin: "墨瑾",
    productDepartment: "产品部",
    zhouQi: "周琦",
    wangYa: "王雅",
    forestIsland: "林屿",
    frontEndLead: "前端 Lead",
    frontEndEngineer: "前端工程师",
    backendEngineer: "后端工程师",
    yangShu: "杨舒",
    headOfDesign: "设计负责人",
    visualDesign: "视觉设计",
    productManager: "产品经理",
  },
  en: {
    rDCenter: "R&D Center",
    frontEndGroup: "Front-end team",
    forestIslandFrontEndLead: "Lin Yu (Front-end lead)",
    chenMo: "Chen Mo",
    zhaoYi: "Zhao Yi",
    backendGroups: "Backend team",
    sunHao: "Sun Hao",
    qianWen: "Qian Wen",
    designCenter: "Design Center",
    yangShuHeadOfDesign: "Yang Shu (Head of Design)",
    moJin: "Mo Jin",
    productDepartment: "Product Department",
    zhouQi: "Zhou Qi",
    wangYa: "Wang Ya",
    forestIsland: "Lin Yu",
    frontEndLead: "Front-end lead",
    frontEndEngineer: "Front-end engineer",
    backendEngineer: "Backend Engineer",
    yangShu: "Yang Shu",
    headOfDesign: "Head of Design",
    visualDesign: "Visual Design",
    productManager: "Product Manager",
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
  key: "demo-knowledge-data-org",
  content: t(content),
};

export default dictionary;
