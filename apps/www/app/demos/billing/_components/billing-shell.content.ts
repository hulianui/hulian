import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "han": "瀚",
    "currentSubscription": "当前订阅",
    "month": "/ 月",
    "managementPackage": "管理套餐",
    "returnToDemoGallery": "返回 Demo 画廊",
    "openNavigation": "打开导航",
    "hanpay": "瀚付",
    "switchTheme": "切换主题",
    "closeNavigation": "关闭导航",
  },
  en: {
    "han": "H",
    "currentSubscription": "Current subscription",
    "month": "/month",
    "managementPackage": "Manage plan",
    "returnToDemoGallery": "Back to demo gallery",
    "openNavigation": "Open navigation",
    "hanpay": "HanPay",
    "switchTheme": "Switch theme",
    "closeNavigation": "Close navigation",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-billing-components-billing-shell",
  content: t(content),
};

export default dictionary;
