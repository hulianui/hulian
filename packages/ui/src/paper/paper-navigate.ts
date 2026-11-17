"use client";
import { useMemo } from "react";
import { warnOnce } from "../lib/warn-once";
import { usePaperContext, type PaperContextValue } from "./paper-context";
import type { PaperNavigation } from "./paper.types";

// 论文里的「跳到某处」只有一种做法：找到注册表里的目标 → 不在视野里就滚过去 → 描边闪一下。
// FigRef / SecRef / EqRef 和命令式的 usePaperNavigate 都走这里，免得四份实现各自漂移。
// 引用组件另外负责「本体是 <a href>」：找到目标才阻止默认跳转，找不到时退化成普通锚点。

/** 目标不在视野里就滚过去（减弱动效时不平滑）。引用、公式项、命令式导航共用。 */
export function revealTarget(target: HTMLElement | null | undefined) {
  if (!target || typeof target.getBoundingClientRect !== "function" || typeof target.scrollIntoView !== "function") return;
  const rect = target.getBoundingClientRect();
  const viewport = window.innerHeight;
  if (rect.top >= 0 && rect.bottom <= viewport) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  target.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
    block: rect.height > viewport * 0.8 ? "start" : "center",
  });
}

type NavigateTarget =
  | { kind: "figure"; id: string; state?: string }
  | { kind: "equation"; id: string }
  | { kind: "section"; id: string };

/**
 * 执行一次跳转。`source` 只用于开发期告警，写成调用方的组件名 / hook 名。
 * 返回 true 表示找到了目标：引用组件据此决定是否 `preventDefault`。
 */
export function navigatePaper(
  paper: PaperContextValue | null,
  target: NavigateTarget,
  source: string,
): boolean {
  if (!paper) return false;

  switch (target.kind) {
    case "figure": {
      const entry = paper.find(target.id);
      if (!entry) return missing(source, "图", target.id);
      if (target.state !== undefined) {
        if (entry.has(target.state)) entry.select(target.state);
        else {
          warnOnce(
            `${source}:state:${target.id}:${target.state}`,
            `[${source}] 图 "${target.id}" 没有名为 "${target.state}" 的预设。`,
          );
        }
      }
      revealTarget(entry.element());
      entry.highlight();
      return true;
    }
    case "equation": {
      const entry = paper.equations.find(target.id);
      if (!entry) return missing(source, "公式", target.id);
      revealTarget(entry.element());
      entry.highlight();
      return true;
    }
    case "section": {
      const entry = paper.sections.find(target.id);
      if (!entry) return missing(source, "章节", target.id);
      const el = entry.element();
      revealTarget(el?.querySelector<HTMLElement>("[data-paper-section-title]") ?? el);
      entry.highlight();
      return true;
    }
  }
}

function missing(source: string, noun: string, id: string): false {
  warnOnce(`${source}:missing:${id}`, `[${source}] 找不到 id 为 "${id}" 的${noun}。`);
  return false;
}

/**
 * 在 `Paper` 里命令式跳到图 / 公式 / 章节。给本身就是交互元素的触发器用（`Button`、
 * `Menu.Item` 等）：把引用嵌套进去会渲染成链接，继承链接色和下划线，也破坏按钮语义。
 * 在 `Paper` 外调用不跳转，开发环境告警一次。
 */
export function usePaperNavigate(): PaperNavigation {
  const paper = usePaperContext();

  return useMemo<PaperNavigation>(() => {
    const run = (target: NavigateTarget) => {
      if (!paper) {
        warnOnce("usePaperNavigate:outside", "[usePaperNavigate] 必须在 Paper 里使用，否则找不到要跳转的目标。");
        return;
      }
      navigatePaper(paper, target, "usePaperNavigate");
    };
    return {
      figure: (id, state) => run({ kind: "figure", id, state }),
      equation: (id) => run({ kind: "equation", id }),
      section: (id) => run({ kind: "section", id }),
    };
  }, [paper]);
}
