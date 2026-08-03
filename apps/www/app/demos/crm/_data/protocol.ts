import type { CustomerIndustry, CustomerOwner } from "./types";

const INDUSTRY_BY_KEY: Record<string, CustomerIndustry> = {
  manufacturing: "制造",
  internet: "互联网",
  catering: "餐饮",
  medical: "医疗",
  education: "教育",
  logistics: "物流",
  media: "传媒",
  realEstate: "地产",
  agriculture: "农业",
  trade: "贸易",
  finance: "金融",
  retail: "零售",
  travel: "出行",
  buildingMaterials: "建材",
  consultation: "咨询",
  food: "食品",
  energy: "能源",
};

export function canonicalOwner(key: string): CustomerOwner {
  if (key.startsWith("linWanqing")) return "林晚晴";
  if (key.startsWith("zhouMingyuan")) return "周明远";
  if (key.startsWith("highSensitivity")) return "高敏";
  if (key.startsWith("chenCe")) return "陈策";
  if (key.startsWith("suXiao")) return "苏晓";
  throw new Error(`Unknown CRM owner key: ${key}`);
}

export function canonicalIndustry(key: string): CustomerIndustry {
  const base = key.replace(/\d+$/, "");
  const industry = INDUSTRY_BY_KEY[base];
  if (!industry) throw new Error(`Unknown CRM industry key: ${key}`);
  return industry;
}
