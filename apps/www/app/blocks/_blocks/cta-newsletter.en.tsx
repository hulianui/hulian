"use client";
import { useState, type FormEvent } from "react";
import { Button, GridPattern, Heading, Input, Text } from "@hulianui/ui";
import { Check, Mail } from "lucide-react";
export function CtaNewsletterBlock() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (status !== "idle" || !email.trim())
            return;
        setStatus("loading");
        window.setTimeout(() => setStatus("done"), 1100);
    }
    return (<section className="px-6 py-20 sm:py-24">
      <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-hairline bg-[var(--color-surface)] px-6 py-14 text-center sm:px-12">

        <GridPattern width={36} height={36} className="pointer-events-none absolute inset-0 h-full w-full text-foreground/[0.04] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]"/>
        <div className="relative flex flex-col items-center gap-4">
          <Heading level={2} size="2xl" weight="bold" balance>
            Subscribe to the HanCloud monthly newsletter
          </Heading>
          <Text tone="muted" size="lg" className="max-w-md">
            One useful email each month with product updates, best practices, and lessons from teams in the field. Unsubscribe anytime.
          </Text>

          {status === "done" ? (<div className="mt-4 flex items-center gap-2 text-primary">
              <Check className="size-5" aria-hidden/>
              <Text size="lg" weight="medium" tone="primary">
                You're subscribed. Welcome to HanCloud!
              </Text>
            </div>) : (<form onSubmit={handleSubmit} className="mt-4 flex w-full max-w-md flex-col gap-2.5 sm:flex-row">
              <Input type="email" required size="lg" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" prefix={<Mail className="size-4 text-muted-foreground" aria-hidden/>} className="flex-1" disabled={status === "loading"} aria-label="Email address"/>
              <Button type="submit" size="lg" loading={status === "loading"} className="sm:w-auto">
                {status === "loading" ? "Submitting" : "Subscribe now"}
              </Button>
            </form>)}

          <Text tone="muted" size="xs" className="mt-1 max-w-sm">
            By submitting, you agree to our Privacy Policy. We will never share your email address with third parties.
          </Text>
        </div>
      </div>
    </section>);
}
