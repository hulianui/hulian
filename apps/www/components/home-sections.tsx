import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileText, Plug, ShieldCheck } from "lucide-react";
import {
  Avatar,
  Button,
  ChatMessage,
  NumberTicker,
  Snippet,
  Tag,
  Text,
  ToolCall,
} from "@hulianui/ui";
import { DOCS_LOCALE, withDocsBasePath } from "../lib/docs-locale";

// 首页 hero 之后的三段：深色 AI 带、「用瑚琏做出来的站」、收尾 CTA。
// 都是 server 组件；里面用到的 ChatMessage / ToolCall / NumberTicker 自带 "use client"。

const en = DOCS_LOCALE === "en";

const copy = en
  ? {
      ai: {
        eyebrow: "AI native",
        title: ["Your AI assistant,", "fluent in your UI kit"],
        lead: "Ships the context an LLM needs.",
        points: [
          {
            title: "MCP server",
            desc: "One command and your assistant can look up props instead of guessing.",
          },
          {
            title: "Usage contract",
            desc: "llms.txt covers every component's purpose, examples and known pitfalls.",
          },
          { title: "Guard", desc: "Generated code is checked against the rules before it lands." },
        ],
        stats: ["components", "animated", "blocks", "pages"],
        prompt: "Build an orders table with filters using Hulian",
        reply: "Done. ProTable handles the filters; I kept the status column on Tag tones.",
      },
      built: {
        eyebrow: "In production",
        title: ["Built natively", "on Hulian UI"],
        sites: [
          {
            name: "haloritual",
            blurb: "Brand site for Haloritual",
            url: "haloritual.com",
            img: "haloritual",
          },
          {
            name: "Hulian · Abel",
            blurb: "Personal site of a full-stack indie developer",
            url: "zhangzhiwei.com.cn",
            img: "abel",
          },
          {
            name: "Mock Pilot",
            blurb: "Mock data workbench for profiles, fields and API responses",
            url: "mock.haloritual.com",
            img: "mock",
          },
        ],
      },
      closing: {
        title: ["Start building software ", "that looks as good as it works"],
        start: "Read the getting-started guide",
        browse: "Browse components",
        foundations: "Built on",
        muiBridge: "MUI bridge",
        declaration: "People deserve software that is a pleasure to work with.",
      },
      copy: "Copy",
      copied: "Copied",
    }
  : {
      ai: {
        eyebrow: "AI 原生",
        title: ["让 AI 编程助手，", "读懂你的组件库"],
        lead: "交付 LLM 需要的 context。",
        points: [
          { title: "MCP 服务", desc: "一行命令装上，助手查 props 而不是猜 props。" },
          { title: "使用契约", desc: "llms.txt 写清每个组件的用途、示例和已知的坑。" },
          { title: "Guard 校验", desc: "生成的代码落盘前，先按规则过一遍。" },
        ],
        stats: ["个组件", "个动效", "个区块", "个页面"],
        prompt: "用瑚琏做一个带筛选的订单表格",
        reply: "好了。筛选交给 ProTable，状态列沿用 Tag 的语义色。",
      },
      built: {
        eyebrow: "已在生产",
        title: ["基于瑚琏 UI", "原生实现"],
        sites: [
          {
            name: "haloritual",
            blurb: "矩光涌现官网 · 让智能从结构中涌现",
            url: "haloritual.com",
            img: "haloritual",
          },
          {
            name: "瑚琏 · Abel",
            blurb: "全栈开发者个人站 · 产品 / UI / UX / 前后端",
            url: "zhangzhiwei.com.cn",
            img: "abel",
          },
          {
            name: "Mock Pilot",
            blurb: "Mock 数据工作台 · 个人、账号、业务字段与接口响应",
            url: "mock.haloritual.com",
            img: "mock",
          },
        ],
      },
      closing: {
        title: ["现在开始，", "做好看又好用的软件"],
        start: "阅读上手指南",
        browse: "浏览组件",
        foundations: "站在巨人肩上",
        muiBridge: "MUI 桥",
        declaration: "人不该油头满面地对着丑软件干活。",
      },
      copy: "复制",
      copied: "已复制",
    };

const POINT_ICONS = [Plug, FileText, ShieldCheck];

// 每个 tag 都挂上游源头。OKLCH 是规格而不是产品，源头是 W3C CSS Color 4 里 okLCH 的定义。
const STACK = [
  { label: "Base UI", href: "https://base-ui.com" },
  { label: "TanStack Table", href: "https://tanstack.com/table/latest" },
  { label: "Recharts", href: "https://recharts.org" },
  { label: "Tailwind v4", href: "https://tailwindcss.com" },
  { label: "Motion", href: "https://motion.dev" },
  { label: "MagicUI", href: "https://magicui.design" },
  { label: copy.closing.muiBridge, href: "https://mui.com" },
  { label: "OKLCH Token", href: "https://www.w3.org/TR/css-color-4/#ok-lab" },
];

function SectionTitle({
  eyebrow,
  title,
  center,
  oneLine,
}: {
  eyebrow: string;
  title: [string, string] | string[];
  center?: boolean;
  /** 两半标题排在同一行（窄屏放不下时自然折行），不强制换行 */
  oneLine?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Text size="sm" weight="semibold" className="text-primary">
        {eyebrow}
      </Text>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title[0]}
        {oneLine ? " " : <br />}
        <span className="text-primary">{title[1]}</span>
      </h2>
    </div>
  );
}

