"use client";
import { useEffect, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { EventStream } from "./event-stream";
import type { EventStreamItem } from "./event-stream.types";

const auditEvents: EventStreamItem[] = [
  { id: 1, ts: "09:12:01", tone: "neutral", title: "会话开始 · 已注入任务契约", meta: "0.9ms" },
  { id: 2, ts: "09:12:03", tone: "success", title: "读取 pages/list/index.js", meta: "0.3ms" },
  { id: 3, ts: "09:12:09", tone: "success", title: "写入 pages/list/index.js", meta: "0.4ms" },
  {
    id: 4,
    ts: "09:12:31",
    tone: "danger",
    title: "派发第 3 个子任务被拦截",
    detail: "同一会话最多允许 2 个并行子任务（≥ 3 视为过度拆分）。依据：团队约定 · 硬约束 4",
    meta: "1.1ms",
  },
  {
    id: 5,
    ts: "09:13:02",
    tone: "warning",
    title: "写入知识库条目需确认",
    detail: "该目录的产物需人工判断语境，已转为询问而非直接拒绝。",
    meta: "0.8ms",
    overridden: "本次确实需要记录",
  },
  { id: 6, ts: "09:14:20", tone: "info", title: "验收命令执行完毕 · 退出码 0", meta: "12.4s" },
];

const ciEvents: EventStreamItem[] = [
  { id: "a", ts: "14:02:11", tone: "info", title: "拉取代码 · main@a1b2c3d", meta: "3.2s" },
  { id: "b", ts: "14:02:19", tone: "success", title: "依赖安装完成", meta: "8.1s" },
  { id: "c", ts: "14:03:40", tone: "success", title: "单元测试 194/194 通过", meta: "81s" },
  { id: "d", ts: "14:04:02", tone: "warning", title: "类型检查有 2 处 any", detail: "src/legacy/adapter.ts:44, :91", meta: "22s" },
  { id: "e", ts: "14:04:55", tone: "danger", title: "端到端测试 3 项失败", detail: "登录跳转超时 ×2 / 支付回调断言不符 ×1", meta: "53s" },
];

/** 实时追加演示：每 1.4s 追加一条，展示 live 淡入。 */
function LiveDemo() {
  const [items, setItems] = useState<EventStreamItem[]>(auditEvents.slice(0, 3));

  useEffect(() => {
    let n = 3;
    const timer = setInterval(() => {
      n += 1;
      if (n > auditEvents.length) {
        setItems(auditEvents.slice(0, 3));
        n = 3;
        return;
      }
      setItems(auditEvents.slice(0, n));
    }, 1400);
    return () => clearInterval(timer);
  }, []);

  return <EventStream items={items} live maxHeight={280} />;
}

export const eventStreamShowcase: ShowcaseSpec = {
  controls: [
    { prop: "live", type: "boolean", defaultValue: false, label: "新条目淡入" },
    { prop: "defaultExpanded", type: "boolean", defaultValue: false, label: "展开详情" },
    { prop: "side", type: "select", options: ["left", "right"], defaultValue: "left", label: "时间轴侧" },
  ],
  states: [
    { name: "默认", render: () => <EventStream items={auditEvents} /> },
    { name: "展开全部详情", render: () => <EventStream items={auditEvents} defaultExpanded /> },
    { name: "限高内滚", render: () => <EventStream items={[...auditEvents, ...ciEvents]} maxHeight={240} /> },
    { name: "空态", render: () => <EventStream items={[]} emptyText="本次会话尚无事件" /> },
  ],
  examples: [
    {
      title: "治理审计流",
      description: "语义色承载「哪些被拦下了」，点击标题展开依据；已放行的条目保留放行说明，审计可追溯。",
      code: `<EventStream
  items={events}
  maxHeight={320}
  onItemClick={(e) => openDetail(e.id)}
/>`,
      render: () => <EventStream items={auditEvents} maxHeight={320} />,
    },
    {
      title: "CI 流水线",
      description: "同一组件换一组数据即可作流水线阶段流；耗时放 meta 列，等宽数字天然对齐。",
      code: `<EventStream items={pipelineSteps} defaultExpanded />`,
      render: () => <EventStream items={ciEvents} defaultExpanded />,
    },
    {
      title: "实时追加（live）",
      description: "新到的条目淡入一次即静止。事件流常年开着，任何循环动画都是噪音。",
      code: `<EventStream items={items} live maxHeight={280} />`,
      render: () => <LiveDemo />,
    },
    {
      title: "时间轴置右",
      description: "嵌在左侧主内容右边的窄栏时，把轴放右侧更贴合视线落点。",
      code: `<EventStream items={events} side="right" />`,
      render: () => <EventStream items={ciEvents} side="right" />,
    },
  ],
  renderWithProps: (p) => (
    <EventStream
      items={auditEvents}
      live={p.live as boolean}
      defaultExpanded={p.defaultExpanded as boolean}
      side={(p.side as "left" | "right") ?? "left"}
    />
  ),
  toCode: (p) => `<EventStream
  items={events}${p.live ? "\n  live" : ""}${p.defaultExpanded ? "\n  defaultExpanded" : ""}${
    p.side === "right" ? '\n  side="right"' : ""
  }
  onItemClick={(e) => openDetail(e.id)}
/>`,
};
