// 6 个虚构独立产品（SSoT）。每个作品的 device/bg 决定详情页用哪种设备外壳 + 哪种炫背景。
// 前 5 个 device/bg 刻意各不相同 → 5 件设备外壳 + 设计感背景全部真实出场；
// 第 6 个（留白·浏览器扩展）复用 chrome 外壳 + iridescence 背景，作为作品集自然生长的一笔。

export type DeviceKind = "chrome" | "iphone" | "tablet" | "terminal" | "watch";
/** 详情页 hero 背景：对应 @hulianui/ui 的设计感背景组件 */
export type BgKind = "silk" | "iridescence" | "wavy" | "threads" | "liquid-chrome";

export interface WorkShot {
  caption: string;
  /** 程序化 SVG 截图的布局变体（art.ts 用） */
  variant: "dashboard" | "editor" | "list" | "detail" | "chart";
}

export interface CodeSample {
  title: string;
  lang: string;
  code: string;
}

export interface Work {
  slug: string;
  name: string;
  nameEn: string;
  /** 一句话定位 */
  tagline: string;
  year: string;
  /** 品类：SaaS / 桌面 / APP / 开源库 / CLI / 微件 */
  category: string;
  status: "在线" | "开源" | "已下架" | "Beta";
  device: DeviceKind;
  bg: BgKind;
  /** 主色相 0–360，喂程序化截图 + Orb/Chip 点缀 */
  hue: number;
  stack: string[];
  links: { label: string; href: string }[];
  /** 详情页概述（2–3 段） */
  summary: string[];
  /** 亮点功能 bullet */
  highlights: { title: string; desc: string }[];
  /** 多图轮播的截图（程序化生成） */
  shots: WorkShot[];
  /** 关键代码片段（Code/Snippet 展示） */
  codeSample?: CodeSample;
  /** 安装/使用命令（Snippet 一键复制） */
  install?: string;
  /** 关键指标（NumberTicker / 文本） */
  metrics: { label: string; value: string }[];
}

