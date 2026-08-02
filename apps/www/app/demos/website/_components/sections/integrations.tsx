import { copy } from "./integrations.content";
import {
  OrbitingCircles,
  Heading,
  Text,
  Tag,
  Stack,
} from "@hulianui/ui";
import { Cloud } from "lucide-react";
import { integrations } from "../../_data/site";

function OrbitIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm">
      {children}
    </span>
  );
}

// 集成生态：双层 OrbitingCircles 环绕中心品牌 logo，右侧文案。
export function Integrations() {
  const outer = integrations.slice(0, 4);
  const inner = integrations.slice(4);
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

            {copy("integrations")}
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">

            {copy("connectToTheToolsYouAlreadyUse")}
          </Heading>
          <Text tone="muted" size="lg" className="mt-4">

            {copy("connectGithubDockerKubernetesSlackPostgresAndDatadogOnceAndKeepThemInSyncHancloudConnectsYourExi")}
          </Text>
          <Stack direction="row" gap={2} wrap className="mt-6">
            {integrations.map((it) => (
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
