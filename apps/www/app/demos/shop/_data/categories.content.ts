import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    tech: "数码 3C",
    phonesMobile: "手机通讯",
    computersOffice: "电脑办公",
    audioHeadphones: "影音耳机",
    wearables: "智能穿戴",
    homeLiving: "家居生活",
    kitchenAppliances: "厨房料理",
    furnitureStorage: "家具收纳",
    beddingTextiles: "床品布艺",
    lighting: "灯具照明",
    beautyCare: "美妆个护",
    skinCare: "护肤",
    makeup: "彩妆",
    fragrance: "香水",
    personalCare: "个人护理",
    sportsOutdoors: "运动户外",
    fitness: "健身训练",
    campingHiking: "露营徒步",
    cyclingGear: "骑行装备",
    athleticShoes: "运动鞋",
    foodGrocery: "食品生鲜",
    snacks: "休闲零食",
    drinks: "酒水饮料",
    freshProduce: "时令生鲜",
    healthFoods: "健康滋补",
    clothingBags: "服饰箱包",
    menSClothing: "男装",
    womenSClothing: "女装",
    bags: "箱包",
    accessories: "配饰",
  },
  en: {
    tech: "Tech",
    phonesMobile: "Phones & mobile",
    computersOffice: "Computers & office",
    audioHeadphones: "Audio & headphones",
    wearables: "Wearables",
    homeLiving: "Home & living",
    kitchenAppliances: "Kitchen appliances",
    furnitureStorage: "Furniture & storage",
    beddingTextiles: "Bedding & textiles",
    lighting: "Lighting",
    beautyCare: "Beauty & care",
    skinCare: "Skin care",
    makeup: "Makeup",
    fragrance: "Fragrance",
    personalCare: "Personal care",
    sportsOutdoors: "Sports & outdoors",
    fitness: "Fitness",
    campingHiking: "Camping & hiking",
    cyclingGear: "Cycling gear",
    athleticShoes: "Athletic shoes",
    foodGrocery: "Food & grocery",
    snacks: "Snacks",
    drinks: "Drinks",
    freshProduce: "Fresh produce",
    healthFoods: "Health foods",
    clothingBags: "Clothing & bags",
    menSClothing: "Men's clothing",
    womenSClothing: "Women's clothing",
    bags: "Bags",
    accessories: "Accessories",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop-data-categories", content: t(content) };
export default dictionary;
