"use client";
import { createContext, useContext } from "react";
import type { ComponentLocale, Locale } from "./locale";

export const LocaleContext = createContext<Locale | null>(null);

const EMPTY_COMPONENT_LOCALE: Partial<ComponentLocale> = {};

/** Internal context reader that does not import the built-in locale dictionaries. */
export function useLocaleContext(): Locale | null {
  return useContext(LocaleContext);
}

/**
 * Read component overrides only. Each component owns its small zh-CN fallback so
 * importing one component never pulls both complete built-in dictionaries into its bundle.
 */
export function useComponentLocale(): Partial<ComponentLocale> {
  return useLocaleContext()?.components ?? EMPTY_COMPONENT_LOCALE;
}

/** Read a top-level locale section with a component-local zh-CN fallback. */
export function useLocaleValue<K extends keyof Locale>(key: K, fallback: Locale[K]): Locale[K] {
  return useLocaleContext()?.[key] ?? fallback;
}
