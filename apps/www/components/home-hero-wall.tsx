"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Clock,
  Code2,
  Folder,
  MessageCircle,
  Pause,
  Play,
  Rocket,
  ShoppingBag,
  SkipBack,
  SkipForward,
  TrendingUp,
} from "lucide-react";
import {
  AnimatedList,
  Avatar,
  Badge,
  Button,
  Calendar,
  Card,
  CardBody,
  ColorSwatchPicker,
  Progress,
  Segmented,
  Slider,
  Sparkline,
  NumberTicker,
  Stat,
  StatusDot,
  Switch,
  Tag,
  Text,
} from "@hulianui/ui";
import { DOCS_LOCALE, withDocsBasePath } from "../lib/docs-locale";

// 首页 hero 右侧的组件墙：一面向右/向下出血被裁掉的真组件。
// 目的只有一个 —— 访客不读字也知道这个库长什么样、有多少东西。
// 墙里每一件都是 @hulianui/ui 的真组件、都能点，不是截图。
//
// 视觉口径（对照 MUI 首页那面墙定的）：
// - 卡片统一一种皮：大圆角 + 细描边 + 轻阴影，卡内不画分割线（分割线一多就像后台表单）；
// - 不写说明文字，控件自己说话；
// - 要有颜色和图片：分类色 Tag、实景照片、真人头像、主色渐变卡，全灰的墙看着像线框图。

const en = DOCS_LOCALE === "en";

const copy = en
  ? {
      region: "Live component examples",
      taskDate: "Nov 20",
      taskTitle: "The whole palette follows your theme",
      assigned: "Assigned to",
      msgName: "Lin Qing",
      msgTitle: "The new tokens look great",
      msgPreview: "Dark mode came out right on the first try…",
      sections: ["Components", "Blocks", "Pages"],
      range: "Price range",
      theme: "Theme",
      accents: ["Hulian blue", "Jade", "Violet", "Coral", "Amber"],
      trackTitle: "Into the woods",
      trackSub: "Ambient · 3:42",
      prev: "Previous",
      play: "Play",
      pause: "Pause",
      next: "Next",
      files: "Files",
      size: "Size",
      fileRows: [
        ["Illustrations", "21 MB"],
        ["Components", "11.0 kB"],
        ["Tokens", "4.2 kB"],
        ["Pictures", "134 MB"],
      ],
      notifyRows: ["Email digest", "Mentions", "Release notes"],
      feed: [
        { title: "New order", desc: "$128 · Silk pillowcase", time: "now" },
        { title: "New message", desc: "Lin Qing: dark mode looks great", time: "2m" },
        { title: "Deployed", desc: "hulian.dev · production", time: "5m" },
      ],
      statLabel: "Weekly active",
      statDelta: "vs last week",
      statusRows: [
        { status: "online", label: "API gateway", extra: "86ms" },
        { status: "degraded", label: "Search index", extra: "412ms" },
        { status: "maintenance", label: "Billing", extra: "02:00" },
      ],
    }
  : {
      region: "组件实例",
      taskDate: "11 月 20 日",
      taskTitle: "整站色系跟随主题变化",
      assigned: "负责人",
      msgName: "林青",
      msgTitle: "新的色板太好看了",
      msgPreview: "暗色模式一次就对了，没再返工…",
      sections: ["组件", "区块", "页面"],
      range: "价格区间",
      theme: "主题色",
      accents: ["瑚琏蓝", "青玉", "紫檀", "珊瑚", "琥珀"],
      trackTitle: "林间",
      trackSub: "环境音 · 3:42",
      prev: "上一首",
      play: "播放",
      pause: "暂停",
      next: "下一首",
      files: "文件",
      size: "大小",
      fileRows: [
        ["插画素材", "21 MB"],
        ["组件源码", "11.0 kB"],
        ["设计令牌", "4.2 kB"],
        ["图片视频", "134 MB"],
      ],
      notifyRows: ["邮件摘要", "被提及", "版本更新"],
      feed: [
        { title: "新订单", desc: "¥128 · 桑蚕丝枕套", time: "刚刚" },
        { title: "新消息", desc: "林青：暗色模式很好看", time: "2 分钟" },
        { title: "部署完成", desc: "hulian.dev · 生产环境", time: "5 分钟" },
      ],
      statLabel: "本周活跃",
      statDelta: "较上周",
      statusRows: [
        { status: "online", label: "API 网关", extra: "86ms" },
        { status: "degraded", label: "搜索索引", extra: "412ms" },
        { status: "maintenance", label: "计费", extra: "02:00" },
      ],
    };

