"use client";
import { copy } from "./page.content";
import { useRouter } from "next/navigation";
import { Sparkles, Wand2, Clapperboard } from "lucide-react";
import { Heading, Link, LoginForm, Meteors, Text } from "@hulianui/ui";

const FEATURES = [
  {
    icon: Wand2,
    title: copy("visualNodeOrchestration"),
    desc: copy("dragAndDropToSetUpBirthChartVideoPipeline"),
  },
  {
    icon: Sparkles,
    title: copy("multiModelFreeCombination"),
    desc: copy("promptWordsEnlargementStyleRedrawingCasualStitching"),
  },
  {
    icon: Clapperboard,
    title: copy("oneClickVincentVideo"),
    desc: copy("fromASentenceToAMovingPicture"),
  },
];

export default function AiWorkflowLoginPage() {
  const router = useRouter();

  return (
    <main className="flex h-dvh bg-bg">
      {/* 左：品牌面板 */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white lg:flex">
        <Meteors number={18} />
        <div className="relative z-10 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
            {copy("coral")}
          </span>
          <span className="text-base font-semibold tracking-tight">{copy("reefFlowStudio")}</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Heading level={1} size="3xl" balance className="text-white">
            {copy("puttingIdeas")}
            <br />
            {copy("connectToAPipeline")}
          </Heading>
          <Text className="mt-4 text-white/70">
            {copy("visualizeAndOrganizeAIRawDiagramsAndVideoWorkflowsPrompt")}
          </Text>

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

        <Text size="sm" className="relative z-10 text-white/50">
          {copy("hulianBuiltInExamples")}
        </Text>
      </aside>

      {/* 右：登录表单 */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          <LoginForm
            logo={
              <span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
                  {copy("coral")}
                </span>
                <span className="text-base font-semibold tracking-tight">
                  {copy("reefFlowStudio")}
                </span>
              </span>
            }
            subtitle={copy("logInToStartYourAICreationWorkflow")}
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 600));
              router.push("/demos/ai-workflow");
            }}
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">{copy("forgotPassword")}</Link>
                <Link href="#">{copy("applyForATrial")}</Link>
              </div>
            }
          />
          <Text size="xs" tone="muted" className="text-center">
            {copy("demoEnvironmentLogInWithAnyUsernamePassword")}
          </Text>
        </div>
      </div>
    </main>
  );
}
