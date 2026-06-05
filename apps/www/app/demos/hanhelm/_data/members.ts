// 团队成员（mock）。avatar 用首字（@hulian/ui Avatar 文字兜底，无远程图）。

import type { Member } from "./types";

export const MEMBERS: Member[] = [
  { id: "m-1", name: "周澜", avatar: "周", role: "调度平台负责人", online: true },
  { id: "m-2", name: "林岸", avatar: "林", role: "路由策略工程师", online: true },
  { id: "m-3", name: "苏晚", avatar: "苏", role: "执行器运维 SRE", online: true },
  { id: "m-4", name: "陈昭", avatar: "陈", role: "成本治理分析师", online: false },
  { id: "m-5", name: "韩澈", avatar: "韩", role: "SLA 与告警值班", online: true },
  { id: "m-6", name: "顾棠", avatar: "顾", role: "Agent 编排开发", online: false },
];

/** 当前登录用户（顶栏 / 设置页展示）。 */
export const CURRENT_USER: Member = MEMBERS[0];
