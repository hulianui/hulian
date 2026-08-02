import { copy } from "./members.content";
// 团队成员（mock）。avatar 用首字（@hulianui/ui Avatar 文字兜底，无远程图）。

import type { Member } from "./types";

export const MEMBERS: Member[] = [
  { id: "m-1", name: copy("zhouLan"), avatar: copy("zhou"), role: copy("headOfTheDispatchPlatform"), online: true },
  { id: "m-2", name: copy("linAn"), avatar: copy("forest"), role: copy("routingStrategyEngineer"), online: true },
  { id: "m-3", name: copy("suWan"), avatar: copy("su"), role: copy("actuatorOperationsAndMaintenanceSre"), online: true },
  { id: "m-4", name: copy("chenZhao"), avatar: copy("chen"), role: copy("costGovernanceAnalyst"), online: false },
  { id: "m-5", name: copy("hanChe"), avatar: copy("han"), role: copy("slaAndAlertDuty"), online: true },
  { id: "m-6", name: copy("guTang"), avatar: copy("look"), role: copy("agentOrchestrationDevelopment"), online: false },
];

/** 当前登录用户（顶栏 / 设置页展示）。 */
export const CURRENT_USER: Member = MEMBERS[0];
