"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardBody,
  Divider,
  Heading,
  NumberTicker,
  ShimmerButton,
  Slider,
  Stack,
  Tag,
  Text,
} from "@hulianui/ui";
import { Check, Server, Activity } from "lucide-react";

// 用量计价器 Block —— 自包含、可整段复制（"use client"，含本地状态）。
// 与 PricingTableBlock（固定档位卡片）风格区隔：这里是单张大卡 + 两根 Slider 拖动用量，
// 实时算出月费（NumberTicker 滚动）。适合「按席位 + 按请求量」组合计费的产品。
// 计费规则、单价、包含项全部内联，复制后改下面的常量即可。

// —— 计费规则（确定 mock，便于复制后替换）——
const SEAT_MIN = 1;
const SEAT_MAX = 50;
const SEAT_INCLUDED = 5; // 含在基础价内的免费席位
const SEAT_PRICE = 29; // 超出免费额度后每席位 / 月

const REQ_MIN = 0.5; // 单位：百万次 / 月
const REQ_MAX = 50;
const REQ_STEP = 0.5;
const REQ_INCLUDED = 2; // 免费百万次
const REQ_PRICE = 8; // 超出后每百万次 / 月

const BASE_PRICE = 199; // 平台基础月费

const INCLUDED = [
  "无限项目与自动 HTTPS",
  "弹性算力自动伸缩，闲时归零",
  "指标 / 日志 / 链路追踪保留 30 天",
  "环境隔离与全量变更审计",
];

function calcMonthly(seats: number, reqMillions: number) {
  const extraSeats = Math.max(0, seats - SEAT_INCLUDED);
  const extraReq = Math.max(0, reqMillions - REQ_INCLUDED);
  return BASE_PRICE + extraSeats * SEAT_PRICE + Math.round(extraReq * REQ_PRICE);
}

export function PricingUsageBlock({ ctaHref = "#" }: { ctaHref?: string }) {
  const [seats, setSeats] = useState(8);
  const [reqMillions, setReqMillions] = useState(5);

  const monthly = calcMonthly(seats, reqMillions);

  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            按用量计费
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            只为真正用掉的资源付费
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            拖动下面的滑块，估算你的团队每月开销。用量变化时账单自动调整，无需重新签约。
          </Text>
        </div>

        <Card variant="elevated" className="overflow-hidden">
          <CardBody className="flex flex-col gap-8 p-6 sm:p-8">
            {/* 席位滑块 */}
            <div>
              <Stack direction="row" align="center" justify="between" className="mb-3">
                <Stack direction="row" align="center" gap={2}>
                  <Server className="size-4 text-primary" aria-hidden />
                  <Text size="sm" weight="medium">
                    团队席位
                  </Text>
                </Stack>
                <Text size="sm" className="tabular-nums text-foreground">
                  <span className="text-lg font-semibold">{seats}</span> 人
                </Text>
              </Stack>
              <Slider
                value={seats}
                onValueChange={(v) => setSeats(Array.isArray(v) ? v[0] : v)}
                min={SEAT_MIN}
                max={SEAT_MAX}
                step={1}
                aria-label="团队席位数"
              />
              <Text tone="muted" size="sm" className="mt-2">
                前 {SEAT_INCLUDED} 个席位已含在基础价内，超出每席位 ¥{SEAT_PRICE} / 月。
              </Text>
            </div>

            {/* 请求量滑块 */}
            <div>
              <Stack direction="row" align="center" justify="between" className="mb-3">
                <Stack direction="row" align="center" gap={2}>
                  <Activity className="size-4 text-primary" aria-hidden />
                  <Text size="sm" weight="medium">
                    月请求量
                  </Text>
                </Stack>
                <Text size="sm" className="tabular-nums text-foreground">
                  <span className="text-lg font-semibold">{reqMillions}</span> 百万次
                </Text>
              </Stack>
              <Slider
                value={reqMillions}
                onValueChange={(v) => setReqMillions(Array.isArray(v) ? v[0] : v)}
                min={REQ_MIN}
                max={REQ_MAX}
                step={REQ_STEP}
                aria-label="每月请求量（百万次）"
              />
              <Text tone="muted" size="sm" className="mt-2">
                前 {REQ_INCLUDED} 百万次免费，超出每百万次 ¥{REQ_PRICE} / 月。
              </Text>
            </div>

            <Divider />

            {/* 实时月费 */}
            <Stack direction="row" align="end" justify="between" className="flex-wrap gap-4">
              <div>
                <Text tone="muted" size="sm">
                  预估月费
                </Text>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-foreground">¥</span>
                  <NumberTicker
                    value={monthly}
                    duration={0.5}
                    className="text-4xl font-bold tracking-tight text-foreground"
                  />
                  <Text tone="muted" size="sm" className="pb-1">
                    / 月
                  </Text>
                </div>
              </div>
              <ShimmerButton render={<Link href={ctaHref} />}>开始 14 天试用</ShimmerButton>
            </Stack>

            <Divider />

            {/* 包含项 */}
            <div>
              <Text size="sm" weight="medium" className="mb-3">
                每个套餐都包含
              </Text>
              <Stack direction="column" gap={2.5}>
                {INCLUDED.map((item) => (
                  <Stack key={item} direction="row" align="start" gap={2}>
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <Text size="sm" className="flex-1">
                      {item}
                    </Text>
                  </Stack>
                ))}
              </Stack>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
