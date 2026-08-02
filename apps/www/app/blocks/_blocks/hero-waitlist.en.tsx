"use client";
import { useState } from "react";
import { AvatarCircles, Button, Input, Tag, Heading, Text } from "@hulianui/ui";
import { Check, Mail, Sparkles } from "lucide-react";
function avatar(a: string, b: string): string {
    return ("data:image/svg+xml;utf8," +
        encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
        <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='${a}'/><stop offset='100%' stop-color='${b}'/>
        </linearGradient></defs>
        <rect width='80' height='80' fill='url(#g)'/>
      </svg>`));
}
const AVATARS = [
    { src: avatar("#6366f1", "#8b5cf6"), alt: "Member avatar" },
    { src: avatar("#0ea5e9", "#22d3ee"), alt: "Member avatar" },
    { src: avatar("#f43f5e", "#fb923c"), alt: "Member avatar" },
    { src: avatar("#10b981", "#34d399"), alt: "Member avatar" },
    { src: avatar("#eab308", "#f59e0b"), alt: "Member avatar" },
];
export function HeroWaitlistBlock() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    return (<section className="relative overflow-hidden border-b border-border bg-bg">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center md:py-32">
        <Tag variant="soft" tone="brand" size="md" icon={<Sparkles className="size-3.5"/>}>
          Coming to public beta · Early access
        </Tag>

        <Heading level={1} weight="bold" balance className="text-4xl leading-tight text-foreground sm:text-5xl">
          Join the HanCloud waitlist
        </Heading>

        <Text tone="muted" size="lg" className="max-w-xl">
          We're inviting a small group of teams to try our new cloud workspace. Leave your email and we'll notify you when the public beta opens.
        </Text>


        <form className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => {
            e.preventDefault();
            if (email.trim())
                setSubmitted(true);
        }}>
          <Input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} prefix={<Mail className="size-4"/>} disabled={submitted} className="flex-1" aria-label="Email address"/>
          <Button type="submit" size="lg" disabled={submitted}>
            {submitted ? (<>
                <Check className="mr-1.5 size-4" aria-hidden/>
                Joined
              </>) : ("Apply to join")}
          </Button>
        </form>

        {submitted && (<Text tone="primary" size="sm">
            🎉 You're on the list. We'll email you when the public beta opens.
          </Text>)}


        <div className="mt-4 flex flex-col items-center gap-3">
          <AvatarCircles avatars={AVATARS} extraCount={99} size="md"/>
          <Text tone="muted" size="sm">
            Already have <span className="font-medium text-foreground">8,200+</span> people added to waiting list
          </Text>
        </div>
      </div>
    </section>);
}
