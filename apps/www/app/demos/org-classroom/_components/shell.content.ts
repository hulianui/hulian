import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    brand: "瀚位 HanSeat",
    brandMark: "位",
    switchTheme: "切换主题",
    onDuty: "在岗",
    account: "账户",
    adminName: "林予涵",
    adminRole: "组织行政",
    adminInitial: "林",
    settings: "组织设置",
    helpCenter: "使用帮助",
    logOut: "退出登录",
  },
  en: {
    brand: "HanSeat",
    brandMark: "S",
    switchTheme: "Switch theme",
    onDuty: "On duty",
    account: "Account",
    adminName: "Lin Yuhan",
    adminRole: "Workplace admin",
    adminInitial: "L",
    settings: "Organization settings",
    helpCenter: "Help center",
    logOut: "Log out",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey): string {
  return content[DOCS_LOCALE][key];
}

const dictionary: Dictionary = {
  key: "demo-org-classroom-components-shell",
  content: t(content),
};

export default dictionary;
