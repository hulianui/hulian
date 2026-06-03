"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Statistic } from "./statistic";

// 倒计时 deadline 用 useState 初始化器固定一次（客户端挂载时算），避免每次 render 漂移。
function CountdownDemo() {
  const [deadline] = useState(() => Date.now() + 1000 * 60 * 60 + 1000 * 25); // 约 1 小时 25 秒
  return <Statistic.Countdown title="距活动结束" deadline={deadline} />;
}

function CountdownDayDemo() {
  const [deadline] = useState(() => Date.now() + 1000 * 60 * 60 * 50); // 约 2 天 2 小时
  return <Statistic.Countdown title="距上线" deadline={deadline} format="D 天 HH:mm:ss" />;
}

export const statisticShowcase: ShowcaseSpec = {
  controls: [
    { prop: "value", type: "number", defaultValue: 112893, label: "数值" },
    { prop: "precision", type: "number", defaultValue: 0, label: "小数位" },
    { prop: "prefix", type: "text", defaultValue: "￥", label: "前缀" },
    { prop: "suffix", type: "text", defaultValue: "", label: "后缀" },
    { prop: "animate", type: "boolean", defaultValue: false, label: "入场滚动" },
  ],
  states: [
    { name: "基础", render: () => <Statistic title="活跃用户" value={112893} /> },
    {
      name: "小数 + 前后缀",
      render: () => <Statistic title="账户余额" value={89234.56} precision={2} prefix="￥" />,
    },
    {
      name: "百分比后缀",
      render: () => <Statistic title="转化率" value={68.4} precision={1} suffix="%" />,
    },
    {
      name: "入场滚动",
      render: () => <Statistic title="总订单" value={45219} animate />,
    },
    {
      name: "自定义颜色",
      render: () => (
        <Statistic title="较昨日" value={11.28} precision={2} prefix="↑" suffix="%" valueStyle={{ color: "var(--success)" }} />
      ),
    },
    { name: "倒计时", render: () => <CountdownDemo /> },
    { name: "倒计时（含天）", render: () => <CountdownDayDemo /> },
  ],
  renderWithProps: (p) => (
    <Statistic
      value={Number(p.value)}
      precision={Number(p.precision)}
      prefix={(p.prefix as string) || undefined}
      suffix={(p.suffix as string) || undefined}
      animate={Boolean(p.animate)}
    />
  ),
  toCode: (p) =>
    `<Statistic value={${p.value}} precision={${p.precision}}${p.prefix ? ` prefix="${p.prefix}"` : ""}${p.suffix ? ` suffix="${p.suffix}"` : ""}${p.animate ? " animate" : ""} />`,
};
