import { copy } from "./services.content";
import { serviceCover } from "../_lib/cover";
import type { Service, ServiceCategory, ServiceTag } from "./types";

export const CATEGORIES: ServiceCategory[] = ["家政保洁", "家电维修", "上门美甲", "管道疏通", "搬家搬运", "开锁换锁"];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  家政保洁: copy("homeCleaning"),
  家电维修: copy("applianceRepair"),
  上门美甲: copy("atHomeManicure"),
  管道疏通: copy("drainClearing"),
  搬家搬运: copy("movingServices"),
  开锁换锁: copy("locksmith"),
};

export const SERVICE_TAG_LABELS: Record<ServiceTag, string> = {
  bestseller: copy("bestseller"),
  topRated: copy("topRated"),
  popular: copy("popular"),
  urgentRepair: copy("urgentRepair"),
  movingIncluded: copy("movingIncluded"),
  fastArrival: copy("fastArrival"),
  warranty: copy("warranty"),
  greatValue: copy("greatValue"),
};

export const SERVICE_TAG_TONES: Record<ServiceTag, "neutral" | "brand" | "success" | "warning" | "danger"> = {
  bestseller: "danger",
  topRated: "success",
  popular: "warning",
  urgentRepair: "danger",
  movingIncluded: "neutral",
  fastArrival: "danger",
  warranty: "success",
  greatValue: "warning",
};

const SEED: Omit<Service, "cover">[] = [
  { id: "s1", title: copy("deepWholeHomeCleaning"), category: "家政保洁", price: 88, unit: copy("service"), rating: 4.9, reviewCount: 2341, tag: "bestseller", workerName: copy("msZhang"), workerAvatar: copy("zhang"), description: copy("aThoroughWholeHomeCleanByAProfessionalIncludingKitchenAndBathroomDescalingFurnitureWipeDownsAndF") },
  { id: "s2", title: copy("airConditionerCleaningAndSanitizing"), category: "家电维修", price: 59, unit: copy("unit"), rating: 4.8, reviewCount: 1876, tag: "topRated", workerName: copy("mrLi"), workerAvatar: copy("li"), description: copy("professionalAirConditionerCleaningWithHighTemperatureSteamSanitizingMoldRemovalAndFullIndoorAndO") },
  { id: "s3", title: copy("premiumAtHomeManicure"), category: "上门美甲", price: 128, unit: copy("service"), rating: 4.9, reviewCount: 987, tag: "popular", workerName: copy("xiaoya"), workerAvatar: copy("y"), description: copy("anAtHomeManicureWithPremiumDesignsAndImportedPolishChooseGradientsFrenchTipsOrCrystalAccentsTool") },
  { id: "s4", title: copy("toiletAndDrainClearing"), category: "管道疏通", price: 99, unit: copy("service"), rating: 4.7, reviewCount: 654, tag: "urgentRepair", workerName: copy("mrWang"), workerAvatar: copy("wang"), description: copy("aProfessionalTechnicianClearsStubbornBlockagesWithAHighPressureWaterJetSameDayArrivalAndNoCharge") },
  { id: "s5", title: copy("smallMoveWithFullHomePacking"), category: "搬家搬运", price: 199, unit: copy("service"), rating: 4.8, reviewCount: 1123, tag: "movingIncluded", workerName: copy("movingTeam"), workerAvatar: copy("m"), description: copy("aTwoPersonMovingTeamWithProfessionalPackingMaterialsAndProtectiveFurnitureWrappingDesignedToFini") },
  { id: "s6", title: copy("lockOpeningAndCylinderReplacement"), category: "开锁换锁", price: 80, unit: copy("service"), rating: 4.6, reviewCount: 432, tag: "fastArrival", workerName: copy("mrChen"), workerAvatar: copy("chen"), description: copy("aProfessionalLocksmithArrivesWithin30MinutesAndCanOpenMajorBrandsOfSecurityDoorsReplacementCylin") },
  { id: "s7", title: copy("waterHeaterInstallationAndRepair"), category: "家电维修", price: 79, unit: copy("service"), rating: 4.7, reviewCount: 789, tag: "warranty", workerName: copy("mrLiu"), workerAvatar: copy("liu"), description: copy("installationRepairsAndDescalingForGasElectricAndTanklessWaterHeatersRepairsIncludeAThreeMonthWar") },
  { id: "s8", title: copy("routineCleaning2Hours"), category: "家政保洁", price: 58, unit: copy("service"), rating: 4.8, reviewCount: 3102, tag: "greatValue", workerName: copy("msSun"), workerAvatar: copy("sun"), description: copy("routineHomeCleaningCoveringFloorsKitchenCountersBathroomsAndLightTidyingIdealForRegularUpkeepSer") },
];

export interface ServiceWithCover extends Service {
  cover: string;
}

export const services: ServiceWithCover[] = SEED.map((s) => ({
  ...s,
  cover: serviceCover(s.category, s.title, SERVICE_CATEGORY_LABELS[s.category]),
}));

export function getService(id: string): ServiceWithCover | undefined {
  return services.find((s) => s.id === id);
}

export function servicesByCategory(cat: ServiceCategory): ServiceWithCover[] {
  return services.filter((s) => s.category === cat);
}
