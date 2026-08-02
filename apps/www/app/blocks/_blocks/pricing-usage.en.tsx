"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardBody, Divider, Heading, NumberTicker, ShimmerButton, Slider, Stack, Tag, Text, } from "@hulianui/ui";
import { Check, Server, Activity } from "lucide-react";
const SEAT_MIN = 1;
const SEAT_MAX = 50;
const SEAT_INCLUDED = 5;
const SEAT_PRICE = 29;
const REQ_MIN = 0.5;
const REQ_MAX = 50;
const REQ_STEP = 0.5;
const REQ_INCLUDED = 2;
const REQ_PRICE = 8;
const BASE_PRICE = 199;
const INCLUDED = [
    "Unlimited projects with automatic HTTPS",
    "Compute scales automatically and returns to zero when idle.",
    "Metrics, logs, and distributed traces retained for 30 days",
    "Environment isolation and full change audit",
];
function calcMonthly(seats: number, reqMillions: number) {
    const extraSeats = Math.max(0, seats - SEAT_INCLUDED);
    const extraReq = Math.max(0, reqMillions - REQ_INCLUDED);
    return BASE_PRICE + extraSeats * SEAT_PRICE + Math.round(extraReq * REQ_PRICE);
}
export function PricingUsageBlock({ ctaHref = "#" }: {
    ctaHref?: string;
}) {
    const [seats, setSeats] = useState(8);
    const [reqMillions, setReqMillions] = useState(5);
    const monthly = calcMonthly(seats, reqMillions);
    return (<section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            Pay as you go
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            Only pay for resources actually used
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            Use the sliders below to estimate your team's monthly cost. Your bill adjusts automatically as usage changes, with no contract update required.
          </Text>
        </div>

        <Card variant="elevated" className="overflow-hidden">
          <CardBody className="flex flex-col gap-8 p-6 sm:p-8">

            <div>
              <Stack direction="row" align="center" justify="between" className="mb-3">
                <Stack direction="row" align="center" gap={2}>
                  <Server className="size-4 text-primary" aria-hidden/>
                  <Text size="sm" weight="medium">
                    Team seats
                  </Text>
                </Stack>
                <Text size="sm" className="tabular-nums text-foreground">
                  <span className="text-lg font-semibold">{seats}</span> people
                </Text>
              </Stack>
              <Slider value={seats} onValueChange={(v) => setSeats(Array.isArray(v) ? v[0] : v)} min={SEAT_MIN} max={SEAT_MAX} step={1} aria-label="Number of team seats"/>
              <Text tone="muted" size="sm" className="mt-2">
                First {SEAT_INCLUDED} seats are included; additional seats cost ¥{SEAT_PRICE} per month.
              </Text>
            </div>


            <div>
              <Stack direction="row" align="center" justify="between" className="mb-3">
                <Stack direction="row" align="center" gap={2}>
                  <Activity className="size-4 text-primary" aria-hidden/>
                  <Text size="sm" weight="medium">
                    Monthly requests
                  </Text>
                </Stack>
                <Text size="sm" className="tabular-nums text-foreground">
                  <span className="text-lg font-semibold">{reqMillions}</span> million requests
                </Text>
              </Stack>
              <Slider value={reqMillions} onValueChange={(v) => setReqMillions(Array.isArray(v) ? v[0] : v)} min={REQ_MIN} max={REQ_MAX} step={REQ_STEP} aria-label="Monthly requests (millions)"/>
              <Text tone="muted" size="sm" className="mt-2">
                First {REQ_INCLUDED} million requests are free, then ¥{REQ_PRICE} per month.
              </Text>
            </div>

            <Divider />


            <Stack direction="row" align="end" justify="between" className="flex-wrap gap-4">
              <div>
                <Text tone="muted" size="sm">
                  Estimated monthly fee
                </Text>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-foreground">¥</span>
                  <NumberTicker value={monthly} duration={0.5} className="text-4xl font-bold tracking-tight text-foreground"/>
                  <Text tone="muted" size="sm" className="pb-1">
                    /month
                  </Text>
                </div>
              </div>
              <ShimmerButton render={<Link href={ctaHref}/>}>Start a 14-day trial</ShimmerButton>
            </Stack>

            <Divider />


            <div>
              <Text size="sm" weight="medium" className="mb-3">
                Included with every plan
              </Text>
              <Stack direction="column" gap={2.5}>
                {INCLUDED.map((item) => (<Stack key={item} direction="row" align="start" gap={2}>
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden/>
                    <Text size="sm" className="flex-1">
                      {item}
                    </Text>
                  </Stack>))}
              </Stack>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>);
}
