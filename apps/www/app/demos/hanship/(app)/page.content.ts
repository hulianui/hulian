import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "noDeploymentYet": "暂无部署",
    "valueDomains": "{0} 个域名",
    "defaultDomainName": "默认域名",
    "pleaseEnterProjectName": "请输入项目名",
    "pleaseEnterTheRepositoryOrgRepo": "请输入仓库 org/repo",
    "pleaseEnterTheProductionBranch": "请输入生产分支",
    "projectCreated": "项目已创建",
    "valueIsConnectedToValueAndWill": "{0} 已连接 {1}，推送到 {2} 即自动部署。",
    "project": "项目",
    "projectsGitConnectedAutomaticDeploymentToGlobal": "个项目 · 连 Git 自动部署到全球边缘网络",
    "searchItemsWarehouses": "搜索项目 / 仓库",
    "searchItems": "搜索项目",
    "newProject": "新建项目",
    "noItemsMatchingValue": "没有匹配「{0}」的项目",
    "noProjectsYet": "还没有项目",
    "changeTheKeywordOrCreateANew": "换个关键词，或新建一个项目。",
    "connectToAGitRepositoryToStart": "连接一个 Git 仓库开始你的第一次部署。",
    "clearSearch": "清除搜索",
    "newProject2": "新建项目",
    "newProject3": "新建项目",
    "createAndDeploy": "创建并部署",
    "projectName": "项目名",
    "suchAsHanshipDocs": "如：hanship-docs",
    "gitRepository": "Git 仓库",
    "orgRepoSuchAsHulianuiHulian": "org/repo，如 hulianui/hulian",
    "framePresets": "框架预设",
    "productionBranch": "生产分支",
    "automaticDeployment": "自动部署",
    "automaticallyTriggerDeploymentWhenPushingToProduction": "推送到生产分支时自动触发部署",
    "automaticDeployment2": "自动部署",
    "staticSite": "静态站点",
  },
  en: {
    "noDeploymentYet": "No deployment yet",
    "valueDomains": "{0} domains",
    "defaultDomainName": "Default domain name",
    "pleaseEnterProjectName": "Please enter project name",
    "pleaseEnterTheRepositoryOrgRepo": "Please enter the repository org/repo",
    "pleaseEnterTheProductionBranch": "Please enter the production branch",
    "projectCreated": "Project created",
    "valueIsConnectedToValueAndWill": "{0} is connected to {1} and will be automatically deployed when pushed to {2}.",
    "project": "Project",
    "projectsGitConnectedAutomaticDeploymentToGlobal": "Projects · Git-connected automatic deployment to global edge networks",
    "searchItemsWarehouses": "Search projects or repositories",
    "searchItems": "Search items",
    "newProject": "New project",
    "noItemsMatchingValue": "No items matching '{0}'",
    "noProjectsYet": "No projects yet",
    "changeTheKeywordOrCreateANew": "Change the keyword, or create a new project.",
    "connectToAGitRepositoryToStart": "Connect to a Git repository to start your first deployment.",
    "clearSearch": "Clear search",
    "newProject2": "New project",
    "newProject3": "New project",
    "createAndDeploy": "Create and deploy",
    "projectName": "Project name",
    "suchAsHanshipDocs": "Such as: Hanship-docs",
    "gitRepository": "Git repository",
    "orgRepoSuchAsHulianuiHulian": "org/repo, such as hulianui/hulian",
    "framePresets": "Frame presets",
    "productionBranch": "production branch",
    "automaticDeployment": "Automatic deployment",
    "automaticallyTriggerDeploymentWhenPushingToProduction": "Automatically trigger deployment when pushing to production branch",
    "automaticDeployment2": "Automatic deployment",
    "staticSite": "Static site",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanship-app-page",
  content: t(content),
};

export default dictionary;
