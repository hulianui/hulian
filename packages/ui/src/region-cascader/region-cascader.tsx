"use client";
import { useMemo } from "react";
import { Cascader } from "../cascader/cascader";

import { useComponentLocale } from "../config/locale-context";
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
  ...rest
}: RegionCascaderProps) {
  const locale = useComponentLocale().regionCascader ?? {
    provinceCity: "请选择省/市",
    full: "请选择省/市/区",
    searchPlaceholder: "搜索省/市/区…",
    name: (_code, chinese) => chinese,
  };
  const resolvedPlaceholder = placeholder ?? (level === 2 ? locale.provinceCity : locale.full);
  const nodes = useMemo(
    () => localizeNodes(sliceLevel(cnDivisions, level), locale.name),
    [level, locale],
  );
  return (
    <Cascader
      // 未列出的原生属性接着往底座传（#293）：本体只是薄封装，吃掉它们等于让 Field 注的
      // aria-required、消费方给的 id / data-* 在这一层凭空消失。
      {...rest}
      nodes={nodes}
      value={value}
      defaultValue={defaultValue}
      onChange={(codes, nodePath) =>
        onChange?.(
          codes,
          nodePath.map((n) => (typeof n.label === "string" ? n.label : "")),
        )
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
