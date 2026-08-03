import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    details: "详情",
    selectADocumentOrFileToViewCollaboratorsVersionsAnd:
      "选择一个文档或文件查看协作者、版本与权限。",
    updatedCollaborators: "已更新协作者",
    memberCount: "{0} 人",
    tagRemoved: "已移除标签",
    tagAlreadyExists: "标签已存在",
    labelAdded: "已添加标签",
    type: "类型",
    folder: "文件夹",
    document: "文档",
    image: "图片",
    file: "文件",
    creator: "创建者",
    lastModified: "最后修改",
    collaborators: "协作者",
    manage: "管理",
    noCollaboratorsYet: "暂无协作者",
    tag: "标签",
    noTags: "无标签",
    tagName: "标签名",
    add: "添加",
    versionHistory: "版本历史",
    access: "访问权限",
    checkTheDepartmentsMembersParentChildCascadeThatHaveAccess:
      "勾选可访问该内容的部门 / 成员（父子级联）。",
    accessUpdated: "已更新访问权限",
    selectedNodeCount: "{0} 个节点",
    manageCollaborators: "管理协作者",
    addMembersToTheCollaboratorsOnTheRightToCollaborate:
      "把成员加入右侧「协作者」即可参与该内容协作。",
    allMembers: "全体成员",
    searchMembers: "搜索成员",
    cancel: "取消",
    save: "保存",
  },
  en: {
    details: "Details",
    selectADocumentOrFileToViewCollaboratorsVersionsAnd:
      "Select a document or file to view collaborators, versions, and permissions.",
    updatedCollaborators: "Updated collaborators",
    memberCount: "{0} people",
    tagRemoved: "Tag removed",
    tagAlreadyExists: "Tag already exists",
    labelAdded: "Label added",
    type: "Type",
    folder: "Folder",
    document: "Document",
    image: "Image",
    file: "File",
    creator: "Creator",
    lastModified: "Last modified",
    collaborators: "Collaborators",
    manage: "Manage",
    noCollaboratorsYet: "No collaborators yet",
    tag: "Tag",
    noTags: "No tags",
    tagName: "Tag name",
    add: "Add",
    versionHistory: "Version history",
    access: "Access",
    checkTheDepartmentsMembersParentChildCascadeThatHaveAccess:
      "Choose the teams and members who can access this content. Parent selections include their children.",
    accessUpdated: "Access updated",
    selectedNodeCount: "{0} nodes",
    manageCollaborators: "Manage collaborators",
    addMembersToTheCollaboratorsOnTheRightToCollaborate:
      'Add members under "Collaborators" to work on this content together.',
    allMembers: "All members",
    searchMembers: "Search members",
    cancel: "Cancel",
    save: "Save",
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
  key: "demo-knowledge-components-detail-panel",
  content: t(content),
};

export default dictionary;
