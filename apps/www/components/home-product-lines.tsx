"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Blocks, Component, LayoutTemplate, PanelsTopLeft } from "lucide-react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardBody,
  Field,
  IconTile,
  Input,
  Link as HLink,
  Progress,
  Reveal,
  SectionHeader,
  Segmented,
  Switch,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Tag,
  Text,
  WindowFrame,
} from "@hulianui/ui";
import { PreviewThumbnail } from "./preview-thumbnail";
import { DOCS_LOCALE, withDocsBasePath } from "../lib/docs-locale";

// 首页「四条产品线」：左边四档（组件 / 区块 / 页面 / 模版），右边是该档的真实预览。
// 预览全部是站里真在跑的东西：区块、页面直接渲染 _blocks / _pages 里的源件，模版用 iframe
// 嵌真实 demo 路由。按需 dynamic 加载，首页首屏不背这几块的包体。

const en = DOCS_LOCALE === "en";

const ChartGrid = dynamic(
  () =>
    (en
      ? import("../app/blocks/_blocks/chart-grid.en")
      : import("../app/blocks/_blocks/chart-grid")
    ).then((m) => m.ChartGridBlock),
  { ssr: false },
);
const DashboardPage = dynamic(
  () =>
    (en
      ? import("../app/pages/_pages/dashboard.en")
      : import("../app/pages/_pages/dashboard")
    ).then((m) => m.DashboardPage),
  { ssr: false },
);

const copy = en
  ? {
      eyebrow: "Products",
      title: ["From one button, ", "to a whole back office"],
      lead: "Four layers, one design language. Copy what you need.",
      tabs: [
        { title: "Components", desc: "Accessible building blocks with OKLCH tokens" },
        { title: "Blocks", desc: "Sections you drop into a page: charts, tables, heroes" },
        { title: "Pages", desc: "Complete pages: dashboards, settings, sign-in" },
        { title: "Templates", desc: "Whole products you can run and take apart" },
      ],
      open: "Browse all",
      demoLabel: "Template demo",
      sampler: {
        name: "Name",
        placeholder: "Hulian",
        notify: "Email me updates",
        alert: "Saved. Your theme is live.",
        save: "Save",
        cancel: "Cancel",
      },
    }
  : {
      eyebrow: "产品",
      title: ["从一个按钮，", "到一整个后台"],
      lead: "四层粒度、一套设计语言，按需复制。",
      tabs: [
        { title: "组件", desc: "可访问、可换肤的基础组件，OKLCH 色彩令牌" },
        { title: "区块", desc: "拿来就能拼页面的段落：图表、表格、首屏" },
        { title: "页面", desc: "成型的整页：仪表盘、设置、登录" },
        { title: "模版", desc: "能跑、能拆的完整产品" },
      ],
      open: "查看全部",
      demoLabel: "模版演示",
      sampler: {
        name: "名称",
        placeholder: "瑚琏",
        notify: "有更新时发邮件给我",
        alert: "已保存，新主题已生效。",
        save: "保存",
        cancel: "取消",
      },
    };

const ICONS = [Component, Blocks, PanelsTopLeft, LayoutTemplate];
const HREFS = ["/components", "/blocks", "/pages", "/demos"];
const VALUES = ["components", "blocks", "pages", "demos"] as const;

// 预览区固定 30rem 高：各档内容高度不一，不定高的话切档时整段上下跳。
// 「组件」档的预览：一张用基础组件拼的小设置卡，不另起一个 1280 宽的缩略图
function Sampler() {
  const s = copy.sampler;
  return (
    <div className="grid h-full place-items-center p-4 sm:p-6">
      <Card variant="elevated" className="w-full max-w-sm">
        <CardBody className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <Avatar size="md" src={withDocsBasePath("/demo/avatar-12.jpg")} fallback="A" alt="Abel" />
          <div className="min-w-0">
            <Text weight="semibold">Abel</Text>
            <Text size="sm" tone="muted">
              abel@hulian.dev
            </Text>
          </div>
          <Tag tone="success" size="sm" dot className="ml-auto">
            Pro
          </Tag>
        </div>
        <Field label={s.name}>
          <Input defaultValue={s.placeholder} />
        </Field>
        <Segmented
          tone="brand"
          items={["Light", "Dark", "Auto"].map((v) => ({ value: v, label: v }))}
          defaultValue="Light"
          className="w-full"
          aria-label="Theme"
        />
        <Switch label={s.notify} defaultChecked />
        <Progress value={72} showValue aria-label={s.name} />
        <Alert tone="success" title={s.alert} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">
            {s.cancel}
          </Button>
          <Button size="sm">{s.save}</Button>
        </div>
        </CardBody>
      </Card>
    </div>
  );
}

