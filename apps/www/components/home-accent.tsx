"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { AccentScope } from "@hulianui/ui";

// 首页主题色宿主：组件墙选（或自动轮换）一个色相，顶栏、slogan、下面各段的主色都跟着变。
// 派生规则在 @hulianui/tokens 的 [data-accent-scope]（AccentScope），这里只管「当前是哪个色相」。
// 第一个是品牌原色（258 与 brand-700 同色相）。
export const ACCENT_HUES = [258, 165, 300, 25, 70] as const;

interface HomeAccent {
  index: number;
  setIndex: (next: number | ((prev: number) => number)) => void;
}

const HomeAccentContext = createContext<HomeAccent | null>(null);

export function HomeAccentProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0);
  return (
    <HomeAccentContext.Provider value={{ index, setIndex }}>
      {/* 过渡挂在作用域上：子树里所有派生色同步渐变，子元素别再给色相挂过渡。 */}
      <AccentScope hue={ACCENT_HUES[index]} transition={900}>
        {children}
      </AccentScope>
    </HomeAccentContext.Provider>
  );
}

export function useHomeAccent(): HomeAccent {
  const ctx = useContext(HomeAccentContext);
  if (!ctx) throw new Error("useHomeAccent must be used inside <HomeAccentProvider>");
  return ctx;
}