// 主题色只换色相：明度/彩度由 globals.css 里 .hl-hero-wall 按明暗两态给定，这里只传 --hw-hue。
// 第一个是品牌原色（258 与 brand-700 同色相），覆盖常开，色相才能在各色之间连续过渡。
const ACCENT_HUES = [258, 165, 300, 25, 70] as const;
const SWATCHES = ACCENT_HUES.map((hue, i) => ({
  color: `oklch(0.58 0.16 ${hue})`,
  label: copy.accents[i],
}));

// 分类色 Tag：与状态无关的「属于哪一类」，走 Tag 的 color（三档 variant 都从这一个色派生）。
const STACK = [
  { label: "React", color: "#0ea5e9" },
  { label: "TypeScript", color: "#3178c6" },
  { label: "Tailwind", color: "#14b8a6" },
  { label: "OKLCH", color: "#d97706" },
  { label: "MCP", color: "#c026d3" },
] as const;

// 通知流图标底色：围绕当前主题色相取邻近三色（主色、±45°），换主题时跟着一起变
const FEED_STYLE = [
  { Icon: ShoppingBag, color: "oklch(0.62 0.17 var(--hw-hue))" },
  { Icon: MessageCircle, color: "oklch(0.62 0.17 calc(var(--hw-hue) + 45))" },
  { Icon: Rocket, color: "oklch(0.62 0.17 calc(var(--hw-hue) - 45))" },
] as const;

const SPARK = [32, 38, 35, 44, 41, 52, 49, 58, 55, 63, 61, 72];

// 墙里所有卡片共用的一层皮
const SKIN = "rounded-xl border border-border/80 bg-surface shadow-sm";

