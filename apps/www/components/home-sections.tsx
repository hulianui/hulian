import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileText, Plug, ShieldCheck } from "lucide-react";
import {
  Avatar,
  Brand,
  Button,
  Card,
  CardBody,
  ChatMessage,
  IconTile,
  Image,
  Link as HLink,
  SectionHeader,
  Separator,
  Snippet,
  Spotlight,
  Statistic,
  Tag,
  Text,
  ToolCall,
  WindowFrame,
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
        titleBreak: "space",
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
        title: ["Start building software", "that looks as good as it works"],
        titleBreak: "space",
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
        titleBreak: "space",
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
        titleBreak: "none",
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

/** 深色 AI 带：data-theme="dark" 把这一段子树切到暗色 token，全站明暗都是一条深色断点。 */
export function HomeAiBand({ counts }: { counts: [number, number, number, number] }) {
  const c = copy.ai;
  return (
    <section data-theme="dark" className="bg-bg text-foreground">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-24 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
        <div>
          <SectionHeader
            eyebrow={c.eyebrow}
            title={c.title[0]}
            accent={c.title[1]}
            description={c.lead}
            className="max-w-2xl"
          />
          <ul className="mt-10 space-y-6">
            {c.points.map((p, i) => {
              const Icon = POINT_ICONS[i];
              return (
                <li key={p.title} className="flex gap-4">
                  <IconTile size="lg" variant="outline">
                    <Icon />
                  </IconTile>
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
          <Separator className="mt-12" />
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {counts.map((n, i) => (
              <Statistic key={c.stats[i]} value={n} suffix={c.stats[i]} animate groupSeparator={false} />
            ))}
          </div>
        </div>

        {/* 一段对话：提问 → 两次工具调用 → 带代码的回答。窗口外框与「产品线」那段的预览窗一致 */}
        <WindowFrame
          title={
            <Tag tone="brand" size="sm">
              MCP
            </Tag>
          }
        >
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
              input={
                <Text as="code" size="xs" family="mono">
                  {'{ "name": "ProTable" }'}
                </Text>
              }
              output="ProTable · 38 props · 4 pitfalls"
            />
            <ToolCall
              name="hulian.get_pitfalls"
              status="success"
              input={
                <Text as="code" size="xs" family="mono">
                  {'{ "name": "Tag" }'}
                </Text>
              }
              output="tone ≠ color · 2 pitfalls"
            />
            <ChatMessage
              role="assistant"
              avatar={
                // AI 头像：瑚琏 logo 按形状着主色（Brand maskSrc），跟着首页主题色走
                <Avatar
                  size="md"
                  tone="brand"
                  ring
                  fallback={
                    <Brand
                      variant="bare"
                      maskSrc={withDocsBasePath("/logo.svg")}
                      role="img"
                      aria-label="Hulian AI"
                    />
                  }
                />
              }
            >
              <p>{c.reply}</p>
            </ChatMessage>
          </div>
        </WindowFrame>
      </div>
    </section>
  );
}

/** 用瑚琏做出来的站：真站截图卡片，整卡可点、新窗口打开。 */
export function HomeBuiltWith() {
  const c = copy.built;
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
      <SectionHeader
        eyebrow={c.eyebrow}
        title={c.title[0]}
        accent={c.title[1]}
        accentBreak={c.titleBreak as "space" | "none"}
      />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {c.sites.map((site) => (
          <Card
            key={site.url}
            variant="elevated"
            interactive
            className="overflow-hidden"
            render={<a href={`https://${site.url}`} target="_blank" rel="noreferrer" />}
          >
            <CardBody className="p-3 pb-0">
              <Image
                src={withDocsBasePath(`/home/${site.img}.jpg`)}
                alt=""
                width="100%"
                radius="md"
                loading="lazy"
                className="aspect-[16/10]"
                imgClassName="object-cover object-top"
              />
            </CardBody>
            <CardBody className="p-5">
              <div className="flex items-center justify-between gap-2">
                <Text weight="semibold">{site.name}</Text>
                <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden />
              </div>
              <Text size="sm" tone="muted" className="mt-1">
                {site.blurb}
              </Text>
            </CardBody>
          </Card>
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
      <Spotlight blend="transparent" size="60% 70%" intensity={10} fade={70} className="-z-10" />
      <div className="mx-auto max-w-6xl px-6 py-24 text-center sm:py-28">
        <SectionHeader
          align="center"
          title={c.title[0]}
          accent={c.title[1]}
          accentBreak={c.titleBreak as "space" | "none"}
        />
        <div className="mx-auto mt-8 w-fit max-w-full">
          <Snippet copyLabel={copy.copy} copiedLabel={copy.copied}>
            pnpm add @hulianui/ui @hulianui/tokens
          </Snippet>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button render={<Link href="/start" />}>
            {c.start}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
          <Button variant="outline" render={<Link href="/components" />}>
            {c.browse}
          </Button>
        </div>

        <div className="mx-auto mt-20 max-w-3xl">
          <Separator className="mb-8" />
          <Text size="xs" weight="medium" tone="muted">
            {c.foundations}
          </Text>
          {/* 静态排开，不用 Marquee：跑马灯的复制份 aria-hidden 里的 <a> 仍可 Tab 到（axe 判错），
              八个短标签静态换行就排得下，全部可点、键盘可达、读屏只读一遍。 */}
          <Text as="div" size="sm" weight="medium" className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {STACK.map((tag) => (
              <HLink
                key={tag.href}
                href={tag.href}
                tone="muted"
                underline="none"
                target="_blank"
                rel="noreferrer"
              >
                {tag.label}
              </HLink>
            ))}
          </Text>
          <Text size="sm" tone="muted" className="mt-10">
            {c.declaration}
          </Text>
        </div>
      </div>
    </section>
  );
}
