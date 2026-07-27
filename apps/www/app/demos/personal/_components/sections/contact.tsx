"use client";

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
      title: "已收到，我会尽快回复",
      description: "通常 24 小时内回信。也欢迎直接发邮件给我。",
      tone: "success",
    });
    setEmail("");
    setDate("");
    setMessage("");
  }

  return (
    <Section
      id="contact"
      eyebrow="聊聊"
      title="有想法？一起做点东西"
      description="不管是合作、咨询，还是单纯想认识同好——给我留个言，或者约一杯线上咖啡。"
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
              更喜欢直接联系？
            </Text>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Chip variant="soft" tone="brand" size="md" startContent={<Coffee className="size-3.5" aria-hidden />}>
                约杯咖啡
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
            <Field label="你的邮箱" name="email" description="我会用它回信给你">
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field label="想约个 1:1 的时间？" name="date" description="可选——选一天，我们约线上咖啡">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>

            <Field label="留言" name="message" description="想聊什么？合作、咨询、或只是打个招呼">
              <Textarea
                required
                autoResize
                rows={4}
                placeholder="嗨，林屿，我想和你聊聊……"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" size="lg">
                <Send className="size-4" aria-hidden />
                发送留言
              </Button>
              <Button variant="ghost" size="lg" render={<Link href="/demos/personal/guestbook" />}>
                <MessageCircle className="size-4" aria-hidden />
                去公开留言板
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Section>
  );
}
