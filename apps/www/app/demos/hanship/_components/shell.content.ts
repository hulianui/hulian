import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "ship": "舰",
    "hanship": "瀚舰 HanShip",
    "switchTheme": "切换主题",
    "connected": "已连接",
    "account": "账户",
    "coral": "瑚",
    "hulianTeam": "瑚琏团队",
    "teamSettings": "团队设置",
    "accessDocument": "接入文档",
    "logOut": "退出登录",
  },
  en: {
    "ship": "ship",
    "hanship": "HanShip",
    "switchTheme": "switch theme",
    "connected": "Connected",
    "account": "Account",
    "coral": "coral",
    "hulianTeam": "Hulian team",
    "teamSettings": "Team settings",
    "accessDocument": "Access document",
    "logOut": "Log out",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanship-components-shell",
  content: t(content),
};

export default dictionary;
