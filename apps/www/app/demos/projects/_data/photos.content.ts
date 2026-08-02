import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    chilledWaterMainInstallation: "冷冻机房主管道安装",
    cableTrayInstallationAccepted: "桥架敷设完成验收",
    yjvCableDeliveryInspection: "YJV 电缆进场点验",
    switchgearPositioned: "配电柜就位",
    hepaOutletCleanlinessTest: "高效送风口洁净度检测",
    cleanroomPanelCornerFinish: "彩钢板隔墙阴角处理",
    epoxyFloorInstallation: "环氧自流平地面施工",
    passThroughSealRemediation: "传递窗密封待整改",
    dcChargerFoundationPour: "直流充电桩基础浇筑",
    distributionBoxGroundingRemediation: "配电箱接地待整改",
    substationPositioned: "箱式变电站吊装就位",
    vrvUnitsDelivered: "VRV 室外机分批进场",
    galvanizedDuctPrefabrication: "镀锌风管预制加工",
    refrigerantPipeSupportInstallation: "冷媒铜管支架安装",
    refrigerationUnitCompletionPhoto: "冷库制冷机组竣工照",
    coldRoomPullDownTest: "库温降温曲线测试",
    fanCoilReplacementCompleted: "客房风机盘管更换完成",
    coolingTowerFoundationReinforcement: "冷却塔基础加固",
    buswayHorizontalInstallation: "母线槽水平安装",
    groundingResistanceTest: "接地电阻测试记录",
    cleanroomHvacCommissioning: "净化空调系统调试",
    cableTrayBondingJumper: "电缆桥架跨接线",
    serviceShaftFirestopRemediation: "管井防火封堵待补",
    coldRoomPanelsDelivered: "聚氨酯冷库板进场",
    hongjiMepCrew: "鸿基机电班组",
    engineerChen: "陈工",
    jindingFitOutCrew: "金顶装饰队",
    zhouLei: "周磊",
    hengtongInstallationCrew: "恒通安装队",
    gaoMin: "高敏",
    yuandaHvacCrew: "远大暖通队",
    suJianguo: "苏建国",
  },
  en: {
    chilledWaterMainInstallation: "Main chilled-water piping installation",
    cableTrayInstallationAccepted: "Cable tray installation accepted",
    yjvCableDeliveryInspection: "YJV cable delivery inspection",
    switchgearPositioned: "Switchgear positioned",
    hepaOutletCleanlinessTest: "HEPA outlet cleanliness test",
    cleanroomPanelCornerFinish: "Cleanroom panel internal corner finish",
    epoxyFloorInstallation: "Epoxy self-leveling floor installation",
    passThroughSealRemediation: "Pass-through box seal requires remediation",
    dcChargerFoundationPour: "DC charger foundation pour",
    distributionBoxGroundingRemediation: "Distribution box grounding requires remediation",
    substationPositioned: "Prefabricated substation hoisted into position",
    vrvUnitsDelivered: "VRV outdoor units delivered in batches",
    galvanizedDuctPrefabrication: "Galvanized duct prefabrication",
    refrigerantPipeSupportInstallation: "Refrigerant copper pipe support installation",
    refrigerationUnitCompletionPhoto: "Cold-storage refrigeration unit completion photo",
    coldRoomPullDownTest: "Cold-room temperature pull-down curve test",
    fanCoilReplacementCompleted: "Guest-room fan coil replacement completed",
    coolingTowerFoundationReinforcement: "Cooling-tower foundation reinforcement",
    buswayHorizontalInstallation: "Busway horizontal installation",
    groundingResistanceTest: "Grounding resistance test record",
    cleanroomHvacCommissioning: "Cleanroom HVAC system commissioning",
    cableTrayBondingJumper: "Cable tray bonding jumper",
    serviceShaftFirestopRemediation: "Service-shaft firestop requires completion",
    coldRoomPanelsDelivered: "Polyurethane cold-room panels delivered",
    hongjiMepCrew: "Hongji MEP Crew",
    engineerChen: "Engineer Chen",
    jindingFitOutCrew: "Jinding Fit-Out Crew",
    zhouLei: "Zhou Lei",
    hengtongInstallationCrew: "Hengtong Installation Crew",
    gaoMin: "Gao Min",
    yuandaHvacCrew: "Yuanda HVAC Crew",
    suJianguo: "Su Jianguo",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey): string {
  return content[DOCS_LOCALE][key];
}

const dictionary: Dictionary = {
  key: "demo-projects-data-photos",
  content: t(content),
};

export default dictionary;
