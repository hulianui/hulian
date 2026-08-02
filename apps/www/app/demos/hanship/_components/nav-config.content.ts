import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "project": "项目",
    "projectOverview": "项目概览",
    "deploymentHistory": "部署历史",
    "domainName": "域名",
    "environmentVariables": "环境变量",
    "buildSettings": "构建设置",
    "project2": "项目",
    "deploy": "部署",
    "deploymentHistory2": "部署历史",
    "domainName2": "域名",
    "configuration": "配置",
    "environmentVariables2": "环境变量",
    "buildSettings2": "构建设置",
  },
  en: {
    "project": "Project",
    "projectOverview": "Project overview",
    "deploymentHistory": "Deployment history",
    "domainName": "domain name",
    "environmentVariables": "environment variables",
    "buildSettings": "Build settings",
    "project2": "Project",
    "deploy": "deploy",
    "deploymentHistory2": "Deployment history",
    "domainName2": "domain name",
    "configuration": "Configuration",
    "environmentVariables2": "environment variables",
    "buildSettings2": "Build settings",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanship-components-nav-config",
  content: t(content),
};

export default dictionary;
