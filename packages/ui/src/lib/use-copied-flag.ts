"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// 「复制成功」反馈的置位/复位原语（#310）。
//
// 库里有四个组件要做同一件事：点复制 → 按钮变「已复制」→ 1.5 秒后变回去。四处此前都是
// 同一句内联写法：
//
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);   // 没有 ref，没有 cleanup
//
// 两个缺陷叠在里面：
//
//   1. **卸载后仍 setState**。用户点了复制、1.5 秒内关掉 Dialog 或离开页面，timer 照样跑。
//      React 19 不再为此打印警告，所以它在浏览器里是静默的；只有 jsdom 拆掉测试环境这种
//      极端时序才把它暴露出来 —— 表现是 `Timeout._onTimeout` 里抛
//      `ReferenceError: window is not defined`，vitest 记成 unhandled error 判整轮失败，
//      而 5533 个用例全是绿的。CI 因此偶发变红且极难归因。
//   2. **连点两次会提前抹掉反馈**。第二次点击排了新 timer，但第一个还在，先到的那个把
//      `copied` 复位，于是第二次的「已复制」只显示了半截。
//
// 抽出来而不是四处各加一个 ref：这四处逐字相同，且第五个要做复制反馈的组件必然还会照抄。
// 对照组 hover-card.tsx:41 的延时是存进 `timer.current` 的，那个模式本来就是对的。
//
// 刻意不导出到公共 API（lib/index.ts 只放根 barrel 已对外的那几个）—— 它是组件内部实现。

/** 「已复制」标志与它的置位函数：置位后到点自动复位，重复置位重新计时，卸载时清定时器。 */
export function useCopiedFlag(resetAfterMs = 1500): [boolean, () => void] {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markCopied = useCallback(() => {
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      setCopied(false);
    }, resetAfterMs);
  }, [resetAfterMs]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    },
    [],
  );

  return [copied, markCopied];
}
