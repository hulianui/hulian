"use client";
import type { ReactNode } from "react";
import { useAccess, type AccessContextValue } from "./use-access";

export interface AccessProps {
  /** 需要的权限：字符串或字符串数组。与 accessible 二选一，accessible 优先。 */
  permission?: string | string[];
  /** 数组权限的匹配模式：all=全部具备 / any=任一具备（默认 all）。对单字符串无效。 */
  mode?: "all" | "any";
  /** 自定义判定（优先于 permission）：布尔值或 (access)=>boolean。 */
  accessible?: boolean | ((access: AccessContextValue) => boolean);
  /** 无权限时渲染的内容（默认 null，即隐藏）。 */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * 声明式权限门禁：有权限渲染 children，否则渲染 fallback（默认隐藏）。
 * 判定优先级：accessible > permission > 无约束(恒放行)。
 *
 * ```tsx
 * <Access permission="user:delete" fallback={<Tooltip>无权限</Tooltip>}>
 *   <Button tone="danger">删除</Button>
 * </Access>
 * ```
 */
export function Access({ permission, mode = "all", accessible, fallback = null, children }: AccessProps) {
  const access = useAccess();

  let granted: boolean;
  if (accessible !== undefined) {
    granted = typeof accessible === "function" ? accessible(access) : accessible;
  } else if (permission !== undefined) {
    granted = Array.isArray(permission)
      ? mode === "any"
        ? access.hasAny(permission)
        : access.hasAll(permission)
      : access.has(permission);
  } else {
    granted = true;
  }

  return <>{granted ? children : fallback}</>;
}
