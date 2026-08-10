"use client";
import { copy } from "./page.content";

import { useState } from "react";
import {
  SocialButton,
  Button,
  Field,
  Input,
  Divider,
  Spotlight,
  Text,
  toast,
} from "@hulianui/ui";
import { Mail, Lock } from "lucide-react";
import type { SocialProvider } from "@hulianui/ui";
import { brand, BILLING_BASE } from "../_components/nav-config";

const socials: { provider: SocialProvider; label: string }[] = [
  { provider: "wechat", label: copy("wechat") },
  { provider: "alipay", label: copy("alipay") },
];
const moreSocials: SocialProvider[] = ["qq", "weibo", "github", "apple"];

export default function BillingLoginPage() {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<SocialProvider | null>(null);

  const enter = (msg: string) => {
    toast({ title: msg, tone: "success" });
    setTimeout(() => {
      window.location.href = BILLING_BASE;
    }, 450);
  };

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-bg px-4">
      <Spotlight x="50%" y="28%" intensity={9} />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-7">
        <div className="flex flex-col items-center gap-2">
          <div className="grid size-12 place-items-center rounded-[var(--radius-lg)] bg-primary text-xl font-bold text-primary-foreground shadow-md">{copy("han")}</div>
          <div className="text-center">
            <p className="text-lg font-bold tracking-tight text-foreground">
              {brand.name} <span className="text-muted-foreground">{brand.nameEn}</span>
            </p>
            <p className="text-sm text-muted-foreground">{brand.slogan}</p>
          </div>
        </div>

        <form
          className="flex w-full flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            setTimeout(() => enter(copy("loginSuccessfulEnteringTheConsole")), 600);
          }}
        >
          <Field label={copy("email")}>
            <Input type="email" placeholder="you@company.com" prefix={<Mail className="size-4 text-muted-foreground" />} defaultValue="shen.yz@hanyun.io" />
          </Field>
          <Field label={copy("password")}>
            <Input type="password" placeholder="••••••••" prefix={<Lock className="size-4 text-muted-foreground" />} defaultValue="demo1234" />
          </Field>
          <Button type="submit" loading={loading} className="w-full">{copy("login")}</Button>

          <div className="flex items-center gap-3">
            <Divider className="flex-1" />
            <span className="text-xs text-muted-foreground">{copy("orUseTheFollowing")}</span>
            <Divider className="flex-1" />
          </div>

          {/* 第三方登录（SocialButton 主钮 + 图标钮）*/}
          <div className="grid grid-cols-2 gap-3">
            {socials.map((s) => (
              <SocialButton
                key={s.provider}
                provider={s.provider}
                loading={pending === s.provider}
                onClick={() => {
                  setPending(s.provider);
                  setTimeout(() => enter(copy("alreadyLoggedInViaValue", s.label)), 600);
                }}
              >
                {copy("login2", s.label)}</SocialButton>
            ))}
          </div>
          <div className="flex justify-center gap-2">
            {moreSocials.map((p) => (
              <SocialButton key={p} provider={p} shape="icon" aria-label={copy("logInUsingValue", p)} onClick={() => enter(copy("alreadyLoggedInWithValue", p))} />
            ))}
          </div>
        </form>

        <Text size="xs" tone="muted" className="text-center">{copy("demonstrationEnvironmentFillInAnyFormOr")}</Text>
      </div>
    </main>
  );
}
