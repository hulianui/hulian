"use client";
import { copy } from "./page.content";

import { useRouter } from "next/navigation";
import { MessagesSquare, Headphones, Gauge } from "lucide-react";
import { Heading, Link, LoginForm, Text } from "@hulianui/ui";
import { CS_ROOT } from "../_components/nav-config";

const FEATURES = [
  { icon: MessagesSquare, title: copy("unifiedReceptionThroughMultipleChannels"), desc: copy("webPageAppWechatPhoneOneWorkbench") },
  { icon: Headphones, title: copy("realTimeAgentCollaboration"), desc: copy("incomingCallRemindersInputStatusAndRead") },
  { icon: Gauge, title: copy("serviceQualityDashboard"), desc: copy("realTimeTrackingOfFirstCallDuration") },
];

export default function CsLoginPage() {
  const router = useRouter();

  return (
    <main className="flex h-dvh bg-bg">
      {/* 左：品牌面板 */}
      <aside
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{
          background:
            "radial-gradient(125% 125% at 30% 0%, color-mix(in oklab, var(--color-primary) 14%, var(--color-bg)) 0%, var(--color-bg) 55%)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">{copy("coral")}</span>
          <span className="text-base font-semibold tracking-tight">{copy("hulianCustomerService")}</span>
        </div>

        <div className="max-w-md">
          <Heading level={1} size="3xl" balance>{copy("makeEveryConversation")}<br />{copy("areTakenSeriously")}</Heading>
          <Text tone="muted" className="mt-4">{copy("aRealTimeConversationalWorkbenchForAgents")}</Text>

          <ul className="mt-10 flex flex-col gap-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--radius)] bg-primary/12 text-primary">
                  <f.icon className="size-[18px]" />
                </span>
                <div>
                  <div className="font-medium">{f.title}</div>
                  <Text size="sm" tone="muted">
                    {f.desc}
                  </Text>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Text size="sm" tone="muted">{copy("hulianBuiltInExamples")}</Text>
      </aside>

      {/* 右：登录表单 */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          <LoginForm
            logo={
              <span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">{copy("coral2")}</span>
                <span className="text-base font-semibold tracking-tight">{copy("hulianCustomerService2")}</span>
              </span>
            }
            subtitle={copy("welcomeBackLogInToYourCustomer")}
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 600));
              router.push(CS_ROOT);
            }}
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">{copy("forgotPassword")}</Link>
                <Link href="#">{copy("contactAdministrator")}</Link>
              </div>
            }
          />
          <Text size="xs" tone="muted" className="text-center">{copy("demoEnvironmentFillInAnyUsernamePassword")}</Text>
        </div>
      </div>
    </main>
  );
}
