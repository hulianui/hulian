// 瀚云 HanCloud 官网内容 SSoT。纯数据 + lucide 图标引用，被各 section 与子页消费。
import {
  Rocket,
  Cpu,
  Globe,
  Activity,
  ShieldCheck,
  Users,
  GitBranch,
  Container,
  Boxes,
  MessageSquare,
  Database,
  Gauge,
  type LucideIcon,
} from "lucide-react";

export const brand = {
  name: "瀚云",
  nameEn: "HanCloud",
  tagline: "一体化云原生应用平台",
  description: "从 git push 到全球上线，瀚云把部署、弹性算力与端到端可观测收进同一个平台。",
} as const;

export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: "能力", href: "/demos/website#features" },
  { label: "客户", href: "/demos/website#testimonials" },
  { label: "定价", href: "/demos/website/pricing" },
  { label: "联系", href: "/demos/website/contact" },
];

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}

export const stats: Stat[] = [
  { label: "累计部署次数", value: 2.4, suffix: "M+", decimals: 1 },
  { label: "企业客户", value: 18000, suffix: "+" },
  { label: "服务可用性", value: 99.99, suffix: "%", decimals: 2 },
  { label: "全球边缘节点", value: 320, suffix: "" },
];

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  /** BentoCard 跨列/跨行的 className。 */
  span?: string;
}

export const features: Feature[] = [
  {
    icon: Rocket,
    title: "一键部署",
    description: "git push 即上线，构建缓存命中秒级完成，异常一键回滚到任意历史版本。",
    span: "sm:col-span-2",
  },
  {
    icon: Cpu,
    title: "弹性算力",
    description: "按请求自动伸缩，闲时归零不计费。",
  },
  {
    icon: Globe,
    title: "全球边缘网络",
    description: "320 个边缘节点就近响应，静态资源与函数同图下发。",
  },
  {
    icon: Activity,
    title: "端到端可观测",
    description: "指标、日志、链路追踪开箱即用，无需自建采集栈。",
    span: "sm:col-span-2",
  },
  {
    icon: ShieldCheck,
    title: "企业级安全",
    description: "SOC 2 Type II 与等保三级合规，密钥托管与审计全覆盖。",
  },
  {
    icon: Users,
    title: "团队协作",
    description: "细粒度角色权限、环境隔离与变更审计，多团队安全共用一套平台。",
    span: "sm:col-span-2",
  },
];

export interface Integration {
  name: string;
  icon: LucideIcon;
}

export const integrations: Integration[] = [
  { name: "GitHub", icon: GitBranch },
  { name: "Docker", icon: Container },
  { name: "Kubernetes", icon: Boxes },
  { name: "Slack", icon: MessageSquare },
  { name: "Postgres", icon: Database },
  { name: "Datadog", icon: Gauge },
];

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  initial: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: "迁移到瀚云后，我们的发布频率从每周一次提升到每天十几次，回滚再也不用值班同学手抖。",
    name: "陈航",
    title: "极光科技 · 工程 VP",
    initial: "陈",
  },
  {
    quote: "弹性算力闲时归零这一条，直接把我们的预发环境账单砍掉了七成。",
    name: "林悦",
    title: "云图数据 · 基础架构负责人",
    initial: "林",
  },
  {
    quote: "可观测开箱即用，新同事第一天就能顺着链路追踪定位线上问题，省掉了搭一整套采集栈的活。",
    name: "Marco Reyes",
    title: "Northwind · Platform Lead",
    initial: "M",
  },
  {
    quote: "全球边缘节点让海外用户的首屏时间从 1.8s 降到 0.4s，转化率肉眼可见地涨了。",
    name: "苏晴",
    title: "远帆出海 · CTO",
    initial: "苏",
  },
  {
    quote: "合规这块原本要专人盯一个季度，瀚云的审计与密钥托管让我们一次过了等保。",
    name: "赵明远",
    title: "稳信金融 · 安全总监",
    initial: "赵",
  },
  {
    quote: "从 Demo 到生产，团队只学了一套心智模型。瀚云是我们用过最不打扰开发的平台。",
    name: "Aisha Khan",
    title: "Lumen AI · Head of Eng",
    initial: "A",
  },
];

export interface Plan {
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  /** 价格无意义时（如企业版）展示的自定义文案。 */
  customPrice?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

export const plans: Plan[] = [
  {
    name: "入门",
    tagline: "个人项目与原型验证",
    monthly: 0,
    yearly: 0,
    features: ["1 个生产项目", "每月 100 GB 流量", "社区支持", "自动 HTTPS 与全球 CDN", "单人协作"],
    cta: "免费开始",
  },
  {
    name: "专业",
    tagline: "成长中的团队与生产业务",
    monthly: 199,
    yearly: 1990,
    features: [
      "无限项目",
      "每月 1 TB 流量",
      "弹性算力自动伸缩",
      "指标 / 日志 / 链路追踪",
      "最多 10 名成员",
      "工单 4 小时响应",
    ],
    cta: "开始 14 天试用",
    highlight: true,
  },
  {
    name: "企业",
    tagline: "合规、私有化与专属支持",
    monthly: 0,
    yearly: 0,
    customPrice: "定制",
    features: [
      "专属边缘节点与算力池",
      "SOC 2 / 等保三级合规",
      "SSO 与细粒度审计",
      "专属客户成功经理",
      "99.99% SLA 保障",
      "私有化部署可选",
    ],
    cta: "预约演示",
  },
];

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "从其他平台迁移瀚云复杂吗？",
    answer:
      "大多数项目无需改代码。瀚云自动识别框架并生成构建配置，你只需连接代码仓库；我们也提供一对一迁移协助。",
  },
  {
    question: "免费版会不会有隐藏限制？",
    answer:
      "免费版包含 1 个生产项目、每月 100 GB 流量与全球 CDN，足以承载真实的个人项目，且不会因到期强制升级。",
  },
  {
    question: "弹性算力是如何计费的？",
    answer:
      "按实际请求时长计费，闲时自动归零不产生费用。你可以为每个环境设置预算上限，超出前会提前告警。",
  },
  {
    question: "支持哪些合规认证？",
    answer:
      "专业版与企业版均运行在通过 SOC 2 Type II 审计的基础设施上，企业版额外提供等保三级、SSO 与私有化部署。",
  },
  {
    question: "出现故障时如何获得支持？",
    answer:
      "免费版享社区支持，专业版工单 4 小时内响应，企业版配备专属客户成功经理与 99.99% SLA。",
  },
];

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: "产品",
    links: [
      { label: "一键部署", href: "/demos/website#features" },
      { label: "弹性算力", href: "/demos/website#features" },
      { label: "边缘网络", href: "/demos/website#features" },
      { label: "可观测", href: "/demos/website#features" },
    ],
  },
  {
    title: "解决方案",
    links: [
      { label: "初创团队", href: "/demos/website#testimonials" },
      { label: "电商出海", href: "/demos/website#testimonials" },
      { label: "AI 应用", href: "/demos/website#testimonials" },
    ],
  },
  {
    title: "资源",
    links: [
      { label: "文档", href: "/demos/website" },
      { label: "博客", href: "/demos/website" },
      { label: "服务状态", href: "/demos/website" },
      { label: "更新日志", href: "/demos/website" },
    ],
  },
  {
    title: "公司",
    links: [
      { label: "关于我们", href: "/demos/website" },
      { label: "加入我们", href: "/demos/website" },
      { label: "联系销售", href: "/demos/website/contact" },
      { label: "隐私政策", href: "/demos/website" },
    ],
  },
];
