"use client";
import Link from "next/link";
import { LoginForm, Divider, SocialButton, Link as UILink, } from "@hulianui/ui";
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
export function LoginBlock() {
    return (<section className="flex w-full items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <LoginForm logo={<span className="inline-flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                Han
              </span>
              <span className="text-base font-semibold tracking-tight">HanCloud console</span>
            </span>} title="Welcome back" subtitle="Sign in to your HanCloud account to manage your projects" onFinish={async () => {
            await sleep(700);
        }} footer={<div className="flex flex-col gap-0">
              <div className="flex justify-end text-sm">
                <UILink href="#">Forgot your password?</UILink>
              </div>

              <Divider plain className="my-6 text-muted">
                or
              </Divider>

              <div className="grid gap-3">
                <SocialButton provider="github" className="w-full justify-center">
                  Sign in with GitHub
                </SocialButton>
                <SocialButton provider="google" className="w-full justify-center">
                  Sign in with Google
                </SocialButton>
              </div>

              <p className="mt-6 text-center text-sm text-muted">
                Don't have an account yet?{" "}
                <Link href="#" className="font-medium text-primary underline-offset-4 hover:underline">
                  Create an account
                </Link>
              </p>
            </div>}/>
      </div>
    </section>);
}
