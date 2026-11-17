import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    workbench: "工作台",
    manuscript: "论文稿件",
    figureStudio: "图表工坊",
    library: "文献库",
    review: "审阅",
    submission: "投稿",
    settings: "设置",
    groupWriting: "写作",
    groupPublishing: "发表",
  },
  en: {
    workbench: "Workbench",
    manuscript: "Manuscript",
    figureStudio: "Figure studio",
    library: "Library",
    review: "Review",
    submission: "Submission",
    settings: "Settings",
    groupWriting: "Writing",
    groupPublishing: "Publishing",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanpaper-components-nav-config",
  content: t(content),
};

export default dictionary;
