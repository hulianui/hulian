import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "shenYanzhi": "沈砚之",
    "hanyunDigitalPlatformRDDepartment": "瀚云数智 · 平台研发部",
    "sink": "沈",
    "sprintingForQ2Release": "正在冲刺 Q2 发布",
    "sheZWechatPay": "shen****z (微信支付)",
    "teamSeats": "团队席位",
    "seat": "席",
    "numberOfItems": "项目数",
    "a": "个",
    "storageSpace": "存储空间",
    "apiCallsThisMonth": "本月 API 调用",
    "times": "次",
  },
  en: {
    "shenYanzhi": "Shen Yanzhi",
    "hanyunDigitalPlatformRDDepartment": "Hanyun Digital · Platform R&D Department",
    "sink": "SY",
    "sprintingForQ2Release": "Sprinting for Q2 release",
    "sheZWechatPay": "she****z (WeChat Pay)",
    "teamSeats": "Team seats",
    "seat": "seats",
    "numberOfItems": "Projects",
    "a": "projects",
    "storageSpace": "Storage",
    "apiCallsThisMonth": "API calls this month",
    "times": "calls",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-billing-data-account",
  content: t(content),
};

export default dictionary;
