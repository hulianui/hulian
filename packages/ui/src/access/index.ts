// 子路径入口：`import { Access } from "@hulianui/ui/access"`。
// 导出面与根 barrel 的「权限」段逐条对齐（hulianui/hulian#19）。
export { AccessProvider } from "./access-provider";
export type { AccessProviderProps } from "./access-provider";
export { Access } from "./access";
export type { AccessProps } from "./access";
export { useAccess } from "./use-access";
export type { AccessContextValue } from "./use-access";
