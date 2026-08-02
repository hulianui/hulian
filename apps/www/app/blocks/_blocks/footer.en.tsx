"use client";
import { useState } from "react";
import Link from "next/link";
import { SocialButton, Input, Button, Heading, Text, Divider } from "@hulianui/ui";
import { Cloud, Globe, ArrowRight } from "lucide-react";
const columns = [
    {
        title: "Products",
        links: ["Elastic deployment", "edge network", "Observability", "Compute marketplace", "Object storage"],
    },
    {
        title: "Resources",
        links: ["Documentation", "Component library", "Changelog", "status page", "API reference"],
    },
    {
        title: "Company",
        links: ["About us", "Careers", "Customer stories", "Partners", "Contact sales"],
    },
    {
        title: "Legal",
        links: ["Terms of Service", "Privacy Policy", "Service-level agreement", "Security and compliance"],
    },
];
export function FooterBlock() {
    const [email, setEmail] = useState("");
    return (<footer className="border-t border-border bg-surface/40 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 py-16">

        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">

          <div className="col-span-2">
            <Link href="#" className="flex items-center gap-2 text-foreground">
              <span className="flex size-7 items-center justify-center rounded-[min(var(--radius),0.5rem)] bg-primary text-primary-foreground">
                <Cloud className="size-4" aria-hidden/>
              </span>
              <span className="text-base font-semibold">HanCloud</span>
            </Link>
            <Text tone="muted" size="sm" className="mt-4 max-w-xs">
              Go from git push to a global release with deployment, elastic compute, and end-to-end observability on one platform.
            </Text>
            <div className="mt-5 flex items-center gap-2">
              <SocialButton provider="github" shape="icon" variant="outline" aria-label="GitHub"/>
              <SocialButton provider="x" shape="icon" variant="outline" aria-label="X"/>
              <SocialButton provider="weibo" shape="icon" variant="outline" aria-label="Weibo"/>
              <SocialButton provider="wechat" shape="icon" variant="outline" aria-label="WeChat"/>
            </div>
          </div>


          {columns.map((col) => (<div key={col.title}>
              <Text size="sm" weight="medium" className="text-foreground">
                {col.title}
              </Text>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((label) => (<li key={label}>
                    <Link href="#" className="text-sm text-muted transition-colors hover:text-foreground">
                      {label}
                    </Link>
                  </li>))}
              </ul>
            </div>))}
        </div>


        <Divider className="my-10"/>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Heading level={3} size="lg" weight="semibold" className="text-foreground">
              Subscribe to monthly product newsletters
            </Heading>
            <Text tone="muted" size="sm" className="mt-1">
              One email a month with new features, best practices, and platform news. No noise.
            </Text>
          </div>
          <form className="flex w-full max-w-sm items-center gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address"/>
            <Button type="submit" className="shrink-0">
              Subscribe
              <ArrowRight className="size-4" aria-hidden/>
            </Button>
          </form>
        </div>


        <Divider className="my-10"/>
        <div className="flex flex-col gap-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 HanCloud Technology · All rights reserved</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="#" className="flex items-center gap-1.5 text-muted transition-colors hover:text-foreground">
              <Globe className="size-4" aria-hidden/>
              Simplified Chinese
            </Link>
            <Link href="#" className="text-muted transition-colors hover:text-foreground">
              Guangdong ICP No. 2026000000
            </Link>
          </div>
        </div>
      </div>
    </footer>);
}
