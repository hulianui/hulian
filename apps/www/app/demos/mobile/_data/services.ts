import { serviceCover } from "../_lib/cover";
import type { Service, ServiceCategory } from "./types";

const SEED: Omit<Service, "cover">[] = [
  { id: "s1", title: "深度保洁 · 全屋", category: "家政保洁", price: 88, unit: "次", rating: 4.9, reviewCount: 2341, tag: "爆款", workerName: "张阿姨", workerAvatar: "张", description: "专业深度保洁，全屋彻底清洁，厨卫除垢，家具表面擦拭，地板打蜡。包工具包耗材，服务时长约 4 小时。" },
  { id: "s2", title: "空调清洗消毒", category: "家电维修", price: 59, unit: "台", rating: 4.8, reviewCount: 1876, tag: "好评", workerName: "李师傅", workerAvatar: "李", description: "专业空调清洗，高温蒸汽消毒，除霉杀菌，清洗内外机，提升制冷效率。可同时清洗多台，数量越多越优惠。" },
  { id: "s3", title: "上门美甲 · 精品款", category: "上门美甲", price: 128, unit: "次", rating: 4.9, reviewCount: 987, tag: "热门", workerName: "小雅", workerAvatar: "雅", description: "美甲师上门服务，精品款式，进口甲油，可选渐变、法式、钻饰。包工具，服务时长约 90 分钟。" },
  { id: "s4", title: "马桶/下水道疏通", category: "管道疏通", price: 99, unit: "次", rating: 4.7, reviewCount: 654, tag: "急修", workerName: "王师傅", workerAvatar: "王", description: "专业疏通师，高压水枪疏通，彻底清除堵塞。小时内上门，疏通不通不收费。适用马桶、厨房下水、地漏。" },
  { id: "s5", title: "小型搬家·整屋打包", category: "搬家搬运", price: 199, unit: "次", rating: 4.8, reviewCount: 1123, tag: "包搬运", workerName: "搬运队", workerAvatar: "搬", description: "2 人搬运团队，专业打包材料，小心搬运，覆盖家具贴膜保护。3 小时内完成，超时另议。" },
  { id: "s6", title: "开锁·换锁芯", category: "开锁换锁", price: 80, unit: "次", rating: 4.6, reviewCount: 432, tag: "快速上门", workerName: "陈师傅", workerAvatar: "陈", description: "专业开锁师傅，30 分钟内上门，各品牌防盗门可开。如需换锁芯，提供多品牌锁芯，当场安装。" },
  { id: "s7", title: "热水器安装/维修", category: "家电维修", price: 79, unit: "次", rating: 4.7, reviewCount: 789, tag: "保修", workerName: "刘师傅", workerAvatar: "刘", description: "热水器安装、故障维修、水垢清洗。支持燃气热水器、电热水器、即热式。维修后保修 3 个月。" },
  { id: "s8", title: "日常保洁 · 2 小时", category: "家政保洁", price: 58, unit: "次", rating: 4.8, reviewCount: 3102, tag: "超值", workerName: "孙阿姨", workerAvatar: "孙", description: "日常家务保洁，扫地拖地、厨房台面、卫生间清洁、整理归纳。适合维持日常卫生，服务时长 2 小时。" },
];

export interface ServiceWithCover extends Service {
  cover: string;
}

export const services: ServiceWithCover[] = SEED.map((s) => ({
  ...s,
  cover: serviceCover(s.category, s.title),
}));

export const CATEGORIES: ServiceCategory[] = ["家政保洁", "家电维修", "上门美甲", "管道疏通", "搬家搬运", "开锁换锁"];

export function getService(id: string): ServiceWithCover | undefined {
  return services.find((s) => s.id === id);
}

export function servicesByCategory(cat: ServiceCategory): ServiceWithCover[] {
  return services.filter((s) => s.category === cat);
}
