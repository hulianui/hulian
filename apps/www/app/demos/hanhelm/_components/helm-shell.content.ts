import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "rudder": "舵",
    "hanhelmHanhelm": "瀚舵 HanHelm",
    "switchThemes": "切换主题",
    "schedulingEngines": "调度引擎",
    "running": "运行中",
    "account": "账户",
    "rudder2": "舵",
    "hanhelmOperationsTeam": "瀚舵运维团队",
    "accountSettings": "账户设置",
    "importDocuments": "接入文档",
    "loggedOut": "退出登录",
  },
  en: {
    "rudder": "Rudder",
    "hanhelmHanhelm": "HanHelm HanHelm",
    "switchThemes": "Switch themes",
    "schedulingEngines": "Scheduling engines",
    "running": "Running",
    "account": "Account",
    "rudder2": "Rudder",
    "hanhelmOperationsTeam": "HanHelm operations team",
    "accountSettings": "Account settings",
    "importDocuments": "Import documents",
    "loggedOut": "Logged out",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-components-helm-shell",
  content: t(content),
};

export default dictionary;
