import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    department: "产品设计部",
    engineering: "技术研发部",
    lin: "林予涵",
    chen: "陈可",
    zhou: "周宁",
    zhao: "赵启明",
    sun: "孙晚",
    wu: "吴桐",
    zheng: "郑澄",
    he: "何安",
    xu: "许知夏",
    shen: "沈酌",
  },
  en: {
    department: "Product Design",
    engineering: "Engineering",
    lin: "Lin Yuhan",
    chen: "Chen Ke",
    zhou: "Zhou Ning",
    zhao: "Zhao Qiming",
    sun: "Sun Wan",
    wu: "Wu Tong",
    zheng: "Zheng Cheng",
    he: "He An",
    xu: "Xu Zhixia",
    shen: "Shen Zhuo",
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
  key: "demo-org-classroom-components-classroom-demo",
  content: t(content),
};

export default dictionary;
