"use client";
import { copy } from "./page.content";

import { useRouter } from "next/navigation";
import { CalendarClock, LayoutGrid, Users } from "lucide-react";
import { DotPattern, Heading, Link, LoginForm, Text } from "@hulianui/ui";
import { sleep } from "../../lib/async";
import { ROOT } from "../_components/nav-config";

const FEATURES = [
  { icon: LayoutGrid, title: copy("feature1Title"), desc: copy("feature1Desc") },
  { icon: CalendarClock, title: copy("feature2Title"), desc: copy("feature2Desc") },
  { icon: Users, title: copy("feature3Title"), desc: copy("feature3Desc") },
];

export default function OrgClassroomLoginPage() {
  const router = useRouter();

  return (
    <main className="flex h-dvh bg-bg">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-12 pb-28 text-white lg:flex">
        <DotPattern className="absolute inset-0 text-white/10" />

        <div className="relative z-10 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
            {copy("brandMark")}
          </span>
          <span className="text-base font-semibold tracking-tight">{copy("brand")}</span>
        </div>

        <div className="relative z-10 max-w-md">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
            {copy("badge")}
          </span>
          <Heading level={1} size="3xl" balance className="mt-5 text-white">
            {copy("heading")}
            <br />
            {copy("headingLine2")}
          </Heading>
          <Text className="mt-4 text-white/70">{copy("intro")}</Text>

          <ul className="mt-10 flex flex-col gap-5">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--radius)] bg-white/10">
                  <feature.icon className="size-[18px]" />
                </span>
                <div>
                  <div className="font-medium text-white">{feature.title}</div>
                  <Text size="sm" className="text-white/60">
                    {feature.desc}
                  </Text>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Text size="sm" className="relative z-10 text-white/50">
          {copy("demoHint")}
        </Text>
      </aside>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          <LoginForm
            logo={
              <span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
                  {copy("brandMark")}
                </span>
                <span className="text-base font-semibold tracking-tight">{copy("brand")}</span>
              </span>
            }
            subtitle={copy("formSubtitle")}
            onFinish={async () => {
              await sleep(600);
              router.push(ROOT);
            }}
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">{copy("forgotPassword")}</Link>
                <Link href="#">{copy("ssoLogin")}</Link>
              </div>
            }
          />
          <Text size="xs" tone="muted" className="text-center">
            {copy("demoHint")}
          </Text>
        </div>
      </div>
    </main>
  );
}
