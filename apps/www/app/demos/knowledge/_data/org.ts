import { copy } from "./org.content";
import type { TreeNode } from "@hulianui/ui";
import type { Collaborator } from "./types";

// 右栏「访问权限」Tree 的数据源：瀚库公司组织架构（部门 → 小组 → 成员）。
// checkable 父子级联半选 —— 勾选谁能访问当前文档/文件夹（Google Drive 式按人/组授权）。
export const ORG_TREE: TreeNode[] = [
  {
    key: "rd",
    label: copy("rDCenter"),
    children: [
      {
        key: "rd-fe",
        label: copy("frontEndGroup"),
        children: [
          { key: "u-linyu", label: copy("forestIslandFrontEndLead") },
          { key: "u-chenmo", label: copy("chenMo") },
          { key: "u-zhaoyi", label: copy("zhaoYi") },
        ],
      },
      {
        key: "rd-be",
        label: copy("backendGroups"),
        children: [
          { key: "u-sunhao", label: copy("sunHao") },
          { key: "u-qianwen", label: copy("qianWen") },
        ],
      },
    ],
  },
  {
    key: "design",
    label: copy("designCenter"),
    children: [
      { key: "u-yangshu", label: copy("yangShuHeadOfDesign") },
      { key: "u-mojin", label: copy("moJin") },
    ],
  },
  {
    key: "pm",
    label: copy("productDepartment"),
    children: [
      { key: "u-zhouqi", label: copy("zhouQi") },
      { key: "u-wangya", label: copy("wangYa") },
    ],
  },
];

// 全体成员（协作者管理 Transfer 的数据源）。name 与 VaultNode.collaborators 对齐。
export interface Member {
  name: string;
  role: string;
}
export const MEMBERS: Member[] = [
  { name: copy("forestIsland"), role: copy("frontEndLead") },
  { name: copy("chenMo"), role: copy("frontEndEngineer") },
  { name: copy("zhaoYi"), role: copy("frontEndEngineer") },
  { name: copy("sunHao"), role: copy("backendEngineer") },
  { name: copy("qianWen"), role: copy("backendEngineer") },
  { name: copy("yangShu"), role: copy("headOfDesign") },
  { name: copy("moJin"), role: copy("visualDesign") },
  { name: copy("zhouQi"), role: copy("productManager") },
  { name: copy("wangYa"), role: copy("productManager") },
];

// 协作者池（详情面板 AvatarCircles + 版本作者），头像走本地 jpg（零外链）。
export const COLLABORATORS: Record<string, Collaborator> = {
  林屿: { name: copy("forestIsland"), role: copy("frontEndLead"), avatar: "/demo/avatar-1.jpg" },
  杨舒: { name: copy("yangShu"), role: copy("headOfDesign"), avatar: "/demo/avatar-2.jpg" },
  周琦: { name: copy("zhouQi"), role: copy("productManager"), avatar: "/demo/avatar-3.jpg" },
  陈墨: { name: copy("chenMo"), role: copy("frontEndEngineer"), avatar: "/demo/avatar-4.jpg" },
  孙昊: { name: copy("sunHao"), role: copy("backendEngineer"), avatar: "/demo/avatar-12.jpg" },
};
