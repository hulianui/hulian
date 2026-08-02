"use client";
import { copy } from "./contact.content";
import { demoHref } from "../../../_components/demo-locale";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Orb,
  Field,
  Input,
  Textarea,
  Button,
  Text,
  Chip,
  Snippet,
  toast,
} from "@hulianui/ui";
import { Send, MessageCircle, Coffee, Sparkles } from "lucide-react";
import { Section } from "./section";
import { profile } from "../../_data/profile";

export function Contact() {
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // 纯前端 demo：不真发请求，只给反馈并清空。
    toast({
      title: copy("receivedIWillReplySoon"),
      description: copy("iUsuallyReplyWithin24HoursYouAreAlsoWelcomeToEmailMeDirectly"),
      tone: "success",
    });
    setEmail("");
    setDate("");
    setMessage("");
  }

  return (
    <Section
      id="contact"
      eyebrow={copy("letSTalk")}
      title={copy("haveAnIdeaLetSBuildSomethingTogether")}
      description={copy("whetherYouWantToCollaborateAskForAdviceOrSimplyMeetAFellowMakerLeaveANoteOrBookAVirtualCoffee")}
      width="6xl"
    >
      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[0.85fr_1fr] lg:gap-12">
        {/* 左：Orb 交互焦点 + 联系入口 */}
        <div className="relative flex flex-col items-center justify-center gap-8 overflow-hidden rounded-[var(--radius)] border border-border bg-surface/50 p-8 backdrop-blur-sm">
          <div className="relative aspect-square w-full max-w-[280px]">
            <Orb hue={210} hoverIntensity={0.35} rotateOnHover />
            {/* Orb 中心标识 */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5">
              <Sparkles className="size-6 text-white/80" aria-hidden />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/70">Let&apos;s talk</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <Text tone="muted" size="sm">

              {copy("preferDirectContact")}
            </Text>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Chip variant="soft" tone="brand" size="md" startContent={<Coffee className="size-3.5" aria-hidden />}>

                {copy("bookACoffee")}
              </Chip>
              <Snippet symbol={null} highlight={false} text={profile.email} className="py-1.5">
                {profile.email}
              </Snippet>
            </div>
          </div>
        </div>

        {/* 右：留言表单 */}
        <div className="rounded-[var(--radius)] border border-border bg-surface/50 p-7 backdrop-blur-sm sm:p-9">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label={copy("yourEmail")} name="email" description={copy("iWillUseItToReply")}>
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field label={copy("wantToBookAOneOnOneConversation")} name="date" description={copy("optionalChooseADayForAVirtualCoffee")}>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>

            <Field label={copy("leaveAMessage")} name="message" description={copy("whatWouldYouLikeToDiscussCollaborationConsultingOrJustSayingHello")}>
              <Textarea
                required
                autoResize
                rows={4}
                placeholder={copy("hiLinYuIWouldLikeToTalkAbout")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" size="lg">
                <Send className="size-4" aria-hidden />

                {copy("sendMessage")}
              </Button>
              <Button variant="ghost" size="lg" render={<Link href={demoHref("/demos/personal/guestbook")} />}>
                <MessageCircle className="size-4" aria-hidden />

                {copy("openThePublicGuestbook")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Section>
  );
}
