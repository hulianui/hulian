import { copy } from "./quotes.content";
import type { Quote, QuoteItem } from "./types";

// 报价单 mock：挂在项目下，覆盖草稿/已发送/已确认/已失效四态。明细行项供 EditableTable 实时算价。

export const quotes: Quote[] = [
  {
    id: "q1",
    code: "QT-2026-001",
    projectId: "p1",
    projectName: copy("yunqiDataCenterMechanicalAndElectricalInstallation"),
    client: copy("yunqiTechnologyCoLtd"),
    owner: copy("chenGong"),
    createdAt: "2026-03-08",
    validUntil: "2026-04-08",
    taxRate: 0.09,
    status: "已确认",
    remark: copy("includesMainMaterialsAuxiliaryMaterialsAndInstallation"),
    items: [
      { id: "q1i1", name: copy("galvanizedBridgeAndAccessories"), spec: copy("hotDipGalvanized"), unit: copy("meters"), qty: 860, price: 145 },
      { id: "q1i2", name: copy("cableLayingYjv"), spec: "4×95+1×50", unit: copy("meters2"), qty: 1200, price: 198 },
      { id: "q1i3", name: copy("refrigerationUnitInstallation"), spec: copy("centrifugalRt"), unit: copy("taiwan"), qty: 2, price: 86000 },
      { id: "q1i4", name: copy("installationAndDebuggingOfPowerDistributionCabinet"), spec: copy("gckLowVoltageCabinet"), unit: copy("noodles"), qty: 12, price: 9800 },
      { id: "q1i5", name: copy("pipeInsulation"), spec: copy("rubberAndPlasticGradeB1"), unit: copy("squareMeters"), qty: 540, price: 68 },
    ],
  },
  {
    id: "q2",
    code: "QT-2026-002",
    projectId: "p4",
    projectName: copy("chenguangCommercialComplexHeatingAndVentilationProject"),
    client: copy("chenguangRealEstateGroup"),
    owner: copy("suJianguo"),
    createdAt: "2026-04-22",
    validUntil: "2026-05-22",
    taxRate: 0.09,
    status: "已确认",
    remark: copy("constructionWillBeCarriedOutInTwo"),
    items: [
      { id: "q2i1", name: copy("multiLineOutdoorUnit"), spec: "VRV 56kW", unit: copy("taiwan2"), qty: 18, price: 78000 },
      { id: "q2i2", name: copy("airDuctProductionAndInstallation"), spec: copy("galvanized"), unit: copy("squareMeters2"), qty: 2600, price: 168 },
      { id: "q2i3", name: copy("fanCoilUnit"), spec: "FP-102", unit: copy("taiwan3"), qty: 240, price: 1850 },
      { id: "q2i4", name: copy("refrigerantCopperPipe"), spec: "Φ9.52~Φ41.3", unit: copy("meters3"), qty: 3200, price: 96 },
    ],
  },
  {
    id: "q3",
    code: "QT-2026-003",
    projectId: "p5",
    projectName: copy("zhixingEducationExperimentalBuildingWeakCurrentIntelligentizatio"),
    client: copy("zhixingEducationTechnologyCompany"),
    owner: copy("liTao"),
    createdAt: "2026-05-30",
    validUntil: "2026-06-30",
    taxRate: 0.06,
    status: "已发送",
    remark: copy("generalContractingOfWeakCurrentIntelligentSystems"),
    items: [
      { id: "q3i1", name: copy("integratedWiring"), spec: copy("categoryUnshielded"), unit: copy("point"), qty: 680, price: 280 },
      { id: "q3i2", name: copy("networkSwitch"), spec: copy("gConvergence"), unit: copy("taiwan4"), qty: 8, price: 22000 },
      { id: "q3i3", name: copy("videoSurveillance"), spec: copy("millionHemispheres"), unit: copy("road"), qty: 120, price: 1280 },
      { id: "q3i4", name: copy("allInOneAccessControlMachine"), spec: copy("faceRecognition"), unit: copy("taiwan5"), qty: 36, price: 3600 },
    ],
  },
  {
    id: "q4",
    code: "QT-2026-004",
    projectId: "p8",
    projectName: copy("xinghaiSquareLandscapeLightingProject"),
    client: copy("xinghaiCulturalTourismInvestmentCompany"),
    owner: copy("highSensitivity"),
    createdAt: "2026-06-02",
    validUntil: "2026-07-02",
    taxRate: 0.09,
    status: "草稿",
    remark: copy("thePlanWillBeAdjustedAfterParty"),
    items: [
      { id: "q4i1", name: copy("ledFloodLight"), spec: copy("wFullColor"), unit: copy("set"), qty: 180, price: 1680 },
      { id: "q4i2", name: copy("lineLight"), spec: copy("dmx512Controllable"), unit: copy("meters4"), qty: 2400, price: 88 },
      { id: "q4i3", name: copy("lightingControlSystem"), spec: copy("centralController"), unit: copy("set2"), qty: 1, price: 128000 },
    ],
  },
  {
    id: "q5",
    code: "QT-2026-005",
    projectId: "p3",
    projectName: copy("auroraNewEnergyChargingStationElectricalInstallation"),
    client: copy("auroraNewEnergyTechnologyCompany"),
    owner: copy("highSensitivity2"),
    createdAt: "2026-03-26",
    validUntil: "2026-04-26",
    taxRate: 0.09,
    status: "已确认",
    remark: copy("chargingPilePowerDistributionAndLightningProtection"),
    items: [
      { id: "q5i1", name: copy("dcChargingPileInstallation"), spec: copy("kwDoubleGun"), unit: copy("taiwan6"), qty: 16, price: 6800 },
      { id: "q5i2", name: copy("boxTypeSubstation"), spec: "630kVA", unit: copy("seat"), qty: 1, price: 158000 },
      { id: "q5i3", name: copy("cableLaying"), spec: "YJV22 4×185", unit: copy("meters5"), qty: 680, price: 320 },
    ],
  },
  {
    id: "q6",
    code: "QT-2026-006",
    projectId: "p2",
    projectName: copy("ruikangPharmaceuticalGmpCleanWorkshopDecorationProject"),
    client: copy("ruikangPharmaceuticalCoLtd"),
    owner: copy("zhouLei"),
    createdAt: "2026-02-10",
    validUntil: "2026-03-10",
    taxRate: 0.09,
    status: "已失效",
    remark: copy("theFirstEditionQuotationIsSubjectTo"),
    items: [
      { id: "q6i1", name: copy("colorSteelPlatePartitionWall"), spec: copy("mmRockWool"), unit: copy("squareMeters3"), qty: 1800, price: 320 },
      { id: "q6i2", name: copy("efficientAirOutlet"), spec: "484×484", unit: copy("a"), qty: 160, price: 1200 },
    ],
  },
];

/** 行小计 = 数量 × 单价。 */
export function lineTotal(item: QuoteItem): number {
  return item.qty * item.price;
}

/** 合计：不含税、税额、价税合计。 */
export function quoteTotals(items: QuoteItem[], taxRate: number) {
  const subtotal = items.reduce((s, it) => s + lineTotal(it), 0);
  const tax = Math.round(subtotal * taxRate);
  return { subtotal, tax, total: subtotal + tax };
}

export function quoteById(id: string): Quote | undefined {
  return quotes.find((q) => q.id === id);
}
