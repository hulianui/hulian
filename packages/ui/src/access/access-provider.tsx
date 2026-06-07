"use client";
import { useMemo, type ReactNode } from "react";
import { AccessContext, type AccessContextValue } from "./use-access";

export interface AccessProviderProps {
  /** 当前用户被授予的权限/角色标识（字符串数组或 Set）。 */
  permissions: readonly string[] | ReadonlySet<string>;
  children: ReactNode;
}

/**
 * 权限上下文根。把当前用户的权限集合下发给子树，供 useAccess()/<Access> 判定。
 * 通常裹在应用最外层（登录后拿到权限列表即注入）。
 */
export function AccessProvider({ permissions, children }: AccessProviderProps) {
  const value = useMemo<AccessContextValue>(() => {
    const set: ReadonlySet<string> = permissions instanceof Set ? permissions : new Set(permissions);
    // "*" is a grant-all wildcard (superadmin convention): holding it satisfies any check.
    const wildcard = set.has("*");
    const has = (p: string) => wildcard || set.has(p);
    return {
      permissions: set,
      has,
      hasAny: (ps) => ps.length === 0 || ps.some(has),
      hasAll: (ps) => ps.every(has),
    };
  }, [permissions]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}
