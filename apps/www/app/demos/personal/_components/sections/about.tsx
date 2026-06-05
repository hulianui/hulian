"use client";

import { Avatar, Prose, Chip, Text, FlickeringGrid } from "@hulianui/ui";
import { MapPin, AtSign } from "lucide-react";
import { Section } from "./section";
import { profile } from "../../_data/profile";
import { avatarArt } from "../../_lib/art";

export function About() {
  return (
    <Section
      id="about"
      eyebrow="关于我"
      title="一个把自己的痒处做成产品的人"
      width="6xl"
      backdrop={
        // subtle 闪烁网格背景，低透明度不抢内容
        <FlickeringGrid
          squareSize={3}
          gridGap={8}
          flickerChance={0.25}
          maxOpacity={0.12}
          color="var(--color-primary)"
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
        />
      }
    >
      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[260px_1fr] md:gap-14">
        {/* 左：名片卡 */}
        <div className="flex flex-col items-center gap-5 rounded-[var(--radius)] border border-border bg-surface/60 p-7 text-center backdrop-blur-sm md:sticky md:top-24">
          <Avatar
            size="lg"
            src={avatarArt(profile.name, 255, 144)}
            alt={profile.name}
            fallback="林"
            className="size-24 ring-2 ring-primary/20 ring-offset-2 ring-offset-surface"
          />
          <div className="flex flex-col gap-1">
            <span className="flex items-baseline justify-center gap-2">
              <span className="text-lg font-semibold text-foreground">{profile.name}</span>
              <span className="font-mono text-sm text-muted">{profile.nameEn}</span>
            </span>
            <span className="font-mono text-xs text-primary">{profile.handle}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {profile.roles.map((role) => (
              <Chip key={role} variant="soft" tone="neutral" size="sm">
                {role}
              </Chip>
            ))}
          </div>
          <div className="flex w-full flex-col gap-2 border-t border-border pt-4 text-left">
            <Text size="sm" tone="muted" className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden />
              {profile.location}
            </Text>
            <Text size="sm" tone="muted" className="flex items-center gap-2">
              <AtSign className="size-3.5 shrink-0 text-primary" aria-hidden />
              <span className="font-mono">{profile.email}</span>
            </Text>
          </div>
        </div>

        {/* 右：自述长文 */}
        <Prose size="base" className="max-w-none text-pretty leading-8">
          {profile.bio.map((para, i) => (
            <p key={i} className={i === 0 ? "text-lg text-foreground" : undefined}>
              {para}
            </p>
          ))}
        </Prose>
      </div>
    </Section>
  );
}
