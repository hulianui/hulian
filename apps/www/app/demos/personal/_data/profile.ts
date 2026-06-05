// 个人站人设数据（SSoT）—— 虚构独立开发者「林屿」。全中文、零外链。
// 下游：site-shell（品牌/导航）、hero/about/stack/journey/contact sections、work/guestbook 复用社交。

export type SocialKind = "github" | "twitter" | "mail" | "rss" | "dribbble";

export interface Social {
  kind: SocialKind;
  label: string;
  handle: string;
  href: string;
}

export interface Stat {
  /** NumberTicker 目标值 */
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

export interface Skill {
  name: string;
  /** 熟练度 0–100，喂 Meter */
  level: number;
  /** 一句话注脚 */
  note: string;
}

export interface StackGroup {
  group: string;
  items: string[];
}

export interface JourneyItem {
  year: string;
  title: string;
  desc: string;
  tone: "primary" | "success" | "default";
}

export const profile = {
  name: "林屿",
  nameEn: "Lin Yu",
  handle: "@linyu",
  /** 角色轮换，喂 WordRotate */
  roles: ["全栈工程师", "独立开发者", "产品设计师", "开源作者"],
  tagline: "我做能自己用的东西。",
  /** Hero 副标语，喂 AnimatedGradientText */
  kicker: "Indie maker · 杭州",
  location: "中国 · 杭州",
  email: "hi@linyu.dev",
  /** 关于页长文（Prose 渲染，段落数组） */
  bio: [
    "我是林屿，一个独立全栈开发者，也是独立产品作者。过去六年里我没有进过大厂——更准确地说，我把每一个「想自己用」的念头，都做成了能跑起来的产品。",
    "做东西的顺序总是相反的：先有一个我自己每天都被它折磨的问题，然后才有产品。专注总被打断，于是有了「潮汐」；截图代码丑得没法发推，于是有了「码尺」；笔记散落在五个云端，于是有了本地优先的「墨册」。",
    "我相信小而美的软件：一个人能维护、能盈利、能用十年。技术只是手段，我更在意的是一个产品用起来「顺不顺手」——那 5% 的体验差距，往往是我花 50% 时间打磨的地方。",
    "这个站点本身也是一次 dogfood：从极光背景到留言板，每一个像素都由我自己的组件库搭成，没有引用任何外部 UI 库。",
  ],
  stats: [
    { value: 12400, label: "GitHub Star", suffix: "+" },
    { value: 386000, label: "累计下载", suffix: "+" },
    { value: 5, label: "上线产品" },
    { value: 2470, label: "写代码的咖啡", suffix: " 杯" },
  ] as Stat[],
  socials: [
    { kind: "github", label: "GitHub", handle: "linyu", href: "https://github.com/" },
    { kind: "twitter", label: "X / Twitter", handle: "@linyu", href: "https://x.com/" },
    { kind: "dribbble", label: "Dribbble", handle: "linyu", href: "https://dribbble.com/" },
    { kind: "mail", label: "邮箱", handle: "hi@linyu.dev", href: "mailto:hi@linyu.dev" },
    { kind: "rss", label: "RSS", handle: "/feed", href: "#" },
  ] as Social[],
};

export const skills: Skill[] = [
  { name: "前端 · React / TypeScript", level: 95, note: "组件库 / 设计系统 / 动效" },
  { name: "全栈 · Node / Rust / Go", level: 82, note: "本地优先 · 边缘函数 · CLI" },
  { name: "移动端 · Swift / SwiftUI", level: 78, note: "iOS / watchOS 原生" },
  { name: "产品设计 · Figma", level: 88, note: "从 0 到 1 的视觉与交互" },
  { name: "增长 · 内容 / SEO", level: 70, note: "独立产品的冷启动" },
];

export const stacks: StackGroup[] = [
  { group: "语言", items: ["TypeScript", "Rust", "Swift", "Go", "Python"] },
  { group: "前端", items: ["React", "Next.js", "Vite", "Tailwind", "Motion", "WebGL"] },
  { group: "后端 / 基建", items: ["Node", "Tauri", "Cloudflare", "SQLite", "Postgres"] },
  { group: "设计 / 工具", items: ["Figma", "Linear", "Raycast", "Vercel"] },
];

export const journey: JourneyItem[] = [
  { year: "2024", title: "全职独立开发", desc: "辞职 all in 独立产品，靠「码尺」「潮汐」养活自己。", tone: "primary" },
  { year: "2023", title: "「潮汐 Tide」上架 App Store", desc: "首个独立 APP，三个月内自然增长到 5 万下载。", tone: "success" },
  { year: "2022", title: "开源「flowctl」", desc: "一个本地工作流 CLI，GitHub 破万 star。", tone: "default" },
  { year: "2021", title: "离开第二份工作", desc: "从全栈工程师转向「能自己做完一个产品」的 generalist。", tone: "default" },
  { year: "2019", title: "写下第一行 Rust", desc: "被本地优先（local-first）软件理念击中。", tone: "default" },
];
