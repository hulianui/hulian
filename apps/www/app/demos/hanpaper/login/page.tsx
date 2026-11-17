"use client";
import { copy } from "./page.content";

import { useRouter } from "next/navigation";
import { BookMarked, Printer, Workflow } from "lucide-react";
import { DotPattern, Heading, Link, LoginForm, Text } from "@hulianui/ui";

const FEATURES = [
  { icon: Workflow, title: copy("featureFlowTitle"), desc: copy("featureFlowBody") },
  { icon: Printer, title: copy("featureExportTitle"), desc: copy("featureExportBody") },
  { icon: BookMarked, title: copy("featureLoopTitle"), desc: copy("featureLoopBody") },
];

function BrandMark({ size }: { size: "sm" | "md" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={
          size === "md"
            ? "grid size-8 place-items-center rounded-[var(--radius)] bg-primary font-serif text-sm font-bold text-primary-foreground"
            : "grid size-7 place-items-center rounded-[var(--radius)] bg-primary font-serif text-sm font-bold text-primary-foreground"
        }
      >
        {copy("brandMark")}
      </span>
      <span className="text-base font-semibold tracking-tight">{copy("brandName")}</span>
    </span>
  );
}

export default function HanPaperLoginPage() {
  const router = useRouter();

  return (
    <main className="flex h-dvh bg-bg">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white lg:flex">
        <DotPattern className="absolute inset-0 text-white/10" />
        <div className="relative z-10">
          <BrandMark size="md" />
        </div>

        <div className="relative z-10 max-w-md">
          <Heading level={1} size="3xl" balance className="font-serif text-white">
            {copy("headline")}
          </Heading>
          <Text className="mt-4 text-white/70">{copy("subheadline")}</Text>

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
          {copy("footnote")}
        </Text>
      </aside>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          <LoginForm
            logo={<BrandMark size="sm" />}
            subtitle={copy("subtitle")}
            fields={{
              username: { label: copy("usernameLabel"), placeholder: copy("usernamePlaceholder"), autoComplete: "username" },
            }}
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 600));
              router.push("/demos/hanpaper");
            }}
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">{copy("forgotPassword")}</Link>
                <Link href="#">{copy("signInWithOrcid")}</Link>
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
