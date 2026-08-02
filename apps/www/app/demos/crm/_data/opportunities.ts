import { copy } from "./opportunities.content";
import { canonicalOwner } from "./protocol";
import type { Opportunity } from "./types";

// 16 个商机，分布于漏斗各阶段（看板按 stage 分列；工作台统计金额/分布）。
export const opportunities: Opportunity[] = [
  { id: "O2001", title: copy("chenguangStationeryErpRenewal"), customerId: "C1001", customerName: copy("morningLightStationery"), stage: "商务谈判", amount: 480000, owner: canonicalOwner("linWanqing"), probability: 75, expectedCloseAt: "2026-06-20" },
  { id: "O2002", title: copy("yunqiTechnologySaasSeatExpansion"), customerId: "C1002", customerName: copy("yunqiTechnology"), stage: "方案报价", amount: 320000, owner: canonicalOwner("zhouMingyuan"), probability: 55, expectedCloseAt: "2026-06-28" },
  { id: "O2003", title: copy("baiweiCateringStoreManagementSystem"), customerId: "C1003", customerName: copy("baiweiCatering"), stage: "初步接触", amount: 86000, owner: canonicalOwner("highSensitivity"), probability: 30, expectedCloseAt: "2026-07-10" },
  { id: "O2004", title: copy("hengkangMedicalBiddingAndProcurementProject"), customerId: "C1004", customerName: copy("hengkangMedical"), stage: "赢单", amount: 1200000, owner: canonicalOwner("chenCe"), probability: 100, expectedCloseAt: "2026-05-21" },
  { id: "O2005", title: copy("zhixingEducationOnlineCoursePlatform"), customerId: "C1005", customerName: copy("knowledgeAndActionEducation"), stage: "线索", amount: 150000, owner: canonicalOwner("suXiao"), probability: 10, expectedCloseAt: "2026-08-01" },
  { id: "O2006", title: copy("shundaLogisticsTmsSchedulingUpgrade"), customerId: "C1006", customerName: copy("shundaLogistics"), stage: "商务谈判", amount: 360000, owner: canonicalOwner("linWanqing2"), probability: 70, expectedCloseAt: "2026-06-18" },
  { id: "O2007", title: copy("zhilianSoftwareCustomDevelopmentOutsourcing"), customerId: "C1011", customerName: copy("intelligentLinkSoftware"), stage: "方案报价", amount: 280000, owner: canonicalOwner("zhouMingyuan2"), probability: 50, expectedCloseAt: "2026-07-05" },
  { id: "O2008", title: copy("hailanAquaticProductsExportDeclarationSystem"), customerId: "C1012", customerName: copy("hailanAquaticProducts"), stage: "初步接触", amount: 98000, owner: canonicalOwner("highSensitivity2"), probability: 25, expectedCloseAt: "2026-07-15" },
  { id: "O2009", title: copy("ruikangPharmaceuticalGmpQualityTraceability"), customerId: "C1014", customerName: copy("ruikangPharmaceutical"), stage: "方案报价", amount: 540000, owner: canonicalOwner("chenCe2"), probability: 60, expectedCloseAt: "2026-06-30" },
  { id: "O2010", title: copy("jinsuiBankDataCenterPhaseIi"), customerId: "C1016", customerName: copy("goldenHarvestBank"), stage: "赢单", amount: 1800000, owner: canonicalOwner("zhouMingyuan3"), probability: 100, expectedCloseAt: "2026-05-15" },
  { id: "O2011", title: copy("youmiECommerceMarketingAutomation"), customerId: "C1017", customerName: copy("youmiECommerce"), stage: "初步接触", amount: 120000, owner: canonicalOwner("highSensitivity3"), probability: 30, expectedCloseAt: "2026-07-20" },
  { id: "O2012", title: copy("tiangongMachineryMesProductionLineTransformation"), customerId: "C1018", customerName: copy("tiangongMachinery"), stage: "输单", amount: 260000, owner: canonicalOwner("chenCe3"), probability: 0, expectedCloseAt: "2026-04-30" },
  { id: "O2013", title: copy("ruisiConsultingKnowledgeManagementPlatform"), customerId: "C1022", customerName: copy("ruisiConsulting"), stage: "线索", amount: 90000, owner: canonicalOwner("chenCe4"), probability: 15, expectedCloseAt: "2026-08-08" },
  { id: "O2014", title: copy("jiaheFoodTraceabilityMiniProgram"), customerId: "C1023", customerName: copy("jiaheFood"), stage: "初步接触", amount: 110000, owner: canonicalOwner("highSensitivity4"), probability: 35, expectedCloseAt: "2026-07-12" },
  { id: "O2015", title: copy("auroraNewEnergyChargingNetworkManagementPlatform"), customerId: "C1024", customerName: copy("auroraNewEnergy"), stage: "商务谈判", amount: 760000, owner: canonicalOwner("linWanqing3"), probability: 80, expectedCloseAt: "2026-06-25" },
  { id: "O2016", title: copy("dingfengRealEstateSmartParkSolution"), customerId: "C1009", customerName: copy("dingfengRealEstate"), stage: "方案报价", amount: 420000, owner: canonicalOwner("chenCe5"), probability: 45, expectedCloseAt: "2026-07-02" },
];
