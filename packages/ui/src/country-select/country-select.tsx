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
import { countries } from "./countries.data";
import { countrySearchText, flagEmoji, getCountry } from "./country-select.logic";
import type { Country, CountrySelectProps } from "./country-select.types";

// Country → ComboboxItemData：value=ISO2 码，label=紧凑展示（旗 + 中文名，供触发器/chip 回显）。
const toItem = (c: Country): ComboboxItemData => ({
  value: c.code,
  label: `${flagEmoji(c.code)} ${c.cn}`,
});

const COUNTRY_ITEMS = countries.map(toItem);
const COUNTRY_ITEM_BY_CODE = new Map(COUNTRY_ITEMS.map((item) => [item.value, item]));

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
  placeholder = "选择国家/地区",
  searchPlaceholder = "搜索国家 / 区号…",
  size,
  disabled,
  invalid,
  className,
}: CountrySelectProps) {
  // 公开 value 用 code(s)，内部 Combobox 用 ComboboxItemData(s)；这里管受控/非受控并双向映射。
  const [internal, setInternal] = useState<string | string[]>(
    defaultValue ?? (multiple ? [] : ""),
  );
  const codes = value ?? internal;

  // 下拉行：旗 + 中文名（+ 英文名/区号按开关，muted 色）。
  const renderRow = useCallback((item: ComboboxItemData) => {
    const c = getCountry(item.value);
    if (!c) return item.label;
    return (
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span aria-hidden>{flagEmoji(c.code)}</span>
        <span className="truncate text-foreground">{c.cn}</span>
        {showEnglish && <span className="truncate text-xs text-muted">{c.en}</span>}
        {showDialCode && c.dial && (
          <span className="ml-auto shrink-0 text-xs tabular-nums text-muted">{c.dial}</span>
        )}
      </span>
    );
  }, [showDialCode, showEnglish]);

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
        .map((code) => COUNTRY_ITEM_BY_CODE.get(code))
        .filter(Boolean) as ComboboxItemData[],
    [codes, multiple],
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
        items={COUNTRY_ITEMS}
        value={selected}
        disabled={disabled}
        itemToStringLabel={countryItemToStringLabel}
        onValueChange={handleMultipleChange}
      >
        <ComboboxChips
          size={size}
          invalid={invalid}
          placeholder={selected.length ? "" : placeholder}
          className={className}
        >
          {selected.map((it) => (
            <ComboboxChip key={it.value}>
              <span aria-hidden>{flagEmoji(it.value)}</span>
              <span>{getCountry(it.value)?.cn ?? it.value}</span>
            </ComboboxChip>
          ))}
        </ComboboxChips>
        <ComboboxContent searchPlaceholder={searchPlaceholder}>
          {renderItem}
        </ComboboxContent>
      </Combobox>
    );
  }

  const single = typeof codes === "string" && codes ? COUNTRY_ITEM_BY_CODE.get(codes) : undefined;
  return (
    <Combobox
      items={COUNTRY_ITEMS}
      value={single}
      disabled={disabled}
      itemToStringLabel={countryItemToStringLabel}
      onValueChange={handleSingleChange}
    >
      <ComboboxTrigger size={size} placeholder={placeholder} invalid={invalid} className={className} />
      <ComboboxContent searchPlaceholder={searchPlaceholder}>
        {renderItem}
      </ComboboxContent>
    </Combobox>
  );
}

export const CountrySelect = memo(CountrySelectImpl);
CountrySelect.displayName = "CountrySelect";
