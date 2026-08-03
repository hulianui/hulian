/** @jsxImportSource ../../../lib/fixture-jsx */
import { OrbitingCircles, Heading, Text, Tag, Stack } from "@hulianui/ui";
import {
  Cloud,
  GitBranch,
  Container,
  Boxes,
  MessageSquare,
  Database,
  Gauge,
  type LucideIcon,
} from "lucide-react";

// 集成生态 Block —— 自包含、可整段复制。
// 双层 OrbitingCircles 环绕中心品牌 logo，右侧文案 + 集成标签墙。
// 数据内联在本文件，复制后改 INTEGRATIONS 即可。

interface Integration {
  name: string;
  icon: LucideIcon;
}

const INTEGRATIONS: Integration[] = [
  { name: "GitHub", icon: GitBranch },
  { name: "Docker", icon: Container },
  { name: "Kubernetes", icon: Boxes },
  { name: "Slack", icon: MessageSquare },
  { name: "Postgres", icon: Database },
  { name: "Datadog", icon: Gauge },
];

function OrbitIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm">
      {children}
    </span>
  );
}

export function IntegrationsBlock() {
  const outer = INTEGRATIONS.slice(0, 4);
  const inner = INTEGRATIONS.slice(4);
  return (
    <section className="border-b border-border px-6 py-20 sm:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="relative flex h-[360px] items-center justify-center">
          <span className="z-10 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Cloud className="size-8" aria-hidden />
          </span>
          <OrbitingCircles radius={150} duration={26} iconSize={40}>
            {outer.map((it) => {
              const Icon = it.icon;
              return (
                <OrbitIcon key={it.name}>
                  <Icon className="size-5" aria-hidden />
                </OrbitIcon>
              );
            })}
          </OrbitingCircles>
          <OrbitingCircles radius={90} duration={18} iconSize={36} reverse>
            {inner.map((it) => {
              const Icon = it.icon;
              return (
                <OrbitIcon key={it.name}>
                  <Icon className="size-5" aria-hidden />
                </OrbitIcon>
              );
            })}
          </OrbitingCircles>
        </div>

        <div>
          <Tag variant="soft" tone="brand" size="sm" className="mb-4">
            生态集成
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            接入你已经在用的工具
          </Heading>
          <Text tone="muted" size="lg" className="mt-4">
            GitHub、Docker、Kubernetes、Slack、Postgres、Datadog…… 一次连接，自动同步。瀚云不替换你的工具链，而是把它们串成一条顺畅的交付流水线。
          </Text>
          <Stack direction="row" gap={2} wrap className="mt-6">
            {INTEGRATIONS.map((it) => (
              <Tag key={it.name} variant="outline" tone="neutral">
                {it.name}
              </Tag>
            ))}
          </Stack>
        </div>
      </div>
    </section>
  );
}
