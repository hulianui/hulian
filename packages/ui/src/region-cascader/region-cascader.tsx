"use client";
import { useMemo } from "react";
import { Cascader } from "../cascader/cascader";
import { cnDivisions } from "./cn-divisions.data";
import { sliceLevel } from "./region-cascader.logic";
import type { RegionCascaderProps } from "./region-cascader.types";

// 中国省市区级联选择器：薄封装 Cascader + 内置全量行政区划数据（国家统计局口径，大陆 31 省）。
// dogfood Cascader：层级裁剪 + showSearch 都走底座，本体只做数据接入与「码→名」回传。
export function RegionCascader({
  value,
  defaultValue,
  onChange,
  level = 3,
  showSearch = true,
  changeOnSelect = false,
  placeholder = level === 2 ? "请选择省/市" : "请选择省/市/区",
  size,
  disabled,
  invalid,
  className,
}: RegionCascaderProps) {
  const nodes = useMemo(() => sliceLevel(cnDivisions, level), [level]);
  return (
    <Cascader
      nodes={nodes}
      value={value}
      defaultValue={defaultValue}
      onChange={(codes, nodePath) =>
        onChange?.(codes, nodePath.map((n) => (typeof n.label === "string" ? n.label : "")))
      }
      showSearch={showSearch}
      searchPlaceholder="搜索省/市/区…"
      changeOnSelect={changeOnSelect}
      placeholder={placeholder}
      size={size}
      disabled={disabled}
      invalid={invalid}
      className={className}
    />
  );
}
