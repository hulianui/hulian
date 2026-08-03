import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    skillsMatrix: "技能矩阵",
    howITurnIdeasIntoProducts: "我用什么把想法变成产品",
    forSixYearsIHaveRefinedTheseDisciplinesFrontendIsMyFoundationFullStackAndNativeWorkExtendItAndDe: "六年里我在这些方向上反复打磨——前端是主场，全栈与原生是延伸，设计与增长让一个人也能闭环。",
  },
  en: {
    skillsMatrix: "Skills matrix",
    howITurnIdeasIntoProducts: "How I turn ideas into products",
    forSixYearsIHaveRefinedTheseDisciplinesFrontendIsMyFoundationFullStackAndNativeWorkExtendItAndDe: "For six years I have refined these disciplines: frontend is my foundation, full-stack and native work extend it, and design plus growth let one person carry a product end to end.",
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
  key: "demo-personal-components-sections-stack",
  content: t(content),
};

export default dictionary;
