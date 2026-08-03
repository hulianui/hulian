"use client";
import { BarChart3, ShieldCheck, Workflow } from "lucide-react";
import { Heading, Link, LoginForm, Spotlight, Text, toast } from "@hulianui/ui";
const FEATURES = [
    { icon: Workflow, title: "End-to-end business operations", desc: "Track every key action from first contact to closed deal" },
    { icon: BarChart3, title: "Real-time data dashboard", desc: "See trends, funnels, and details on one screen" },
    { icon: ShieldCheck, title: "Secure and controlled", desc: "Field-level permissions and operation auditing" },
];
export function LoginPage() {
    return (<main className="flex min-h-[44rem] bg-bg">

      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        <Spotlight x="30%" intensity={14}/>
        <div className="relative z-10 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
            H
          </span>
          <span className="text-base font-semibold tracking-tight">Hulian</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Heading level={1} size="3xl" balance>
            Built for teams
            <br />
            Integrated work platform
          </Heading>
          <Text tone="muted" className="mt-4">
            Unified accounts, permissions, and data make collaboration transparent and decisions evidence-based.
          </Text>

          <ul className="mt-10 flex flex-col gap-5">
            {FEATURES.map((f) => (<li key={f.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--radius)] bg-primary/12 text-primary">
                  <f.icon className="size-[18px]"/>
                </span>
                <div>
                  <div className="font-medium">{f.title}</div>
                  <Text size="sm" tone="muted">
                    {f.desc}
                  </Text>
                </div>
              </li>))}
          </ul>
        </div>

        <Text size="sm" tone="muted" className="relative z-10">
          © 2026 Hulian · Built-in examples
        </Text>
      </aside>


      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          <LoginForm logo={<span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
                  H
                </span>
                <span className="text-base font-semibold tracking-tight">Hulian</span>
              </span>} subtitle="Welcome back. Sign in to your workspace." onFinish={async () => {
            await new Promise((r) => setTimeout(r, 600));
            toast({ title: "Login successful", description: "Demo: sign in with any email and password.", tone: "success" });
        }} footer={<div className="flex justify-between text-sm">
                <Link href="#">Forgot password</Link>
                <Link href="#">Request a trial</Link>
              </div>}/>
          <Text size="xs" tone="muted" className="text-center">
            Demo: enter any username and password to sign in
          </Text>
        </div>
      </div>
    </main>);
}
