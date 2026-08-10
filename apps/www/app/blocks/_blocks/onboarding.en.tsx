"use client";
import { useState } from "react";
import { Button, Field, Heading, Input, Progress, Result, Steps, Text, type StepsItem, } from "@hulianui/ui";
import { ArrowLeft, ArrowRight, Check, Cloud, GitBranch, Settings2, UserPlus } from "lucide-react";
const STEPS: StepsItem[] = [
    { title: "Create account", description: "Basic information" },
    { title: "Connect repository", description: "Code source" },
    { title: "Configure environment", description: "Operating parameters" },
    { title: "Production release", description: "Complete deployment" },
];
const STEP_ICONS = [UserPlus, GitBranch, Settings2, Cloud];
export function OnboardingBlock() {
    const [current, setCurrent] = useState(0);
    const total = STEPS.length;
    const isLast = current === total - 1;
    const progress = Math.round((current / (total - 1)) * 100);
    const Icon = STEP_ICONS[current];
    return (<div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 text-center">
        <Heading level={1} size="2xl" weight="bold" className="text-foreground">
          Welcome to HanCloud
        </Heading>
        <Text tone="muted" size="sm" className="mt-1">
          Deploy your first application in four steps.
        </Text>
      </div>


      <Steps items={STEPS} current={current} onChange={setCurrent} className="mb-8"/>


      <div className="rounded-[var(--radius)] border border-border bg-surface p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius)] bg-primary/10 text-primary">
            <Icon className="size-5"/>
          </div>
          <div>
            <Heading level={2} size="lg" weight="semibold">
              {STEPS[current].title}
            </Heading>
            <Text tone="muted" size="sm">
              Step {current + 1} / {total}
            </Text>
          </div>
        </div>


        {current === 0 && (<div className="flex flex-col gap-4">
            <Text tone="muted" size="sm">
              First tell us some basic information so we can create a workspace for you.
            </Text>
            <Field label="Workspace name">
              <Input placeholder="For example: HanCloud commerce team" defaultValue="HanCloud commerce team"/>
            </Field>
            <Field label="Team email" description="Used for deployment and incident alerts">
              <Input type="email" placeholder="team@company.com"/>
            </Field>
          </div>)}

        {current === 1 && (<div className="flex flex-col gap-4">
            <Text tone="muted" size="sm">
              Choose a code source and HanCloud will clone and build your project automatically.
            </Text>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {["GitHub", "GitLab", "Upload archive"].map((src, i) => (<button key={src} type="button" className={[
                    "rounded-[var(--radius)] border p-4 text-left text-sm font-medium transition-colors",
                    i === 0
                        ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                ].join(" ")}>
                  <GitBranch className="mb-2 size-5 text-primary"/>
                  {src}
                </button>))}
            </div>
          </div>)}

        {current === 2 && (<div className="flex flex-col gap-4">
            <Text tone="muted" size="sm">
              Configure the runtime and build command, or leave them blank to use smart defaults.
            </Text>
            <Field label="Build command">
              <Input defaultValue="pnpm build"/>
            </Field>
            <Field label="Output directory">
              <Input defaultValue="dist"/>
            </Field>
            <Field label="Environment variables" description="Format KEY=VALUE, one per line">
              <Input placeholder="NODE_ENV=production"/>
            </Field>
          </div>)}

        {current === 3 && (<Result status="success" icon={<Check className="size-7"/>} title="Everything is ready to ship" subTitle="Configuration is complete. Click the button below and HanCloud will start building and deploying your application to edge nodes around the world."/>)}


        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Onboarding progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} tone="primary"/>
        </div>


        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
            <ArrowLeft className="size-4"/>
            Previous step
          </Button>
          {isLast ? (<Button>
              <Cloud className="size-4"/>
              Deploy now
            </Button>) : (<Button onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}>
              Next step
              <ArrowRight className="size-4"/>
            </Button>)}
        </div>
      </div>
    </div>);
}
