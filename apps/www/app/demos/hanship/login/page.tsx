"use client";
import { copy } from "./page.content";

import { useRouter } from "next/navigation";
import { Rocket, GitBranch, Globe } from "lucide-react";
import { Heading, Link, LoginForm, DotPattern, Text } from "@hulianui/ui";

const FEATURES = [
  { icon: GitBranch, title: copy("connectToGitAndDeployAutomatically"), desc: copy("pushToProductionBranchToBuildAutomatically") },
  { icon: Rocket, title: copy("buildAndObserve"), desc: copy("buildLogsInRealTimeTakeTime") },
  { icon: Globe, title: copy("edgeNetworkFreeTls"), desc: copy("globalNodeDistributionCustomDomainNameAutomatic") },
];

export default function HanShipLoginPage() {
  const router = useRouter();

  return (
    <main className="flex h-dvh bg-bg">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white lg:flex">
        <DotPattern className="absolute inset-0 text-white/10" />
        <div className="relative z-10 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">{copy("ship")}</span>
          <span className="text-base font-semibold tracking-tight">{copy("hanship")}</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Heading level={1} size="3xl" balance className="text-white">{copy("pushFromGit")}<br />{copy("goOnlineGlobally")}</Heading>
          <Text className="mt-4 text-white/70">{copy("connectToTheWarehouseAutomaticallyBuildPreview")}</Text>

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

        <Text size="sm" className="relative z-10 text-white/50">{copy("hanshipBuiltInExamples")}</Text>
      </aside>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          <LoginForm
            logo={
              <span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">{copy("ship2")}</span>
                <span className="text-base font-semibold tracking-tight">{copy("hanship2")}</span>
              </span>
            }
            subtitle={copy("logInToTheDeploymentConsole")}
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 600));
              router.push("/demos/hanship");
            }}
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">{copy("forgotPassword")}</Link>
                <Link href="#">{copy("signInWithGithub")}</Link>
              </div>
            }
          />
          <Text size="xs" tone="muted" className="text-center">{copy("demoEnvironmentFillInAnyUsernamePassword")}</Text>
        </div>
      </div>
    </main>
  );
}
