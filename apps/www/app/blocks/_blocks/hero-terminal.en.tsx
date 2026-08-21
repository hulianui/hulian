import Link from "next/link";
import { Button, Terminal, Tag, Heading, Text } from "@hulianui/ui";
import { ArrowRight, TerminalSquare } from "lucide-react";
const LINES = [
    { prompt: "$", text: "npm i -g @hulian/cli", tone: "command" as const },
    { prompt: "$", text: "hulian deploy", tone: "command" as const },
    { text: "\u2713 Next.js project detected", tone: "muted" as const },
    { text: "\u2713 Build artifact: 12.4 MB \u00B7 Uploaded", tone: "muted" as const },
    { text: "\u2713 Distributed to 28 edge nodes", tone: "muted" as const },
    { text: "\uD83D\uDE80 Deployed successfully: https://my-app.hulian.app", tone: "success" as const },
];
export function HeroTerminalBlock({ ctaHref = "#" }: {
    ctaHref?: string;
}) {
    return (<section className="relative overflow-hidden border-b border-border bg-bg">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:gap-10 md:py-28">

        <div className="flex flex-col items-start gap-6 text-left">
          <Tag variant="soft" tone="brand" size="md" icon={<TerminalSquare className="size-3.5"/>}>
            Built for developers
          </Tag>

          <Heading level={1} weight="bold" balance className="text-4xl leading-tight text-foreground sm:text-5xl">
            One command,
            <br className="hidden sm:block"/>
            Deploy your app to the global edge
          </Heading>

          <Text tone="muted" size="lg" className="max-w-md">
            No configuration or infrastructure maintenance. HanCloud CLI detects your framework, builds the app, and distributes it worldwide before your coffee is ready.
          </Text>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button size="lg" render={<Link href={ctaHref}/>}>
              Install CLI
              <ArrowRight className="ml-2 size-4" aria-hidden/>
            </Button>
            <Button variant="outline" size="lg" render={<Link href="https://example.com/#docs"/>}>
              Read the documentation
            </Button>
          </div>

          <Text tone="muted" size="sm">
            Next.js · Vite · Astro · Any static or SSR framework
          </Text>
        </div>


        <div className="md:justify-self-end">
          <Terminal title="bash · hulian deploy" lines={LINES} className="max-w-full shadow-xl md:max-w-lg"/>
        </div>
      </div>
    </section>);
}
