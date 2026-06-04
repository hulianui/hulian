"use client";
import { createContext, useContext } from "react";

/** 权限实例：持当前用户被授予的权限/角色标识 + 判定谓词。 */
export interface AccessContextValue {
  /** 当前用户被授予的权限/角色标识集合。 */
  permissions: ReadonlySet<string>;
  /** 是否拥有某权限。 */
  has: (permission: string) => boolean;
  /** 是否拥有数组中「任一」权限。空数组视为 true。 */
  hasAny: (permissions: string[]) => boolean;
  /** 是否拥有数组中「全部」权限。空数组视为 true。 */
  hasAll: (permissions: string[]) => boolean;
}

export const AccessContext = createContext<AccessContextValue | null>(null);

/**
 * 取权限实例做命令式判定（如「有权限则可点、否则禁用」）。
 * 必须在 AccessProvider 内使用（同 useTheme 约定：缺 Provider 即抛，强制显式配置、
 * 避免「静默放行/静默拒绝」两种危险默认）。
 */
export function useAccess(): AccessContextValue {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error("useAccess must be used within AccessProvider");
  return ctx;
}
