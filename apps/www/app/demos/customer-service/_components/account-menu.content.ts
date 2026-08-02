import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "accountMenu": "账号菜单",
    "xiaoLian": "小琏",
    "seniorCustomerService": "高级客服",
    "lian": "琏",
    "xiaoLian2": "小琏",
    "personalCenter": "个人中心",
    "theDemoEnvironmentDoesNotProvideThis": "demo 环境暂未提供该页面",
    "personalCenter2": "个人中心",
    "customerServiceSettings": "客服设置",
    "logOut": "退出登录",
  },
  en: {
    "accountMenu": "Account menu",
    "xiaoLian": "Xiao Lian",
    "seniorCustomerService": "Senior support agent",
    "lian": "Lian",
    "xiaoLian2": "Xiao Lian",
    "personalCenter": "Profile",
    "theDemoEnvironmentDoesNotProvideThis": "The demo environment does not provide this page yet",
    "personalCenter2": "Profile",
    "customerServiceSettings": "Customer service settings",
    "logOut": "Log out",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-components-account-menu",
  content: t(content),
};

export default dictionary;
