import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    brandMark: "文",
    brandName: "瀚文 HanPaper",
    switchTheme: "切换主题",
    account: "账户",
    profile: "个人资料",
    logOut: "退出登录",
    searchPlaceholder: "搜索论文、图表、文献",
    deadlineSoon: "{0} 天后截稿",
    commandPapers: "论文",
    commandPages: "页面",
    commandEmpty: "没有匹配的论文或页面",
    openCommand: "搜索",
  },
  en: {
    brandMark: "H",
    brandName: "HanPaper",
    switchTheme: "Toggle theme",
    account: "Account",
    profile: "Profile",
    logOut: "Log out",
    searchPlaceholder: "Search papers, figures, references",
    deadlineSoon: "Due in {0} days",
    commandPapers: "Papers",
    commandPages: "Pages",
    commandEmpty: "No matching paper or page",
    openCommand: "Search",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanpaper-components-shell",
  content: t(content),
};

export default dictionary;
