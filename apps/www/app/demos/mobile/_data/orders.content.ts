import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    deepWholeHomeCleaning: "深度保洁 · 全屋",
    msZhang: "张阿姨",
    service: "次",
    room2502Tower2WangjingSohoChaoyangDistrict: "朝阳区望京 SOHO T2 2502",
    airConditionerCleaningAndSanitizing: "空调清洗消毒",
    mrLi: "李师傅",
    unit: "台",
    room1201ZhongguancunTowerHaidianDistrict: "海淀区中关村大厦 1201",
    premiumAtHomeManicure: "上门美甲 · 精品款",
    xiaoya: "小雅",
    b304FinancialStreetXichengDistrict: "西城区金融街 B304",
    routineCleaning2Hours: "日常保洁 · 2 小时",
    msSun: "孙阿姨",
    toiletAndDrainClearing: "马桶/下水道疏通",
    mrWang: "王师傅",
    a1301AdvancedBusinessParkFengtaiDistrict: "丰台区总部基地 A1-301",
    pendingConfirmation: "待确认",
    inProgress: "服务中",
    awaitingReview: "待评价",
    completed: "已完成",
    canceled: "已取消",
  },
  en: {
    deepWholeHomeCleaning: "Deep whole-home cleaning",
    msZhang: "Ms. Zhang",
    service: "service",
    room2502Tower2WangjingSohoChaoyangDistrict: "Room 2502, Tower 2, Wangjing SOHO, Chaoyang District",
    airConditionerCleaningAndSanitizing: "Air-conditioner cleaning and sanitizing",
    mrLi: "Mr. Li",
    unit: "unit",
    room1201ZhongguancunTowerHaidianDistrict: "Room 1201, Zhongguancun Tower, Haidian District",
    premiumAtHomeManicure: "Premium at-home manicure",
    xiaoya: "Xiaoya",
    b304FinancialStreetXichengDistrict: "B304, Financial Street, Xicheng District",
    routineCleaning2Hours: "Routine cleaning · 2 hours",
    msSun: "Ms. Sun",
    toiletAndDrainClearing: "Toilet and drain clearing",
    mrWang: "Mr. Wang",
    a1301AdvancedBusinessParkFengtaiDistrict: "A1-301, Advanced Business Park, Fengtai District",
    pendingConfirmation: "Pending confirmation",
    inProgress: "In progress",
    awaitingReview: "Awaiting review",
    completed: "Completed",
    canceled: "Canceled",
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
  key: "demo-mobile-data-orders",
  content: t(content),
};

export default dictionary;