function Preview({ index }: { index: number }): ReactNode {
  if (index === 0) return <Sampler />;
  if (index === 1)
    return (
      <div className="p-4">
        <PreviewThumbnail maxHeight={448} lazy={false}>
          <ChartGrid />
        </PreviewThumbnail>
      </div>
    );
  if (index === 2)
    return (
      <div className="p-4">
        <PreviewThumbnail maxHeight={448} lazy={false}>
          <DashboardPage />
        </PreviewThumbnail>
      </div>
    );
  // 模版是完整应用、有自己的路由与布局，用 iframe 嵌真页面再等比缩小；不接管指针，
  // 整块是个预览图，点「查看全部」才进去。
  return (
    <div className="relative h-full overflow-hidden">
      <iframe
        src={withDocsBasePath("/demos/dashboard")}
        title={copy.demoLabel}
        loading="lazy"
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[900px] w-[1600px] origin-top-left scale-[0.42] border-0 sm:scale-[0.45]"
      />
    </div>
  );
}

export function HomeProductLines({ counts }: { counts: [number, number, number, number] }) {
  const [active, setActive] = useState<string>(VALUES[0]);
  const activeIndex = Math.max(0, VALUES.indexOf(active as (typeof VALUES)[number]));

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
      <SectionHeader
        eyebrow={copy.eyebrow}
        title={copy.title[0]}
        accent={copy.title[1]}
        accentBreak="mobile"
        description={copy.lead}
        className="max-w-2xl"
      />

      {/* 自动轮播（Tabs autoPlay）：5 秒一档，悬停 / 焦点在本段、不在视口时暂停，访客选过一次就停。 */}
      <Tabs
        value={active}
        onValueChange={(v) => setActive(v as string)}
        orientation="vertical"
        autoPlay={5000}
        className="mt-12 grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-10"
      >
        {/* tablist 里只许放 tab：「打开」链接放在 tablist 外面做兄弟，不能塞进去（axe aria-required-children） */}
        <div className="flex flex-col gap-2">
          <TabsList variant="card" aria-label={copy.eyebrow}>
            {copy.tabs.map((tab, i) => {
              const Icon = ICONS[i];
              const selected = i === activeIndex;
              return (
                <TabsTab key={VALUES[i]} value={VALUES[i]}>
                  <IconTile tone={selected ? "brand" : "neutral"} variant={selected ? "solid" : "soft"}>
                    <Icon />
                  </IconTile>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <Text as="span" weight="semibold">
                        {tab.title}
                      </Text>
                      <Text as="span" size="xs" family="mono" tone="muted" numeric>
                        {counts[i]}
                      </Text>
                    </span>
                    <Text size="sm" tone="muted" className="mt-0.5">
                      {tab.desc}
                    </Text>
                  </span>
                </TabsTab>
              );
            })}
          </TabsList>
          <Text as="div" size="sm" weight="medium" className="mt-2 px-4">
            <HLink arrow render={<Link href={HREFS[activeIndex]} />}>
              {copy.open} · {copy.tabs[activeIndex].title}
            </HLink>
          </Text>
        </div>

        {VALUES.map((value, i) => (
          <TabsPanel key={value} value={value} className="mt-0 min-w-0">
            {/* 窗口栏：三个圆点 + 当前档名，像一张产品截图 */}
            <WindowFrame title={copy.tabs[i].title.toLowerCase()}>
              {/* 切档时整块上浮淡入：面板随档重挂载，Reveal 挂载即播 */}
              <Reveal trigger="mount" y={10} blur={0} className="h-[30rem] overflow-hidden bg-bg">
                <Preview index={i} />
              </Reveal>
            </WindowFrame>
          </TabsPanel>
        ))}
      </Tabs>
    </section>
  );
}
