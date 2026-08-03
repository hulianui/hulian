import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "pivot": "枢",
    "hanhubHanhub": "瀚枢 HanHub",
    "switchTheme": "切换主题",
    "balance": "余额",
    "account": "账户",
    "han": "瀚",
    "hanhubTeam": "瀚枢团队",
    "accountSettings": "账户设置",
    "accessDocument": "接入文档",
    "logOut": "退出登录",
  },
  en: {
    "pivot": "pivot",
    "hanhubHanhub": "HanHub HanHub",
    "switchTheme": "switch theme",
    "balance": "balance",
    "account": "Account",
    "han": "Han",
    "hanhubTeam": "HanHub Team",
    "accountSettings": "Account settings",
    "accessDocument": "Access document",
    "logOut": "Log out",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhub-components-shell",
  content: t(content),
};

export default dictionary;