export const works: Work[] = [
  {
    slug: "codemarker",
    name: "码尺",
    nameEn: "Codemarker",
    tagline: "把代码截图，变成能发推的艺术品。",
    year: "2024",
    category: "Web SaaS",
    status: "在线",
    device: "chrome",
    bg: "silk",
    hue: 222,
    stack: ["React", "TypeScript", "Vite", "Tailwind", "Satori", "Cloudflare"],
    links: [
      { label: "在线使用", href: "#" },
      { label: "源码", href: "#" },
    ],
    summary: [
      "码尺是一个浏览器里的代码美化工具：粘贴代码，选主题，导出一张带窗口外壳、语法高亮、柔光阴影的高清图。",
      "它最初是我自己发技术推时的痛点——系统截图太丑、Carbon 太慢。码尺做到了「粘贴即所得」，导出走 Satori 在边缘函数渲染，3 秒出 2x 高清图。",
    ],
    highlights: [
      { title: "30+ 配色主题", desc: "全部可改，支持自定义品牌色与窗口样式" },
      { title: "边缘渲染导出", desc: "Cloudflare Workers + Satori，2x/4x 高清 PNG/SVG" },
      { title: "快捷键优先", desc: "⌘V 粘贴 → ⌘E 导出，全程不用鼠标" },
    ],
    shots: [
      { caption: "编辑器主界面", variant: "editor" },
      { caption: "主题选择面板", variant: "list" },
      { caption: "导出预览", variant: "detail" },
    ],
    codeSample: {
      title: "边缘函数渲染导出",
      lang: "ts",
      code: `// 在 Cloudflare Workers 用 Satori 把代码渲染成图
import satori from "satori";

export async function renderCode(code: string, theme: Theme) {
  const svg = await satori(
    <CodeCard code={code} theme={theme} />,
    { width: 1200, fonts: await loadFonts() },
  );
  return new Response(svg, {
    headers: { "content-type": "image/svg+xml" },
  });
}`,
    },
    install: "npx codemarker ./app.tsx --theme tide --scale 2",
    metrics: [
      { label: "月活", value: "42k" },
      { label: "导出图片", value: "190 万+" },
      { label: "主题", value: "32" },
    ],
  },
  {
    slug: "tide",
    name: "潮汐",
    nameEn: "Tide",
    tagline: "像潮水一样，专注自然涨落。",
    year: "2023",
    category: "iOS APP",
    status: "在线",
    device: "iphone",
    bg: "iridescence",
    hue: 188,
    stack: ["Swift", "SwiftUI", "CloudKit", "WidgetKit", "StoreKit 2"],
    links: [
      { label: "App Store", href: "#" },
      { label: "产品页", href: "#" },
    ],
    summary: [
      "潮汐是一个反「番茄钟」的专注 APP：它不强迫你切成 25 分钟一段，而是顺着你的状态，用一段会呼吸的潮汐动效陪你进入心流。",
      "它是我第一个上架 App Store 的独立作品，三个月自然增长到 5 万下载。锁屏微件和实时活动让「正在专注」成为一种仪式感。",
    ],
    highlights: [
      { title: "自适应专注", desc: "不切碎时间，按你的节奏建议休息点" },
      { title: "实时活动 + 微件", desc: "灵动岛与锁屏实时显示当前潮汐" },
      { title: "全端同步", desc: "CloudKit 同步专注记录，零账号" },
    ],
    shots: [
      { caption: "专注主界面", variant: "detail" },
      { caption: "数据统计", variant: "chart" },
      { caption: "锁屏微件", variant: "dashboard" },
    ],
    codeSample: {
      title: "SwiftUI 呼吸动效",
      lang: "swift",
      code: `// 一段随专注时长缓慢呼吸的潮汐圆环
struct TideRing: View {
  @State private var phase = 0.0
  var body: some View {
    Circle()
      .scaleEffect(1 + 0.06 * sin(phase))
      .animation(.easeInOut(duration: 4).repeatForever(), value: phase)
      .onAppear { phase = .pi }
  }
}`,
    },
    metrics: [
      { label: "下载", value: "21 万+" },
      { label: "App Store", value: "4.9 分" },
      { label: "付费转化", value: "8.3%" },
    ],
  },
  {
    slug: "inkpad",
    name: "墨册",
    nameEn: "Inkpad",
    tagline: "本地优先的 Markdown 笔记，数据永远是你的。",
    year: "2024",
    category: "桌面应用",
    status: "在线",
    device: "tablet",
    bg: "wavy",
    hue: 268,
    stack: ["Tauri", "Rust", "React", "CodeMirror", "SQLite", "Automerge"],
    links: [
      { label: "下载", href: "#" },
      { label: "文档", href: "#" },
    ],
    summary: [
      "墨册是一个本地优先的 Markdown 笔记应用：所有数据存在你自己的设备上，加密后才同步，断网也能用，云端只是备份而非主人。",
      "用 Tauri + Rust 打底，包体只有 8MB，冷启动 0.3 秒。Automerge 的 CRDT 让多设备无冲突合并，不需要任何账号。",
    ],
    highlights: [
      { title: "本地优先", desc: "数据存本地 SQLite，端到端加密后才上云" },
      { title: "无冲突同步", desc: "Automerge CRDT，多端编辑自动合并" },
      { title: "极致轻量", desc: "Tauri 打包 8MB，冷启动 300ms" },
    ],
    shots: [
      { caption: "双栏编辑", variant: "editor" },
      { caption: "笔记库", variant: "list" },
      { caption: "同步设置", variant: "detail" },
    ],
    codeSample: {
      title: "Rust 侧本地加密写入",
      lang: "rust",
      code: `// 笔记落盘前用设备密钥加密，云端只见密文
pub fn save_note(note: &Note, key: &Key) -> Result<()> {
    let plain = serde_json::to_vec(note)?;
    let cipher = encrypt_xchacha20(&plain, key)?;
    db::upsert(note.id, &cipher)?;
    sync::enqueue(note.id);
    Ok(())
}`,
    },
    install: "brew install --cask inkpad",
    metrics: [
      { label: "包体", value: "8 MB" },
      { label: "冷启动", value: "0.3s" },
      { label: "付费用户", value: "6.1k" },
    ],
  },
  {
    slug: "flowctl",
    name: "flowctl",
    nameEn: "flowctl",
    tagline: "用一个 YAML 编排你的本地工作流。",
    year: "2022",
    category: "开源 CLI",
    status: "开源",
    device: "terminal",
    bg: "threads",
    hue: 150,
    stack: ["Rust", "Tokio", "clap", "WASM"],
    links: [
      { label: "GitHub", href: "#" },
      { label: "文档", href: "#" },
    ],
    summary: [
      "flowctl 是一个本地工作流编排器：把重复的开发任务写成声明式 YAML，一条命令并发跑完，带依赖图、缓存和漂亮的终端进度。",
      "它是我最受欢迎的开源项目，GitHub 破万 star。核心是一个用 Rust + Tokio 写的 DAG 调度器，插件用 WASM 沙箱跑，安全又跨平台。",
    ],
    highlights: [
      { title: "声明式 DAG", desc: "YAML 描述任务依赖，自动并发与缓存" },
      { title: "WASM 插件", desc: "插件在沙箱里跑，跨平台零依赖" },
      { title: "漂亮的 TTY", desc: "实时进度树、耗时火焰、失败重放" },
    ],
    shots: [
      { caption: "运行进度", variant: "dashboard" },
      { caption: "依赖图", variant: "chart" },
      { caption: "配置示例", variant: "editor" },
    ],
    codeSample: {
      title: "flow.yaml 工作流定义",
      lang: "yaml",
      code: `# 声明任务与依赖，flowctl 自动并发调度
tasks:
  build:
    run: cargo build --release
  test:
    needs: [build]
    run: cargo test
  lint:
    run: cargo clippy -- -D warnings
  ship:
    needs: [test, lint]
    run: ./scripts/release.sh`,
    },
    install: "cargo install flowctl",
    metrics: [
      { label: "GitHub Star", value: "11.2k" },
      { label: "周下载", value: "38k" },
      { label: "贡献者", value: "84" },
    ],
  },
  {
    slug: "pulse",
    name: "脉搏",
    nameEn: "Pulse",
    tagline: "手腕上的一眼健康。",
    year: "2025",
    category: "watchOS 微件",
    status: "Beta",
    device: "watch",
    bg: "liquid-chrome",
    hue: 344,
    stack: ["Swift", "WidgetKit", "HealthKit", "Swift Charts"],
    links: [
      { label: "TestFlight", href: "#" },
      { label: "产品页", href: "#" },
    ],
    summary: [
      "脉搏是一个 Apple Watch 健康微件：把心率、HRV、活动环、睡眠压缩进一个表盘复杂功能，抬腕一眼就知道身体状态。",
      "目前在 Beta，这是我第一次做 watchOS。最难的是在表盘那一点点空间里，把四个维度的数据排得既好看又一眼可读。",
    ],
    highlights: [
      { title: "表盘复杂功能", desc: "心率 / HRV / 活动 / 睡眠四合一" },
      { title: "趋势着色", desc: "数据偏离基线时自动变色提醒" },
      { title: "极省电", desc: "增量刷新，全天不掉一格电" },
    ],
    shots: [
      { caption: "表盘复杂功能", variant: "detail" },
      { caption: "趋势图", variant: "chart" },
      { caption: "设置", variant: "list" },
    ],
    codeSample: {
      title: "WidgetKit 时间线刷新",
      lang: "swift",
      code: `// 增量刷新表盘复杂功能，省电优先
struct PulseProvider: TimelineProvider {
  func timeline(in ctx: Context) async -> Timeline<Entry> {
    let hr = await HealthStore.latestHeartRate()
    let entry = Entry(date: .now, bpm: hr)
    return Timeline(entries: [entry], policy: .after(.now + 600))
  }
}`,
    },
    metrics: [
      { label: "Beta 用户", value: "1.4k" },
      { label: "刷新间隔", value: "10 min" },
      { label: "耗电", value: "< 2%/天" },
    ],
  },
  {
    slug: "marginalia",
    name: "留白",
    nameEn: "Marginalia",
    tagline: "把任何网页，还原成干净的阅读。",
    year: "2025",
    category: "浏览器扩展",
    status: "在线",
    device: "chrome",
    bg: "iridescence",
    hue: 32,
    stack: ["TypeScript", "WXT", "React", "Readability", "IndexedDB"],
    links: [
      { label: "Chrome 商店", href: "#" },
      { label: "源码", href: "#" },
    ],
    summary: [
      "留白是一个浏览器扩展：一键把塞满弹窗、广告和侧栏的网页，还原成只剩正文的安静阅读页，可调字号、字体与栏宽，像在读一本排好版的书。",
      "它来自我自己的洁癖——好文章常被糟糕的版式毁掉。留白用 Readability 提取正文，本地存一份「稍后读」，断网也能翻，全程不碰你的任何数据。",
    ],
    highlights: [
      { title: "一键阅读模式", desc: "提取正文，去广告与干扰，自定义字体与栏宽" },
      { title: "本地稍后读", desc: "正文存进 IndexedDB，离线可读，零账号" },
      { title: "全键盘操作", desc: "⌥R 进入阅读，j / k 翻段，全程不用鼠标" },
    ],
    shots: [
      { caption: "阅读模式", variant: "detail" },
      { caption: "稍后读列表", variant: "list" },
      { caption: "外观设置", variant: "editor" },
    ],
    codeSample: {
      title: "用 Readability 提取正文",
      lang: "ts",
      code: `// content script：把当前页正文抽成干净 HTML 存本地
import { Readability } from "@mozilla/readability";

export function extractArticle() {
  const doc = document.cloneNode(true) as Document;
  const article = new Readability(doc).parse();
  if (article) saveForLater(article); // 落 IndexedDB，离线可读
  return article;
}`,
    },
    metrics: [
      { label: "安装量", value: "5.8 万+" },
      { label: "商店评分", value: "4.8 分" },
      { label: "已净化文章", value: "320 万+" },
    ],
  },
];

export function workBySlug(slug: string): Work | undefined {
  return works.find((w) => w.slug === slug);
}

/** 上一/下一篇导航（环形） */
export function workNav(slug: string): { prev: Work; next: Work } | null {
  const i = works.findIndex((w) => w.slug === slug);
  if (i < 0) return null;
  return {
    prev: works[(i - 1 + works.length) % works.length],
    next: works[(i + 1) % works.length],
  };
}
