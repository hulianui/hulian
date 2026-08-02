import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "yunqiDataCenterMechanicalAndElectricalInstallation": "云栖数据中心机电安装工程",
    "yunqiTechnologyCoLtd": "云栖科技股份有限公司",
    "ruikangPharmaceuticalGmpCleanWorkshopDecorationProject": "瑞康制药 GMP 洁净车间装饰工程",
    "ruikangPharmaceuticalCoLtd": "瑞康制药有限公司",
    "yunqiDataCenterMechanicalAndElectricalInstallation2": "云栖数据中心机电安装工程",
    "yunqiTechnologyCoLtd2": "云栖科技股份有限公司",
    "auroraNewEnergyChargingStationElectricalInstallation": "极光新能源充电站电气安装",
    "auroraNewEnergyTechnologyCompany": "极光新能源科技公司",
  },
  en: {
    "yunqiDataCenterMechanicalAndElectricalInstallation": "Yunqi Data Center Mechanical and Electrical Installation Project",
    "yunqiTechnologyCoLtd": "Yunqi Technology Co., Ltd.",
    "ruikangPharmaceuticalGmpCleanWorkshopDecorationProject": "Ruikang Pharmaceutical GMP clean workshop decoration project",
    "ruikangPharmaceuticalCoLtd": "Ruikang Pharmaceutical Co., Ltd.",
    "yunqiDataCenterMechanicalAndElectricalInstallation2": "Yunqi Data Center Mechanical and Electrical Installation Project",
    "yunqiTechnologyCoLtd2": "Yunqi Technology Co., Ltd.",
    "auroraNewEnergyChargingStationElectricalInstallation": "Aurora New Energy Charging Station Electrical Installation",
    "auroraNewEnergyTechnologyCompany": "Aurora New Energy Technology Company",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-projects-data-checkouts",
  content: t(content),
};

export default dictionary;
