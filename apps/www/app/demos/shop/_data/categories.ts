import { copy } from "./categories.content";
import type { Category } from "./types";

// 商品分类树：MegaMenu 展开 + 商品列表筛选共用。
export const categories: Category[] = [
  {
    key: "digital",
    name: copy("tech"),
    hue: 212,
    children: [
      { key: "phone", name: copy("phonesMobile") },
      { key: "laptop", name: copy("computersOffice") },
      { key: "audio", name: copy("audioHeadphones") },
      { key: "wearable", name: copy("wearables") },
    ],
  },
  {
    key: "home",
    name: copy("homeLiving"),
    hue: 28,
    children: [
      { key: "kitchen", name: copy("kitchenAppliances") },
      { key: "furniture", name: copy("furnitureStorage") },
      { key: "bedding", name: copy("beddingTextiles") },
      { key: "lighting", name: copy("lighting") },
    ],
  },
  {
    key: "beauty",
    name: copy("beautyCare"),
    hue: 332,
    children: [
      { key: "skincare", name: copy("skinCare") },
      { key: "makeup", name: copy("makeup") },
      { key: "fragrance", name: copy("fragrance") },
      { key: "personal", name: copy("personalCare") },
    ],
  },
  {
    key: "outdoor",
    name: copy("sportsOutdoors"),
    hue: 152,
    children: [
      { key: "fitness", name: copy("fitness") },
      { key: "camping", name: copy("campingHiking") },
      { key: "cycling", name: copy("cyclingGear") },
      { key: "shoes", name: copy("athleticShoes") },
    ],
  },
  {
    key: "grocery",
    name: copy("foodGrocery"),
    hue: 96,
    children: [
      { key: "snack", name: copy("snacks") },
      { key: "drink", name: copy("drinks") },
      { key: "fresh", name: copy("freshProduce") },
      { key: "health", name: copy("healthFoods") },
    ],
  },
  {
    key: "apparel",
    name: copy("clothingBags"),
    hue: 268,
    children: [
      { key: "men", name: copy("menSClothing") },
      { key: "women", name: copy("womenSClothing") },
      { key: "bag", name: copy("bags") },
      { key: "accessory", name: copy("accessories") },
    ],
  },
];

export const categoryByKey = Object.fromEntries(categories.map((c) => [c.key, c]));
