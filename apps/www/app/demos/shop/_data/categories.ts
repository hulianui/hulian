import type { Category } from "./types";

// 商品分类树：MegaMenu 展开 + 商品列表筛选共用。
export const categories: Category[] = [
  {
    key: "digital",
    name: "数码 3C",
    hue: 212,
    children: [
      { key: "phone", name: "手机通讯" },
      { key: "laptop", name: "电脑办公" },
      { key: "audio", name: "影音耳机" },
      { key: "wearable", name: "智能穿戴" },
    ],
  },
  {
    key: "home",
    name: "家居生活",
    hue: 28,
    children: [
      { key: "kitchen", name: "厨房料理" },
      { key: "furniture", name: "家具收纳" },
      { key: "bedding", name: "床品布艺" },
      { key: "lighting", name: "灯具照明" },
    ],
  },
  {
    key: "beauty",
    name: "美妆个护",
    hue: 332,
    children: [
      { key: "skincare", name: "护肤" },
      { key: "makeup", name: "彩妆" },
      { key: "fragrance", name: "香水" },
      { key: "personal", name: "个人护理" },
    ],
  },
  {
    key: "outdoor",
    name: "运动户外",
    hue: 152,
    children: [
      { key: "fitness", name: "健身训练" },
      { key: "camping", name: "露营徒步" },
      { key: "cycling", name: "骑行装备" },
      { key: "shoes", name: "运动鞋" },
    ],
  },
  {
    key: "grocery",
    name: "食品生鲜",
    hue: 96,
    children: [
      { key: "snack", name: "休闲零食" },
      { key: "drink", name: "酒水饮料" },
      { key: "fresh", name: "时令生鲜" },
      { key: "health", name: "健康滋补" },
    ],
  },
  {
    key: "apparel",
    name: "服饰箱包",
    hue: 268,
    children: [
      { key: "men", name: "男装" },
      { key: "women", name: "女装" },
      { key: "bag", name: "箱包" },
      { key: "accessory", name: "配饰" },
    ],
  },
];

export const categoryByKey = Object.fromEntries(categories.map((c) => [c.key, c]));
