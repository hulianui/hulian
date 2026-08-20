"use client";
import { memo, useCallback, useMemo, useState } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
} from "../combobox/combobox";
import type { ComboboxItemData } from "../combobox/combobox.types";

import { useComponentLocale } from "../config/locale-context";
import { countries } from "./countries.data";
import { countrySearchText, flagEmoji, getCountry } from "./country-select.logic";
import type { CountrySelectProps } from "./country-select.types";

// 兜底文案提到模块级：写成 `?? { … }` 字面量的话，未接 ConfigProvider locale 时每次渲染都是新对象，
// 下面 useMemo([locale]) 会次次失效 —— 250 个国家的 items 与 Map 白重建一遍。
const DEFAULT_COUNTRY_LOCALE = {
  placeholder: "选择国家/地区",
  searchPlaceholder: "搜索国家 / 区号…",
  name: (chinese: string) => chinese,
  secondaryName: (_chinese: string, english: string) => english as string | null,
};

// 搜索按富文本匹配（中文/英文/码/区号），而非紧凑 label。不读 locale，故可模块级常量化。
function countryItemToStringLabel(item: ComboboxItemData) {
  const country = getCountry(item.value);
  return country ? countrySearchText(country) : String(item.label);
}

// 国家选择器：dogfood Combobox（含本次新增的多选 chips）。
// label 走紧凑展示、itemToStringLabel 走「中文/英文/码/区号」富搜索串 → 显示紧凑、搜索全字段。
function CountrySelectImpl({
  value,
  defaultValue,
  onChange,
  multiple = false,
  showEnglish = true,
  showDialCode = false,
  placeholder,
  searchPlaceholder,
  size,
  disabled,
  invalid,
  className,
  ...rest
}: CountrySelectProps) {
  const locale = useComponentLocale().countrySelect ?? DEFAULT_COUNTRY_LOCALE;
  const resolvedPlaceholder = placeholder ?? locale.placeholder;
  const resolvedSearchPlaceholder = searchPlaceholder ?? locale.searchPlaceholder;
  // items 的 label 吃 locale.name → 必须随 locale 重建，不能提模块级常量（否则英文站显示中文名）。
  const items = useMemo(
    () =>
      countries.map(
        (country): ComboboxItemData => ({
          value: country.code,
          label: `${flagEmoji(country.code)} ${locale.name(country.cn, country.en)}`,
        }),
      ),
    [locale],
  );
  const itemByCode = useMemo(() => new Map(items.map((i) => [i.value, i])), [items]);

  // 公开 value 用 code(s)，内部 Combobox 用 ComboboxItemData(s)；这里管受控/非受控并双向映射。
  const [internal, setInternal] = useState<string | string[]>(defaultValue ?? (multiple ? [] : ""));
  const codes = value ?? internal;

  // 下拉行：旗 + 名称（+ 英文名/区号按开关，muted 色）。
  const renderRow = useCallback(
    (item: ComboboxItemData) => {
      const c = getCountry(item.value);
      if (!c) return item.label;
      const secondaryName = locale.secondaryName(c.cn, c.en);
      return (
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span aria-hidden>{flagEmoji(c.code)}</span>
          <span className="truncate text-foreground">{locale.name(c.cn, c.en)}</span>
          {showEnglish && secondaryName && (
            <span className="truncate text-xs text-muted-foreground">{secondaryName}</span>
          )}
          {showDialCode && c.dial && (
            <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">{c.dial}</span>
          )}
        </span>
      );
    },
    [locale, showDialCode, showEnglish],
  );

  const renderItem = useCallback(
    (item: ComboboxItemData) => (
      <ComboboxItem key={item.value} value={item}>
        {renderRow(item)}
      </ComboboxItem>
    ),
    [renderRow],
  );

  const selected = useMemo(
    () =>
      (multiple && Array.isArray(codes) ? codes : [])
        .map((code) => itemByCode.get(code))
        .filter(Boolean) as ComboboxItemData[],
    [codes, itemByCode, multiple],
  );

  const handleMultipleChange = useCallback(
    (next: ComboboxItemData[]) => {
      const nextCodes = next.map((item) => item.value);
      if (value === undefined) setInternal(nextCodes);
      onChange?.(nextCodes);
    },
    [onChange, value],
  );

  const handleSingleChange = useCallback(
    (next: ComboboxItemData | null) => {
      const code = next?.value ?? "";
      if (value === undefined) setInternal(code);
      onChange?.(code);
    },
    [onChange, value],
  );

  if (multiple) {
    return (
      <Combobox
        multiple
        items={items}
        value={selected}
        disabled={disabled}
        itemToStringLabel={countryItemToStringLabel}
        onValueChange={handleMultipleChange}
      >
        <ComboboxChips
          {...rest}
          size={size}
          invalid={invalid}
          placeholder={selected.length ? "" : resolvedPlaceholder}
          className={className}
        >
          {selected.map((it) => (
            <ComboboxChip key={it.value}>
              <span aria-hidden>{flagEmoji(it.value)}</span>
              <span>
                {(() => {
                  const country = getCountry(it.value);
                  return country ? locale.name(country.cn, country.en) : it.value;
                })()}
              </span>
            </ComboboxChip>
          ))}
        </ComboboxChips>
        <ComboboxContent searchPlaceholder={resolvedSearchPlaceholder}>{renderItem}</ComboboxContent>
      </Combobox>
    );
  }

  const single = typeof codes === "string" && codes ? itemByCode.get(codes) : undefined;
  return (
    <Combobox
      items={items}
      value={single}
      disabled={disabled}
      itemToStringLabel={countryItemToStringLabel}
      onValueChange={handleSingleChange}
    >
      <ComboboxTrigger
        {...rest}
        size={size}
        placeholder={resolvedPlaceholder}
        invalid={invalid}
        className={className}
      />
      <ComboboxContent searchPlaceholder={resolvedSearchPlaceholder}>{renderItem}</ComboboxContent>
    </Combobox>
  );
}

export const CountrySelect = memo(CountrySelectImpl);
CountrySelect.displayName = "CountrySelect";