export function HomeHeroWall({ className, style }: { className?: string; style?: CSSProperties }) {
  const [index, setIndex] = useState(0);
  // 自动轮换：访客一点色块就永久停下，墙交还给手动选择
  const [auto, setAuto] = useState(true);
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const paused = useRef(false);
  const hue = ACCENT_HUES[index];

  // 色相写到首页最外层宿主（[data-hero-accent]）上而不是墙自己身上：顶栏、slogan、下面各段
  // 都读同一个 --hw-hue、同一段过渡，整页才同步变色。找不到宿主时退回写在墙上。
  useEffect(() => {
    const root = rootRef.current;
    const host = root?.closest<HTMLElement>("[data-hero-accent]") ?? root;
    host?.style.setProperty("--hw-hue", String(hue));
  }, [hue]);

  // 每隔一段时间换一个色相，整页跟着变；滚到哪儿都继续换。以下情况不换：系统要求减少动态效果；
  // 标签页在后台；指针悬停或焦点在墙内 —— 访客正在墙上操作时颜色在手底下变，是打扰不是展示。
  useEffect(() => {
    if (!auto) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden && !paused.current) {
        setIndex((i) => (i + 1) % ACCENT_HUES.length);
      }
    }, 2600);
    return () => window.clearInterval(timer);
  }, [auto]);

  return (
    <section
      ref={rootRef}
      aria-label={copy.region}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      className={`hl-hero-wall ${className ?? ""}`}
      style={style}
    >
      <div className="flex w-max items-start gap-5">
        {/* ── 第一列 ─────────────────────────────── */}
        <div className="flex w-[18rem] flex-col gap-5">
          {/* 主色渐变卡：墙里唯一一块大面积主色，换主题色时变化最明显。
              字与进度条都走 primary-foreground，明暗两态（白字 / 近黑字）自动跟随。 */}
          <Card
            variant="plain"
            className="bg-[linear-gradient(160deg,color-mix(in_oklch,var(--color-primary)_82%,white),var(--color-primary)_60%)] text-primary-foreground shadow-lg shadow-primary/20"
          >
            <CardBody className="space-y-5 py-5">
              <div className="flex items-center justify-between gap-2 text-xs font-medium">
                <span className="flex items-center gap-1.5 opacity-85">
                  <Clock className="size-3.5" aria-hidden />
                  {copy.taskDate}
                </span>
                {/* 当前主题名随轮换切换：key 换了就重挂载，重放一次 hl-rise 上浮淡入 */}
                <span
                  key={index}
                  className="hl-rise rounded-full bg-primary-foreground/15 px-2 py-0.5"
                  aria-live="off"
                >
                  {copy.accents[index]}
                </span>
              </div>
              <div className="space-y-2">
                <Code2 className="size-5 opacity-85" aria-hidden />
                <p className="text-lg font-semibold leading-snug tracking-tight">
                  {copy.taskTitle}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Avatar
                  size="md"
                  src={withDocsBasePath("/demo/avatar-12.jpg")}
                  fallback="A"
                  alt="Abel"
                  className="ring-2 ring-primary-foreground/60"
                />
                <div className="text-sm leading-tight">
                  <div className="text-xs opacity-75">{copy.assigned}</div>
                  <div className="font-semibold">Abel</div>
                </div>
              </div>
              <Progress
                value={68}
                showValue
                aria-label={copy.taskTitle}
                className="[&>div:first-child]:bg-primary-foreground/25 [&>div:first-child>div]:bg-primary-foreground [&>span]:font-semibold [&>span]:text-primary-foreground"
              />
            </CardBody>
          </Card>

          <div className="flex flex-wrap gap-1.5">
            {STACK.map((t) => (
              <Tag key={t.label} variant="outline" size="sm" color={t.color}>
                {t.label}
              </Tag>
            ))}
          </div>

          <div className={`${SKIN} p-2`}>
            <Calendar defaultValue="2026-11-20" defaultMonth="2026-11-01" showToday={false} />
          </div>

          <div className={`${SKIN} flex gap-3 p-4`}>
            <Avatar
              size="md"
              fallback={copy.msgName.slice(0, 1)}
              alt={copy.msgName}
              className="bg-primary-subtle font-semibold text-primary ring-2 ring-primary-border"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <Text as="span" size="sm" weight="medium" className="text-primary">
                  {copy.msgName}
                </Text>
                <Text as="span" size="xs" weight="semibold" className="tabular-nums">
                  09:41
                </Text>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <Text as="span" weight="semibold" truncate>
                  {copy.msgTitle}
                </Text>
                <Badge count={3} tone="success" />
              </div>
              <Text size="sm" tone="muted" truncate>
                {copy.msgPreview}
              </Text>
            </div>
          </div>
        </div>

        {/* ── 第二列 ─────────────────────────────── */}
        {/* 窄屏只露得出第一列：把能玩的这一列提到最前 */}
        <div className="order-first flex w-[22rem] flex-col gap-5 lg:order-none">
          <div className={`${SKIN} flex items-center justify-between gap-4 px-4 py-3.5`}>
            <Text as="span" size="sm" weight="semibold">
              {copy.theme}
            </Text>
            <ColorSwatchPicker
              colors={SWATCHES}
              value={SWATCHES[index].color}
              onValueChange={(color) => {
                setAuto(false);
                setIndex(
                  Math.max(
                    0,
                    SWATCHES.findIndex((sw) => sw.color === color),
                  ),
                );
              }}
              size="sm"
              aria-label={copy.theme}
              // 圆形色块、对勾改纯白（库内对勾是 mix-blend-difference，压在蓝上会反相成橙），
              // 选中态只靠外环；外环间隙按卡面色画，默认的页面底色在白卡上会露出一圈灰。
              className="gap-2.5 [&>*]:rounded-full [&>*]:border-0 [&>*]:shadow-[inset_0_0_0_1px_oklch(0_0_0/0.08)] [&_svg]:mix-blend-normal [&>[data-checked]]:ring-offset-surface"
            />
          </div>

          <Segmented
            items={copy.sections.map((s) => ({ value: s, label: s }))}
            defaultValue={copy.sections[0]}
            tone="brand"
            aria-label={copy.sections.join(" / ")}
            className="hl-seg-quiet w-full [&>*]:flex-1"
          />

          {/* 通知流：AnimatedList 进视口时逐条滑入；放在第二列：AnimatedList 要 40% 进视口才入场，
              第三列在 1440–1600 宽的屏上只露三分之一，放那里会一直是空白 */}
          <AnimatedList className="flex flex-col gap-2.5">
            {copy.feed.map((item, i) => {
              const { Icon, color } = FEED_STYLE[i];
              return (
                <div key={item.title} className={`${SKIN} flex items-center gap-3 p-3`}>
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-white"
                    style={{ background: color }}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <Text as="span" size="sm" weight="semibold" truncate>
                        {item.title}
                      </Text>
                      <Text as="span" size="xs" tone="muted" className="shrink-0">
                        {item.time}
                      </Text>
                    </div>
                    <Text size="xs" tone="muted" truncate>
                      {item.desc}
                    </Text>
                  </div>
                </div>
              );
            })}
          </AnimatedList>

          <div className={`${SKIN} flex items-center gap-4 p-3`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 静态导出，next/image 优化不可用 */}
            <img
              src={withDocsBasePath("/demo/photo-lens.jpg")}
              alt=""
              width={96}
              height={96}
              className="size-24 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1 text-center">
              <Text weight="semibold">{copy.trackTitle}</Text>
              <Text size="sm" tone="muted">
                {copy.trackSub}
              </Text>
              <div className="mt-2.5 flex items-center justify-center gap-1.5">
                <Button size="iconSm" variant="outline" aria-label={copy.prev}>
                  <SkipBack className="size-3.5" aria-hidden />
                </Button>
                <Button
                  size="icon"
                  variant="soft"
                  tone="brand"
                  aria-label={playing ? copy.pause : copy.play}
                  onClick={() => setPlaying((v) => !v)}
                >
                  {playing ? (
                    <Pause className="size-4" aria-hidden />
                  ) : (
                    <Play className="size-4" aria-hidden />
                  )}
                </Button>
                <Button size="iconSm" variant="outline" aria-label={copy.next}>
                  <SkipForward className="size-3.5" aria-hidden />
                </Button>
              </div>
            </div>
          </div>

          <div className={`${SKIN} px-5 pb-5 pt-4`}>
            <Slider defaultValue={[25, 60]} showValue aria-label={copy.range} />
            <div className="mt-2 flex justify-between text-xs font-medium text-muted-foreground tabular-nums">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* ── 第三列（宽屏才露出来）──────────────── */}
        <div className="flex w-[18rem] flex-col gap-5">
          <div className={`${SKIN} space-y-3 p-4`}>
            {copy.notifyRows.map((row, i) => (
              <div key={row} className="flex items-center justify-between gap-3">
                <Text as="span" size="sm">
                  {row}
                </Text>
                <Switch size="sm" defaultChecked={i !== 2} aria-label={row} />
              </div>
            ))}
          </div>

          <div className={`${SKIN} overflow-hidden`}>
            <div className="flex justify-between px-4 py-2.5 text-xs font-semibold">
              <span>{copy.files}</span>
              <span>{copy.size}</span>
            </div>
            {copy.fileRows.map(([name, size]) => (
              <div
                key={name}
                className="flex items-center gap-2.5 border-t border-border/70 px-4 py-2.5 text-sm"
              >
                <Folder className="size-4 fill-primary text-primary" aria-hidden />
                <span className="flex-1 truncate">{name}</span>
                <span className="font-semibold tabular-nums text-success">{size}</span>
              </div>
            ))}
          </div>

          {/* 涨跌幅紧贴它修饰的那个数（同一行右侧），图表独占卡底：读数 → 趋势 → 走势，
              视线一路向下不回头。Stat 自带的趋势行排在数值下方、图表之后，这里不用它的 delta。 */}
          <Stat
            label={copy.statLabel}
            value={
              <span className="flex items-center gap-2">
                <NumberTicker value={12480} />
                <span className="inline-flex items-center gap-0.5 rounded-full bg-success-subtle px-1.5 py-0.5 text-xs font-semibold text-success">
                  <TrendingUp className="size-3" aria-hidden />
                  +8.2%
                </span>
                <span className="text-xs font-normal text-muted-foreground">{copy.statDelta}</span>
              </span>
            }
            chart={<Sparkline data={SPARK} variant="area" width={246} height={48} highlightLast />}
          />

          <div className={`${SKIN} flex flex-col items-start gap-2.5 p-4`}>
            {copy.statusRows.map((row) => (
              <StatusDot
                key={row.label}
                status={row.status as "online" | "degraded" | "maintenance"}
                label={row.label}
                extra={row.extra}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