/** 深色 AI 带：data-theme="dark" 把这一段子树切到暗色 token，全站明暗都是一条深色断点。 */
export function HomeAiBand({ counts }: { counts: [number, number, number, number] }) {
  const c = copy.ai;
  return (
    <section data-theme="dark" className="bg-[oklch(0.16_0.012_262)] text-foreground">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-24 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
        <div>
          <SectionTitle eyebrow={c.eyebrow} title={c.title} />
          <Text tone="muted" className="mt-4 max-w-xl leading-relaxed">
            {c.lead}
          </Text>
          <ul className="mt-10 space-y-6">
            {c.points.map((p, i) => {
              const Icon = POINT_ICONS[i];
              return (
                <li key={p.title} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-surface text-primary">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <div>
                    <Text weight="semibold">{p.title}</Text>
                    <Text size="sm" tone="muted" className="mt-0.5 leading-relaxed">
                      {p.desc}
                    </Text>
                  </div>
                </li>
              );
            })}
          </ul>
          <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
            {counts.map((n, i) => (
              <div key={c.stats[i]}>
                <dd className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
                  <NumberTicker value={n} />
                </dd>
                <dt className="mt-1 text-sm text-muted-foreground">{c.stats[i]}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* 一段对话：提问 → 两次工具调用 → 带代码的回答。窗口外皮与「产品线」那段的预览窗一致 */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/40">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <Tag tone="brand" size="sm" className="ml-3">
              MCP
            </Tag>
          </div>
          <div className="space-y-4 p-5">
            <ChatMessage
              role="user"
              avatar={
                <Avatar
                  size="md"
                  src={withDocsBasePath("/demo/avatar-12.jpg")}
                  fallback="A"
                  alt="Abel"
                />
              }
            >
              {c.prompt}
            </ChatMessage>
            <ToolCall
              name="hulian.get_component"
              status="success"
              input={<code className="font-mono text-xs">{'{ "name": "ProTable" }'}</code>}
              output="ProTable · 38 props · 4 pitfalls"
            />
            <ToolCall
              name="hulian.get_pitfalls"
              status="success"
              input={<code className="font-mono text-xs">{'{ "name": "Tag" }'}</code>}
              output="tone ≠ color · 2 pitfalls"
            />
            <ChatMessage
              role="assistant"
              avatar={
                // AI 头像用瑚琏 logo（mask 着色，见 globals.css .hl-logo），跟着首页主题色走
                <span className="grid size-10 place-items-center rounded-full border border-primary-border bg-primary-subtle">
                  <span
                    role="img"
                    aria-label="Hulian AI"
                    className="hl-logo size-6"
                    style={{
                      maskImage: `url(${withDocsBasePath("/logo.svg")})`,
                      WebkitMaskImage: `url(${withDocsBasePath("/logo.svg")})`,
                    }}
                  />
                </span>
              }
            >
              <p>{c.reply}</p>
            </ChatMessage>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 用瑚琏做出来的站：真站截图卡片，整卡可点、新窗口打开。 */
export function HomeBuiltWith() {
  const c = copy.built;
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
      <SectionTitle eyebrow={c.eyebrow} title={c.title} oneLine />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {c.sites.map((site) => (
          <a
            key={site.url}
            href={`https://${site.url}`}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-sm outline-none transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="border-b border-border/70 bg-muted/40 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- 静态导出，next/image 优化不可用 */}
              <img
                src={withDocsBasePath(`/home/${site.img}.jpg`)}
                alt=""
                width={960}
                height={600}
                loading="lazy"
                className="aspect-[16/10] w-full rounded-lg border border-border/70 object-cover object-top"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <Text weight="semibold">{site.name}</Text>
                <ArrowUpRight
                  className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden
                />
              </div>
              <Text size="sm" tone="muted" className="mt-1">
                {site.blurb}
              </Text>
              <Text size="xs" className="mt-3 font-mono text-muted-foreground">
                {site.url}
              </Text>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/** 收尾：再给一次主动作，底下是技术底座与品牌宣言。 */
export function HomeClosing() {
  const c = copy.closing;
  return (
    <section className="relative isolate overflow-hidden border-t border-border/60">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 0%, color-mix(in oklch, var(--color-primary) 10%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl px-6 py-24 text-center sm:py-28">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {c.title[0]}
          <span className="text-primary">{c.title[1]}</span>
        </h2>
        <div className="mx-auto mt-8 w-fit max-w-full">
          <Snippet copyLabel={copy.copy} copiedLabel={copy.copied}>
            pnpm add @hulianui/ui @hulianui/tokens
          </Snippet>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button render={<Link href="/start" />} className="group">
            {c.start}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Button>
          <Button variant="outline" render={<Link href="/components" />}>
            {c.browse}
          </Button>
        </div>

        <div className="mx-auto mt-20 max-w-3xl border-t border-border/70 pt-8">
          <Text size="xs" weight="medium" tone="muted">
            {c.foundations}
          </Text>
          {/* 静态排开，不用 Marquee：跑马灯的复制份 aria-hidden 里的 <a> 仍可 Tab 到（axe 判错），
              八个短标签静态换行就排得下，全部可点、键盘可达、读屏只读一遍。 */}
          <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {STACK.map((tag) => (
              <a
                key={tag.href}
                href={tag.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {tag.label}
              </a>
            ))}
          </div>
          <Text size="sm" tone="muted" className="mt-10">
            {c.declaration}
          </Text>
        </div>
      </div>
    </section>
  );
}
