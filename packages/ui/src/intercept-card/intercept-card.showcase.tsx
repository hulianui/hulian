"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { InterceptCard } from "./intercept-card";
import type { InterceptSeverity } from "./intercept-card.types";

const blocked = {
  severity: "block" as const,
  title: "并行子任务上限",
  message: "同一会话最多允许 2 个并行子任务（≥ 3 视为过度拆分）",
  source: "团队约定 · 硬约束 4",
  violation: "本次为第 3 个子任务：「梳理历史根因」",
  suggestion: "先让前两个跑完再派；或把三件事合并成一个更明确的任务。",
};

const confirmed = {
  severity: "confirm" as const,
  title: "元产物写入需确认",
  message: "不主动写「踩坑记录 / 候选标记 / 漂移说明」等元产物（用户问起再写）",
  source: "团队约定 · 硬约束 5",
  violation: "~/.config/notes/skills/xxx/NOTE.md",
  suggestion: "确认这是用户明确要求的产出，再放行。",
};

const noticed = {
  severity: "notice" as const,
  title: "样式补丁提醒",
  message: "本项目的 UI 应全部由设计系统组件承载，避免局部覆写",
  source: "工程规范 · §7.1",
  violation: "apps/console/src/app/custom.css",
};

/** 放行交互演示：本地维护已放行状态。 */
function OverrideDemo() {
  const [done, setDone] = useState<{ reason: string; at: string } | null>(null);

  return (
    <InterceptCard
      {...blocked}
      onOverride={async (reason) => {
        await new Promise((r) => setTimeout(r, 500));
        setDone({ reason, at: new Date().toTimeString().slice(0, 5) });
      }}
      {...(done != null ? { overridden: done } : {})}
    />
  );
}

export const interceptCardShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "severity",
      type: "select",
      options: ["block", "confirm", "notice"],
      defaultValue: "block",
      label: "强度",
    },
    { prop: "withOverride", type: "boolean", defaultValue: true, label: "可放行" },
  ],
  states: [
    { name: "已拦截 block", render: () => <InterceptCard {...blocked} /> },
    { name: "待确认 confirm", render: () => <InterceptCard {...confirmed} /> },
    { name: "提醒 notice", render: () => <InterceptCard {...noticed} /> },
    {
      name: "已放行",
      render: () => (
        <InterceptCard {...blocked} overridden={{ reason: "本次确实需要第三个", at: "09:13" }} />
      ),
    },
  ],
  examples: [
    {
      title: "完整拦截交代",
      description:
        "规则是什么 · 出处在哪 · 违反点在哪 · 该怎么改，四件事齐了用户才会遵守而不是关掉它。",
      code: `<InterceptCard
  severity="block"
  title="并行子任务上限"
  message="同一会话最多允许 2 个并行子任务"
  source="团队约定 · 硬约束 4"
  violation="本次为第 3 个子任务"
  suggestion="先让前两个跑完再派"
/>`,
      render: () => <InterceptCard {...blocked} />,
    },
    {
      title: "带放行入口（理由必填）",
      description:
        "点放行不会直接生效，先要写理由。理由为空时确认按钮禁用——没写理由的放行等于没有治理。",
      code: `<InterceptCard
  {...rule}
  onOverride={async (reason) => {
    await api.override(event.id, reason);
  }}
/>`,
      render: () => <OverrideDemo />,
    },
    {
      title: "三档强度并列",
      description: "左缘色条是严重度的唯一视觉锚点。不给整卡染色——成列出现时整卡染色会糊成色块。",
      code: `<InterceptCard severity="block" ... />
<InterceptCard severity="confirm" ... />
<InterceptCard severity="notice" ... />`,
      render: () => (
        <div className="flex flex-col gap-3">
          <InterceptCard {...blocked} />
          <InterceptCard {...confirmed} />
          <InterceptCard {...noticed} />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => {
    const sev = (p.severity as InterceptSeverity) ?? "block";
    const src = sev === "confirm" ? confirmed : sev === "notice" ? noticed : blocked;
    return (
      <InterceptCard
        {...src}
        severity={sev}
        {...(p.withOverride ? { onOverride: () => {} } : {})}
      />
    );
  },
  toCode: (p) => `<InterceptCard
  severity="${(p.severity as string) ?? "block"}"
  title="并行子任务上限"
  message="同一会话最多允许 2 个并行子任务"
  source="团队约定 · 硬约束 4"
  violation="本次为第 3 个子任务"${
    p.withOverride ? "\n  onOverride={(reason) => api.override(id, reason)}" : ""
  }
/>`,
};
