import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    groupOrg: "组织",
    groupOps: "运营",
    groupConfig: "配置",
    overview: "组织总览",
    floor: "工位图",
    people: "人员名录",
    interviews: "面试安排",
    departments: "部门分区",
    settings: "设置",
  },
  en: {
    groupOrg: "Organization",
    groupOps: "Operations",
    groupConfig: "Configuration",
    overview: "Overview",
    floor: "Seat map",
    people: "People",
    interviews: "Interviews",
    departments: "Departments",
    settings: "Settings",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey): string {
  return content[DOCS_LOCALE][key];
}

const dictionary: Dictionary = {
  key: "demo-org-classroom-components-nav-config",
  content: t(content),
};

export default dictionary;
