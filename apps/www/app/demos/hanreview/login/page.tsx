"use client";
import { copy } from "./page.content";

import { useRouter } from "next/navigation";
import { ShieldCheck, GitPullRequest, Sparkles } from "lucide-react";
import { Heading, Link, LoginForm, Meteors, Text } from "@hulianui/ui";

const FEATURES = [
  { icon: GitPullRequest, title: copy("fileByFileAiReview"), desc: copy("prEntersAndAutomaticallyReviewsEachFile") },
  { icon: Sparkles, title: copy("intelligentModelSelection"), desc: copy("assignTheMostSuitableModelBasedOn") },
  { icon: ShieldCheck, title: copy("qualityAccessControl"), desc: copy("scoresSeriousIssuesAndCoverageRatesAre") },
];

export default function HanReviewLoginPage() {
  const router = useRouter();

  return (
    <main className="flex h-dvh bg-bg">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white lg:flex">
        <Meteors number={18} />
        <div className="relative z-10 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">{copy("coral")}</span>
          <span className="text-base font-semibold tracking-tight">{copy("hanreviewHanreview")}</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Heading level={1} size="3xl" balance className="text-white">{copy("seniorReviewers")}<br />{copy("eyeScaling")}</Heading>
          <Text className="mt-4 text-white/70">{copy("eachPrIsReviewedAndAiReviewers")}</Text>

          <ul className="mt-10 flex flex-col gap-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--radius)] bg-white/10 text-primary-foreground">
                  <f.icon className="size-[18px]" />
                </span>
                <div>
                  <div className="font-medium text-white">{f.title}</div>
                  <Text size="sm" className="text-white/60">
                    {f.desc}
                  </Text>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Text size="sm" className="relative z-10 text-white/50">{copy("hulianBuiltInExample")}</Text>
      </aside>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          <LoginForm
            logo={
              <span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">{copy("coral2")}</span>
                <span className="text-base font-semibold tracking-tight">{copy("hanreviewHanreview2")}</span>
              </span>
            }
            subtitle={copy("logInToEnterTheCodeReview")}
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 600));
              router.push("/demos/hanreview");
            }}
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">{copy("forgotThePassword")}</Link>
                <Link href="#">{copy("connectToYourWarehouse")}</Link>
              </div>
            }
          />
          <Text size="xs" tone="muted" className="text-center">{copy("demoEnvironmentLogInByEnteringAny")}</Text>
        </div>
      </div>
    </main>
  );
}
