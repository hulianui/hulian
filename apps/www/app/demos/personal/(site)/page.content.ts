import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    home: "首页",
    about: "关于",
    skills: "技能",
    work: "作品",
    journey: "历程",
    contact: "联系",
    sectionNavigation: "章节导航",
    backToTop: "回到顶部",
  },
  en: {
    home: "Home",
    about: "About",
    skills: "Skills",
    work: "Work",
    journey: "Journey",
    contact: "Contact",
    sectionNavigation: "Section navigation",
    backToTop: "Back to top",
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
  key: "demo-personal-site-page",
  content: t(content),
};

export default dictionary;
