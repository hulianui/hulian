"use client";
import { createContext, useContext } from "react";
import { isTest } from "../lib/is-dev";
import { warnOnce } from "../lib/warn-once";
import type { ComponentLocale, Locale } from "./locale";

export const LocaleContext = createContext<Locale | null>(null);

const EMPTY_COMPONENT_LOCALE: Partial<ComponentLocale> = {};

/**
 * 「没挂 ConfigProvider」在运行时是**完全静默**的：不报错、类型上 ConfigProvider 也是可选的，
 * typecheck / lint / guard 全绿，页面看起来还正常 —— 因为回退掉的多半是 aria-label
 * （NumberField 的「减少」「增加」、Spinner 的「加载中」、Tag 的「移除」），只有读屏用户和
 * e2e 断言才撞得到。英文产品里它能带着一屏中文读屏标签活过一整轮迁移（hulianui/hulian#164）。
 *
 * 回退策略本身不改（组件必须能脱离 Provider 渲染），只补一层可发现性：开发期喊一次。
 */
const MISSING_PROVIDER_KEY = "config/missing-config-provider";
const MISSING_PROVIDER_MESSAGE =
  "[hulian] 没有检测到 ConfigProvider，组件内置文案（含 aria-label）将回退为 zh-CN。" +
  "中文应用可以忽略；其它语言请在应用根挂 <ConfigProvider locale={enUS}>，" +
  "或 spread enUS 后覆盖成自己的语言。见 https://github.com/hulianui/hulian/blob/master/docs/consuming.md";

// 测试环境默认闭嘴，理由见 lib/is-dev 的 isTest 注释。库自己的用例用下面的开关把它打开。
let silenced = isTest;

/**
 * @internal 仅供本库测试打开被 isTest 消音的这条告警；不从 config/index.ts 或根 barrel 导出。
 */
export function __setMissingLocaleProviderWarningSilenced(value: boolean): void {
  silenced = value;
}

/**
 * 三个回退入口共用。刻意放在 render 期而不是 effect：缺 Provider 是接入层面的静态事实，
 * 挪进 effect 只会延迟，且 SSR 下压根不执行 —— 而 Next 消费方的第一现场就在 SSR。
 */
function warnMissingProvider(): void {
  if (silenced) return;
  warnOnce(MISSING_PROVIDER_KEY, MISSING_PROVIDER_MESSAGE);
}

/**
 * Internal context reader that does not import the built-in locale dictionaries.
 *
 * 不在这里告警：它是纯读取口，返回 null 由调用方自己决定要不要兜底。告警只挂在下面三个
 * **确实要用内置中文兜底**的入口上，避免把「读了但没用上」也算成缺接入。
 */
export function useLocaleContext(): Locale | null {
  return useContext(LocaleContext);
}

/**
 * Read component overrides only. Each component owns its small zh-CN fallback so
 * importing one component never pulls both complete built-in dictionaries into its bundle.
 */
export function useComponentLocale(): Partial<ComponentLocale> {
  const locale = useLocaleContext();
  if (!locale) warnMissingProvider();
  return locale?.components ?? EMPTY_COMPONENT_LOCALE;
}

/** Read a top-level locale section with a component-local zh-CN fallback. */
export function useLocaleValue<K extends keyof Locale>(key: K, fallback: Locale[K]): Locale[K] {
  const locale = useLocaleContext();
  if (!locale) warnMissingProvider();
  return locale?.[key] ?? fallback;
}

/** 供 locale.ts 的 useLocale 复用 —— 它整本字典回退到 zhCN，同属「缺 Provider」这一类。 */
export { warnMissingProvider as warnMissingLocaleProvider };
