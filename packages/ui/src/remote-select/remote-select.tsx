"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
} from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
} from "../combobox/combobox";
import type { ComboboxItemData } from "../combobox/combobox.types";

import { useComponentLocale } from "../config/locale-context";
import { Spinner } from "../spinner/spinner";
import type {
  RemoteSelectBaseProps,
  RemoteSelectOption,
  RemoteSelectProps,
  RemoteSelectRawValue,
  RemoteSelectRow,
} from "./remote-select.types";

// 滚动到底判定阈值(px)：距底部小于它即认为「到底」，触发下一页。
const LOAD_MORE_THRESHOLD = 24;

const EMPTY_VALUES: string[] = [];

/** 对外 value（单选标量 / 多选数组 / number / null）归一为内部 string[]，顺序保持不变。 */
function toValueArray(
  input: RemoteSelectRawValue | RemoteSelectRawValue[] | null | undefined,
): string[] {
  if (input == null || input === "") return EMPTY_VALUES;
  if (Array.isArray(input)) {
    return input.filter((v) => v != null && v !== "").map((v) => String(v));
  }
  return [String(input)];
}

/** 选项等值判定：远程列表每次刷新都是新对象，不能靠 Object.is（默认行为）比，必须比 value。 */
const sameOption = (a: ComboboxItemData, b: ComboboxItemData) => a.value === b.value;

/**
 * 远程搜索选择器（单选 / 多选）：
 *  - 数据全部来自 `fetcher(query, {page,pageSize,signal})`，本地不做二次过滤（Base UI `filter={null}`）。
 *  - 输入防抖 + AbortSignal 取消：新一次搜索发出即 abort 上一次，且用序号丢弃过期响应
 *    （只 abort 不够——fetcher 可能忽略 signal，慢响应后到会覆盖新结果）。
 *  - 滚到底自动追加下一页。
 *  - 初值回显靠 `resolveValue(values)` 单独解：编辑表单打开时 value 常不在首屏列表里
 *    （在第 7 页 / 被搜索词过滤掉），不单独解就只能显示裸 value。
 *  - 多选 chip 严格按 value 顺序渲染：ComboboxChipRemove 按渲染序绑定 selectedValue[index]，
 *    乱序会删错项。
 */
