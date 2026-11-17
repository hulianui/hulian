"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Blocks, Component, LayoutTemplate, PanelsTopLeft } from "lucide-react";
import { Alert, Avatar, Button, Input, Progress, Segmented, Switch, Tag, Text } from "@hulianui/ui";
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
      title: ["From one button", "to a whole back office"],
      titleSep: ", ",
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
      title: ["从一个按钮", "到一整个后台"],
      titleSep: "，",
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

// 预览区固定 30rem 高：各档内容高度不一，不定高的话切档时整段上下跳。
// 「组件」档的预览：一张用基础组件拼的小设置卡，不另起一个 1280 宽的缩略图
function Sampler() {
  const s = copy.sampler;
  return (
    <div className="grid h-full place-items-center p-4 sm:p-6">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-border/80 bg-surface p-5 shadow-sm">
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
        <label className="block space-y-1.5">
          <Text as="span" size="sm" weight="medium">
            {s.name}
          </Text>
          <Input defaultValue={s.placeholder} />
        </label>
        <Segmented
          tone="brand"
          items={["Light", "Dark", "Auto"].map((v) => ({ value: v, label: v }))}
          defaultValue="Light"
          className="w-full [&>*]:flex-1"
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
      </div>
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
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  // 自动轮播：访客一旦手动选档（点 / 键盘）就永久停下，把控制权交还给人
  const [auto, setAuto] = useState(true);
  // 悬停 / 焦点在本段、或本段不在视口时暂停。用 state 而不是 ref：进度条的动画要跟着停
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const running = auto && !hovered && visible && !reduced;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 计时交给进度条的 animationend：条走满即换下一档。暂停时 CSS 停住动画，计时自然一起停，
  // 不会出现「条停了、档照换」的两套时钟对不上。
  const advance = () => {
    // 不判 document.hidden：后台标签页里动画照样会结束，这里若不换档，条停在满格就再也不会重启
    if (running) setActive((i) => (i + 1) % 4);
  };

  const choose = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  // 竖排 tablist 的键盘：上下键换档、Home/End 跳首尾（WAI-ARIA Tabs 模式，自动激活）
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // 从「当前焦点」那一档算起，而不是从选中档：两者可能不同（例如点了别处再 Tab 回来）
    const focused = tabRefs.current.findIndex((el) => el === e.target);
    const from = focused === -1 ? active : focused;
    const keys: Record<string, number> = {
      ArrowDown: (from + 1) % 4,
      ArrowUp: (from + 3) % 4,
      Home: 0,
      End: 3,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = keys[e.key];
    choose(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      ref={sectionRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="mx-auto max-w-6xl px-6 py-24 sm:py-28"
    >
      <div className="max-w-2xl">
        <Text size="sm" weight="semibold" className="text-primary">
          {copy.eyebrow}
        </Text>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {copy.title[0]}
          <span className="text-primary">{copy.titleSep}</span>
          <br className="sm:hidden" />
          <span className="text-primary">{copy.title[1]}</span>
        </h2>
        <Text tone="muted" className="mt-4 leading-relaxed">
          {copy.lead}
        </Text>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-10">
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label={copy.eyebrow}
          onKeyDown={onKeyDown}
          className="flex flex-col gap-2"
        >
          {copy.tabs.map((tab, i) => {
            const Icon = ICONS[i];
            const selected = i === active;
            return (
              <button
                key={tab.title}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`hl-pl-tab-${i}`}
                aria-selected={selected}
                aria-controls="hl-pl-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(i)}
                className={`relative flex items-start gap-3.5 overflow-hidden rounded-xl border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                  selected
                    ? "border-primary-border bg-primary-subtle shadow-sm"
                    : "border-transparent hover:bg-surface-hover"
                }`}
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{tab.title}</span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {counts[i]}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{tab.desc}</span>
                </span>
                {/* 自动轮播的进度条：走满一次 = 换下一档。key 换档时重挂载，从 0 重新走 */}
                {selected && auto && !reduced && (
                  <span
                    key={active}
                    aria-hidden
                    onAnimationEnd={advance}
                    className="hl-pl-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
                    style={{ animationPlayState: running ? "running" : "paused" }}
                  />
                )}
              </button>
            );
          })}
          <Link
            href={HREFS[active]}
            className="group mt-2 inline-flex items-center gap-1.5 self-start px-4 text-sm font-medium text-primary hover:text-primary-hover"
          >
            {copy.open} · {copy.tabs[active].title}
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>

        <div
          id="hl-pl-panel"
          role="tabpanel"
          aria-labelledby={`hl-pl-tab-${active}`}
          className="min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-lg shadow-black/[0.04]"
        >
          {/* 窗口栏：三个圆点 + 当前档名，像一张产品截图 */}
          <div className="flex items-center gap-1.5 border-b border-border/70 bg-muted/40 px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 font-mono text-xs text-muted-foreground">
              {copy.tabs[active].title.toLowerCase()}
            </span>
          </div>
          <div key={active} className="hl-rise h-[30rem] overflow-hidden bg-bg">
            <Preview index={active} />
          </div>
        </div>
      </div>
    </section>
  );
}
