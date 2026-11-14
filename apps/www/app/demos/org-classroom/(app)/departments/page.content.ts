import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    title: "部门分区",
    subtitle: "部门决定工位图上的分区、朝向与分区色。新增部门会自带一排空工位。",
    addDepartment: "新增部门",
    editDepartment: "编辑部门",
    name: "部门名称",
    namePlaceholder: "例如：商业化中心",
    nameRequired: "请输入部门名称",
    floor: "楼层 / 区域",
    floorPlaceholder: "例如：5F · 北区",
    lead: "负责人",
    leadPlaceholder: "选择负责人",
    noLead: "待指定",
    accent: "分区色",
    accentPrimary: "主色",
    accentInfo: "信息色",
    accentSuccess: "成功色",
    accentWarning: "警告色",
    accentDanger: "危险色",
    facing: "座位朝向",
    save: "保存",
    edit: "编辑",
    remove: "移除部门",
    removeTitle: "移除 {0}？",
    removeDesc: "该部门没有成员，移除后分区与空工位会一起删除。",
    removeBlocked: "部门内还有成员，先把他们移出工位并调整部门后才能删除。",
    createdToast: "部门已创建",
    createdToastDesc: "{0} 已加入组织",
    updatedToast: "部门已更新",
    updatedToastDesc: "{0} 的分区设置已保存",
    removedToast: "部门已移除",
    removedToastDesc: "{0} 已从组织中移除",
    members: "{0} 名成员",
    seats: "{0} 个工位",
    occupancy: "{0}% 使用率",
    loadFailed: "部门分区加载失败",
    retry: "重试",
    emptyTitle: "还没有部门",
    emptyDesc: "新增一个部门开始布置工位。",
  },
  en: {
    title: "Departments",
    subtitle:
      "Departments drive the zones, facing and accent color on the seat map. A new department starts with a row of empty seats.",
    addDepartment: "Add department",
    editDepartment: "Edit department",
    name: "Department name",
    namePlaceholder: "e.g. Commercial",
    nameRequired: "Enter a department name",
    floor: "Floor / area",
    floorPlaceholder: "e.g. 5F · North",
    lead: "Lead",
    leadPlaceholder: "Choose a lead",
    noLead: "Not assigned",
    accent: "Zone color",
    accentPrimary: "Primary",
    accentInfo: "Info",
    accentSuccess: "Success",
    accentWarning: "Warning",
    accentDanger: "Danger",
    facing: "Seat facing",
    save: "Save",
    edit: "Edit",
    remove: "Remove department",
    removeTitle: "Remove {0}?",
    removeDesc: "This department has no members. Removing it also deletes the zone and its empty seats.",
    removeBlocked: "This department still has members. Move them out of their seats and reassign them first.",
    createdToast: "Department created",
    createdToastDesc: "{0} joined the organization",
    updatedToast: "Department updated",
    updatedToastDesc: "Zone settings for {0} were saved",
    removedToast: "Department removed",
    removedToastDesc: "{0} was removed from the organization",
    members: "{0} members",
    seats: "{0} seats",
    occupancy: "{0}% occupied",
    loadFailed: "Failed to load departments",
    retry: "Retry",
    emptyTitle: "No departments yet",
    emptyDesc: "Add a department to start laying out seats.",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-org-classroom-app-departments-page",
  content: t(content),
};

export default dictionary;
