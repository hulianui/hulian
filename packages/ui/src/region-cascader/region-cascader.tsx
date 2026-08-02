"use client";
import { useMemo } from "react";
import { Cascader } from "../cascader/cascader";
import { useComponentLocale, zhCN } from "../config/locale";
import type { TreeNode } from "../tree/tree-core";
import { cnDivisions } from "./cn-divisions.data";
import { sliceLevel } from "./region-cascader.logic";
import type { RegionCascaderProps } from "./region-cascader.types";

function localizeNodes(
  nodes: TreeNode[],
  name: (code: string, chinese: string) => string,
): TreeNode[] {
  return nodes.map((node) => {
    const code = String(node.key);
    const chinese = typeof node.label === "string" ? node.label : code;
    return {
      ...node,
      label: name(code, chinese),
      children: node.children ? localizeNodes(node.children, name) : undefined,
    };
  });
}

// 中国省市区级联选择器：薄封装 Cascader + 内置全量行政区划数据（国家统计局口径，大陆 31 省）。
// dogfood Cascader：层级裁剪 + showSearch 都走底座，本体只做数据接入与「码→名」回传。
export function RegionCascader({
  value,
  defaultValue,
  onChange,
  level = 3,
  showSearch = true,
  changeOnSelect = false,
  placeholder,
  size,
  disabled,
  invalid,
  className,
}: RegionCascaderProps) {
  const locale = useComponentLocale().regionCascader ?? zhCN.components!.regionCascader!;
  const resolvedPlaceholder = placeholder ?? (level === 2 ? locale.provinceCity : locale.full);
  const nodes = useMemo(
    () => localizeNodes(sliceLevel(cnDivisions, level), locale.name),
    [level, locale],
  );
  return (
    <Cascader
      nodes={nodes}
      value={value}
      defaultValue={defaultValue}
      onChange={(codes, nodePath) =>
        onChange?.(codes, nodePath.map((n) => (typeof n.label === "string" ? n.label : "")))
      }
      showSearch={showSearch}
      searchPlaceholder={locale.searchPlaceholder}
      changeOnSelect={changeOnSelect}
      placeholder={resolvedPlaceholder}
      size={size}
      disabled={disabled}
      invalid={invalid}
      className={className}
    />
  );
}
