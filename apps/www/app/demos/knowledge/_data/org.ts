import type { TreeNode } from "@hulianui/ui";
import type { Collaborator } from "./types";

// 右栏「访问权限」Tree 的数据源：瀚库公司组织架构（部门 → 小组 → 成员）。
// checkable 父子级联半选 —— 勾选谁能访问当前文档/文件夹（Google Drive 式按人/组授权）。
export const ORG_TREE: TreeNode[] = [
  {
    key: "rd",
    label: "研发中心",
    children: [
      {
        key: "rd-fe",
        label: "前端组",
        children: [
          { key: "u-linyu", label: "林屿（前端 Lead）" },
          { key: "u-chenmo", label: "陈墨" },
          { key: "u-zhaoyi", label: "赵一" },
        ],
      },
      {
        key: "rd-be",
        label: "后端组",
        children: [
          { key: "u-sunhao", label: "孙昊" },
          { key: "u-qianwen", label: "钱文" },
        ],
      },
    ],
  },
  {
    key: "design",
    label: "设计中心",
    children: [
      { key: "u-yangshu", label: "杨舒（设计负责人）" },
      { key: "u-mojin", label: "墨瑾" },
    ],
  },
  {
    key: "pm",
    label: "产品部",
    children: [
      { key: "u-zhouqi", label: "周琦" },
      { key: "u-wangya", label: "王雅" },
    ],
  },
];

// 全体成员（协作者管理 Transfer 的数据源）。name 与 VaultNode.collaborators 对齐。
export interface Member {
  name: string;
  role: string;
}
export const MEMBERS: Member[] = [
  { name: "林屿", role: "前端 Lead" },
  { name: "陈墨", role: "前端工程师" },
  { name: "赵一", role: "前端工程师" },
  { name: "孙昊", role: "后端工程师" },
  { name: "钱文", role: "后端工程师" },
  { name: "杨舒", role: "设计负责人" },
  { name: "墨瑾", role: "视觉设计" },
  { name: "周琦", role: "产品经理" },
  { name: "王雅", role: "产品经理" },
];

// 协作者池（详情面板 AvatarCircles + 版本作者），头像走本地 jpg（零外链）。
export const COLLABORATORS: Record<string, Collaborator> = {
  林屿: { name: "林屿", role: "前端 Lead", avatar: "/demo/avatar-1.jpg" },
  杨舒: { name: "杨舒", role: "设计负责人", avatar: "/demo/avatar-2.jpg" },
  周琦: { name: "周琦", role: "产品经理", avatar: "/demo/avatar-3.jpg" },
  陈墨: { name: "陈墨", role: "前端工程师", avatar: "/demo/avatar-4.jpg" },
  孙昊: { name: "孙昊", role: "后端工程师", avatar: "/demo/avatar-12.jpg" },
};
