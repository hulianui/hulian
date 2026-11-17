"use client";

import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import {
  AnimatedList,
  Avatar,
  Badge,
  Button,
  Calendar,
  Card,
  CardBody,
  Chip,
  ColorSwatchPicker,
  IconTile,
  Image,
  List,
  ListItem,
  Progress,
  Reveal,
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
import { ACCENT_HUES, useHomeAccent } from "./home-accent";

// 首页 hero 右侧的组件墙：一面向右/向下出血被裁掉的真组件。
// 目的只有一个 —— 访客不读字也知道这个库长什么样、有多少东西。
// 墙里每一件都是 @hulianui/ui 的真组件、都能点，不是截图。
//
// 视觉口径（对照 MUI 首页那面墙定的）：
// - 卡片统一一种皮：Card variant="elevated"（发丝边 + 轻阴影），卡内不画分割线（分割线一多就像后台表单）；
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

// 主题色只换色相：明度/彩度由 tokens 的 accent 作用域（AccentScope）按明暗两态给定。
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

// 通知流图标底色：围绕当前主题色相取邻近三色（主色、±45°），换主题时跟着一起变。
// --hl-accent-hue 由 AccentScope 写在首页宿主上。
const FEED_STYLE = [
  { Icon: ShoppingBag, color: "oklch(0.62 0.17 var(--hl-accent-hue))" },
  { Icon: MessageCircle, color: "oklch(0.62 0.17 calc(var(--hl-accent-hue) + 45))" },
  { Icon: Rocket, color: "oklch(0.62 0.17 calc(var(--hl-accent-hue) - 45))" },
] as const;

const SPARK = [32, 38, 35, 44, 41, 52, 49, 58, 55, 63, 61, 72];

export function HomeHeroWall() {
  const { index, setIndex } = useHomeAccent();
  // 自动轮换：访客一点色块就永久停下，墙交还给手动选择
  const [auto, setAuto] = useState(true);
  const [playing, setPlaying] = useState(false);
  const paused = useRef(false);

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
  }, [auto, setIndex]);

  return (
    <section
      aria-label={copy.region}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      className="relative"
    >
      <div className="flex w-max items-start gap-5">
        {/* ── 第一列 ─────────────────────────────── */}
        <div className="flex w-[18rem] flex-col gap-5">
          {/* 主色卡：墙里唯一一块大面积主色，换主题色时变化最明显。
              反色表面：卡里的文字、Chip、头像外圈自动反色；进度条用 tone="inverse"。 */}
          <Card variant="primary">
            <CardBody className="space-y-5 py-5">
              <div className="flex items-center justify-between gap-2">
                <Text
                  as="span"
                  size="xs"
                  weight="medium"
                  tone="muted"
                  className="flex items-center gap-1.5"
                >
                  <Clock className="size-3.5" aria-hidden />
                  {copy.taskDate}
                </Text>
                {/* 当前主题名随轮换切换：key 换了就重挂载，重放一次上浮淡入 */}
                <Reveal key={index} trigger="mount" y={6} blur={0} aria-live="off">
                  <Chip size="sm" tone="neutral">
                    {copy.accents[index]}
                  </Chip>
                </Reveal>
              </div>
              <div className="space-y-2">
                <Code2 className="size-5" aria-hidden />
                <Text size="lg" weight="semibold">
                  {copy.taskTitle}
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <Avatar
                  size="md"
                  ring
                  src={withDocsBasePath("/demo/avatar-12.jpg")}
                  fallback="A"
                  alt="Abel"
                />
                <div>
                  <Text size="xs" tone="muted">
                    {copy.assigned}
                  </Text>
                  <Text size="sm" weight="semibold">
                    Abel
                  </Text>
                </div>
              </div>
              <Progress value={68} showValue tone="inverse" aria-label={copy.taskTitle} />
            </CardBody>
          </Card>

          <div className="flex flex-wrap gap-1.5">
            {STACK.map((t) => (
              <Tag key={t.label} variant="outline" size="sm" color={t.color}>
                {t.label}
              </Tag>
            ))}
          </div>

          <Card variant="elevated">
            <CardBody className="p-2">
              <Calendar defaultValue="2026-11-20" defaultMonth="2026-11-01" showToday={false} />
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardBody className="flex gap-3 p-4">
              <Avatar
                size="md"
                tone="brand"
                ring
                fallback={copy.msgName.slice(0, 1)}
                alt={copy.msgName}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <Text as="span" size="sm" weight="medium" tone="primary">
                    {copy.msgName}
                  </Text>
                  <Text as="span" size="xs" weight="semibold" numeric>
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
            </CardBody>
          </Card>
        </div>

        {/* ── 第二列 ─────────────────────────────── */}
        {/* 窄屏只露得出第一列：把能玩的这一列提到最前 */}
        <div className="order-first flex w-[22rem] flex-col gap-5 lg:order-none">
          <Card variant="elevated">
            <CardBody className="flex items-center justify-between gap-4 px-4 py-3.5">
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
                shape="circle"
                aria-label={copy.theme}
                className="gap-2.5"
              />
            </CardBody>
          </Card>

          <Segmented
            items={copy.sections.map((s) => ({ value: s, label: s }))}
            defaultValue={copy.sections[0]}
            tone="brand"
            aria-label={copy.sections.join(" / ")}
            className="w-full"
          />

          {/* 通知流：AnimatedList 进视口时逐条滑入；放在第二列：AnimatedList 要 40% 进视口才入场，
              第三列在 1440–1600 宽的屏上只露三分之一，放那里会一直是空白 */}
          <AnimatedList className="flex flex-col gap-2.5">
            {copy.feed.map((item, i) => {
              const { Icon, color } = FEED_STYLE[i];
              return (
                <Card key={item.title} variant="elevated">
                  <CardBody className="flex items-center gap-3 p-3">
                    <IconTile variant="solid" color={color}>
                      <Icon />
                    </IconTile>
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
                  </CardBody>
                </Card>
              );
            })}
          </AnimatedList>

          <Card variant="elevated">
            <CardBody className="flex items-center gap-4 p-3">
              <Image
                src={withDocsBasePath("/demo/photo-lens.jpg")}
                alt=""
                width={96}
                height={96}
                radius="lg"
                className="shrink-0"
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
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardBody className="px-5 pb-5 pt-4">
              <Slider defaultValue={[25, 60]} showValue aria-label={copy.range} />
              <Text
                size="xs"
                weight="medium"
                tone="muted"
                numeric
                className="mt-2 flex justify-between"
                aria-hidden
              >
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </Text>
            </CardBody>
          </Card>
        </div>

        {/* ── 第三列（宽屏才露出来）──────────────── */}
        <div className="flex w-[18rem] flex-col gap-5">
          <Card variant="elevated">
            <CardBody className="space-y-3 p-4">
              {copy.notifyRows.map((row, i) => (
                <div key={row} className="flex items-center justify-between gap-3">
                  <Text as="span" size="sm">
                    {row}
                  </Text>
                  <Switch size="sm" defaultChecked={i !== 2} aria-label={row} />
                </div>
              ))}
            </CardBody>
          </Card>

          <List
            size="sm"
            bordered
            aria-label={copy.files}
            header={
              <Text as="div" size="xs" weight="semibold" className="flex justify-between">
                <span>{copy.files}</span>
                <span>{copy.size}</span>
              </Text>
            }
            items={copy.fileRows}
            renderItem={([name, size]) => (
              <ListItem
                actions={[
                  <Text key="size" as="span" size="sm" weight="semibold" tone="success" numeric>
                    {size}
                  </Text>,
                ]}
              >
                <ListItem.Meta
                  avatar={
                    <IconTile size="sm" tone="brand">
                      <Folder />
                    </IconTile>
                  }
                  title={name}
                />
              </ListItem>
            )}
          />
          {/* 带图表的 KPI 卡：趋势排在数值右侧（deltaPlacement="inline"），图表独占卡底 */}
          <Stat
            label={copy.statLabel}
            value={<NumberTicker value={12480} />}
            delta={8.2}
            deltaLabel={copy.statDelta}
            deltaPlacement="inline"
            chart={<Sparkline data={SPARK} variant="area" width={246} height={48} highlightLast />}
          />

          <Card variant="elevated">
            <CardBody className="flex flex-col items-start gap-2.5 p-4">
              {copy.statusRows.map((row) => (
                <StatusDot
                  key={row.label}
                  status={row.status as "online" | "degraded" | "maintenance"}
                  label={row.label}
                  extra={row.extra}
                />
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}