export function RemoteSelect(props: RemoteSelectProps) {
  const {
    fetcher,
    resolveValue,
    labelKey = "name",
    valueKey = "id",
    debounce = 300,
    pageSize = 10,
    placeholder,
    emptyMessage,
    loadingMessage,
    size,
    disabled,
    invalid,
    clearable = true,
    defaultOpen = false,
    renderOption,
    virtualized,
    className,
    popupClassName,
    // 判别联合直接解构会连 multiple/value/defaultValue/onChange 一起要求「每个成员都有」，
    // 这里先摊平成宽类型再取剩余属性；这四个是本组件自己的语义，不能混进透传的 rest。
    multiple: _multiple,
    value: _value,
    defaultValue: _defaultValue,
    onChange: _onChange,
    ...rest
  } = props as RemoteSelectBaseProps & {
    multiple?: boolean;
    value?: unknown;
    defaultValue?: unknown;
    onChange?: unknown;
  };
  const copy = useComponentLocale().remoteSelect ?? {
    placeholder: "请选择",
    empty: "无匹配数据",
    loading: "加载中…",
    total: (count) => `共 ${count} 条`,
    loaded: (count) => `已加载 ${count} 条`,
    loadMore: "滚动加载更多",
    noMore: "没有更多了",
  };
  const resolvedPlaceholder = placeholder ?? copy.placeholder;
  const resolvedEmptyMessage = emptyMessage ?? copy.empty;
  const resolvedLoadingMessage = loadingMessage ?? copy.loading;
  const multiple = props.multiple === true;

  // ── 值（受控 / 非受控）─────────────────────────────────────────────
  const controlled = props.value !== undefined;
  const [innerValues, setInnerValues] = useState<string[]>(() => toValueArray(props.defaultValue));
  const values = useMemo(
    () => (controlled ? toValueArray(props.value) : innerValues),
    [controlled, props.value, innerValues],
  );
  // 标量 key：values 每渲染都是新数组，effect 依赖它会空转；用内容 key 才是真变化。
  const valuesKey = values.join("\u0001");
  const valuesRef = useRef(values);
  valuesRef.current = values;

  // ── 已知选项缓存：列表拉到的 + resolveValue 解到的 + 选中过的，供已选项回显 label ──
  const [known, setKnown] = useState<ReadonlyMap<string, RemoteSelectOption>>(() => new Map());
  const knownRef = useRef(known);
  knownRef.current = known;
  const mergeKnown = useCallback((list: RemoteSelectOption[]) => {
    if (list.length === 0) return;
    setKnown((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const opt of list) {
        if (!opt.value) continue;
        const old = next.get(opt.value);
        if (!old || old.label !== opt.label) {
          next.set(opt.value, opt);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  const toOption = useCallback(
    (row: RemoteSelectRow): RemoteSelectOption => {
      const rawValue = row[valueKey];
      const rawLabel = row[labelKey];
      return {
        value: rawValue == null ? "" : String(rawValue),
        // label 缺字段时回落 value，避免渲染出空白行。
        label: rawLabel == null || rawLabel === "" ? String(rawValue ?? "") : String(rawLabel),
        disabled: row.disabled === true,
        raw: row,
      };
    },
    [labelKey, valueKey],
  );

  // ── 列表状态 ──────────────────────────────────────────────────────
  const [options, setOptions] = useState<RemoteSelectOption[]>([]);
  const optionsRef = useRef<RemoteSelectOption[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(defaultOpen);

  const pageRef = useRef(1);
  const seqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  // 本次「打开会话」是否已拉过首页。关闭即置回 false → 下次打开重新拉第一页。
  const loadedRef = useRef(false);
  // 搜索关键词（≠ query 状态：单选时 query 还兼作输入框回显文本，会被已选 label 覆盖）。
  const keywordRef = useRef("");
  // resolveValue 已请求过的 value，防止解不出来时无限重试。
  const requestedRef = useRef<Set<string>>(new Set());

  const applyOptions = useCallback((next: RemoteSelectOption[]) => {
    optionsRef.current = next;
    setOptions(next);
  }, []);

  const runFetch = useCallback(
    (keyword: string, page: number, append: boolean) => {
      // 取消上一次在途请求；同时递增序号，过期响应即便回来也会被下面的 seq 判据丢弃。
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const seq = (seqRef.current += 1);
      pageRef.current = page;
      setLoading(true);

      const settle = () => {
        if (seq === seqRef.current) setLoading(false);
      };

      Promise.resolve(fetcher(keyword, { page, pageSize, signal: controller.signal })).then(
        (res) => {
          if (!mountedRef.current || seq !== seqRef.current) return;
          const list = (res?.options ?? []).map(toOption);
          const next = append ? [...optionsRef.current, ...list] : list;
          applyOptions(next);
          mergeKnown(list);
          const nextTotal = typeof res?.total === "number" ? res.total : null;
          setTotal(nextTotal);
          // total 已知按「已加载 < total」判；未知则按「本页满页即可能还有」推断。
          setHasMore(nextTotal != null ? next.length < nextTotal : list.length >= pageSize);
          settle();
        },
        () => {
          // abort 造成的 reject 与过期响应同样被 seq 拦掉；剩下的是真失败：列表清空落空态。
          if (!mountedRef.current || seq !== seqRef.current || controller.signal.aborted) return;
          if (!append) {
            applyOptions([]);
            setTotal(null);
          }
          setHasMore(false);
          settle();
        },
      );
    },
    [applyOptions, fetcher, mergeKnown, pageSize, toOption],
  );

  const scheduleFetch = useCallback(
    (keyword: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        runFetch(keyword, 1, false);
      }, debounce);
    },
    [debounce, runFetch],
  );

  // 卸载：停防抖、断在途请求、标记已卸载（异步回调据此早退）。
  // 放在所有 effect 之前声明 → React 严格模式「卸载再挂载」时先复位 mountedRef/loadedRef，
  // 下面的「打开即拉首页」effect 才会重跑，不会因 loadedRef 残留 true 而永远不发请求。
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      loadedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      abortRef.current?.abort();
    };
  }, []);

  // 打开即拉第一页（关键词沿用当前 keywordRef，通常为空）。
  useEffect(() => {
    if (!open || loadedRef.current) return;
    loadedRef.current = true;
    runFetch(keywordRef.current, 1, false);
  }, [open, runFetch]);

  // 初值回显：value 里凡是「已知选项缓存」没有的，交给 resolveValue 批量解一次。
  // 依赖只放 valuesKey（内容变才重跑），known 走 ref 读，避免 merge → 重跑 → merge 的循环。
  useEffect(() => {
    if (!resolveValue) return;
    const missing = valuesRef.current.filter(
      (v) => !knownRef.current.has(v) && !requestedRef.current.has(v),
    );
    if (missing.length === 0) return;
    for (const v of missing) requestedRef.current.add(v);
    Promise.resolve(resolveValue(missing)).then(
      (rows) => {
        if (!mountedRef.current) return;
        mergeKnown((rows ?? []).map(toOption));
      },
      () => {
        // 解析失败：保留 value 原文兜底显示，并放开重试（下次 value 变化可再解）。
        for (const v of missing) requestedRef.current.delete(v);
      },
    );
  }, [valuesKey, resolveValue, mergeKnown, toOption]);

  // ── 已选项（严格按 values 顺序；未解出 label 的用 value 兜底，不留空白 chip）──
  const selectedOptions = useMemo<RemoteSelectOption[]>(
    () => values.map((v) => known.get(v) ?? { value: v, label: v, raw: {} }),
    [values, known],
  );
  const selectedLabel = multiple ? "" : selectedOptions[0]?.label ?? "";

  // 单选：受控 inputValue 不会被 Base UI 自动回填，已选 label（含 resolveValue 迟到解出的）
  // 需要自己同步进输入框；打开中不覆盖，否则会把用户正在输入的搜索词吞掉。
  useEffect(() => {
    if (multiple || open) return;
    setQuery((prev) => (prev === selectedLabel ? prev : selectedLabel));
  }, [multiple, open, selectedLabel]);

  const commit = useCallback(
    (nextOptions: RemoteSelectOption[]) => {
      const nextValues = nextOptions.map((o) => o.value);
      mergeKnown(nextOptions);
      if (!controlled) setInnerValues(nextValues);
      if (props.multiple === true) {
        props.onChange?.(nextValues, nextOptions);
      } else {
        props.onChange?.(nextValues[0] ?? null, nextOptions[0] ?? null);
      }
    },
    // props 整体入依赖：联合类型下按 props.multiple 收窄，拆开取 onChange 会丢收窄。
    [controlled, mergeKnown, props],
  );

  const handleInputValueChange = useCallback(
    (next: string, details: { reason?: string }) => {
      setQuery(next);
      // 只有「用户改输入」和「点清除」才是新搜索；选中项(item-press)/失焦回填(none) 会带回 label，
      // 拿它当关键词会立刻打一次无意义请求并把列表洗成单条。
      const reason = details?.reason;
      if (reason !== "input-change" && reason !== "clear-press" && reason !== "input-clear") return;
      if (next === keywordRef.current) return;
      keywordRef.current = next;
      loadedRef.current = true;
      scheduleFetch(next);
    },
    [scheduleFetch],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next) return;
      // 关闭 = 一次搜索会话结束：停防抖、清关键词、下次打开重新拉第一页（与 el-select remote 一致）。
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      keywordRef.current = "";
      loadedRef.current = false;
      if (multiple) setQuery("");
    },
    [multiple],
  );

  const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
    if (loading || !hasMore) return;
    const el = event.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight > LOAD_MORE_THRESHOLD) return;
    runFetch(keywordRef.current, pageRef.current + 1, true);
  };

  const empty: ReactNode = loading ? (
    <span className="inline-flex items-center gap-2">
      <Spinner size="sm" tone="muted" />
      {resolvedLoadingMessage}
    </span>
  ) : (
    resolvedEmptyMessage
  );

  const footer: ReactNode =
    options.length === 0 ? null : (
      <div className="flex items-center justify-between gap-2 px-2 py-1 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {total != null ? copy.total(total) : copy.loaded(options.length)}
        </span>
        {loading ? (
          <span className="inline-flex items-center gap-1.5">
            <Spinner size="sm" tone="muted" className="size-3" />
            {resolvedLoadingMessage}
          </span>
        ) : (
          <span>{hasMore ? copy.loadMore : copy.noMore}</span>
        )}
      </div>
    );

  const content = (
    <ComboboxContent
      emptyMessage={empty}
      footer={footer}
      onListScroll={handleListScroll}
      className={popupClassName}
    >
      {(item) => {
        const option = item as RemoteSelectOption;
        return (
          <ComboboxItem key={option.value} value={option} disabled={option.disabled}>
            {renderOption ? renderOption(option) : <span className="truncate">{option.label}</span>}
          </ComboboxItem>
        );
      }}
    </ComboboxContent>
  );

  if (props.multiple === true) {
    return (
      <Combobox
        multiple
        items={options}
        filter={null}
        {...(virtualized !== undefined && { virtualized })}
        inputValue={query}
        onInputValueChange={handleInputValueChange}
        open={open}
        onOpenChange={handleOpenChange}
        disabled={disabled}
        value={selectedOptions}
        isItemEqualToValue={sameOption}
        onValueChange={(next: ComboboxItemData[]) => commit(next as RemoteSelectOption[])}
      >
        <ComboboxChips
          {...rest}
          size={size}
          invalid={invalid}
          placeholder={selectedOptions.length ? "" : resolvedPlaceholder}
          className={className}
        >
          {/* 必须按 value 顺序：ChipRemove 按渲染序绑定 selectedValue[index]，乱序会删错项。 */}
          {selectedOptions.map((option) => (
            <ComboboxChip key={option.value}>{option.label}</ComboboxChip>
          ))}
        </ComboboxChips>
        {content}
      </Combobox>
    );
  }

  return (
    <Combobox
      items={options}
      filter={null}
      {...(virtualized !== undefined && { virtualized })}
      inputValue={query}
      onInputValueChange={handleInputValueChange}
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      value={selectedOptions[0] ?? null}
      isItemEqualToValue={sameOption}
      onValueChange={(next: ComboboxItemData | null) =>
        commit(next ? [next as RemoteSelectOption] : [])
      }
    >
      <ComboboxInput
        {...rest}
        size={size}
        placeholder={resolvedPlaceholder}
        invalid={invalid}
        clearable={clearable}
        className={className}
      />
      {content}
    </Combobox>
  );
}
