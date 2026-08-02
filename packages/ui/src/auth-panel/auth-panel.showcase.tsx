"use client";
import { Brand } from "../brand/brand";
import { LoginForm } from "../login-form/login-form";
import type { ShowcaseSpec } from "../showcase/types";
import { AuthPanel } from "./auth-panel";

const HIGHLIGHTS = ["免费开始，闲时算力自动归零", "从 git push 到全球边缘上线", "端到端可观测，故障定位以秒计"];

// 画廊里没有整页高度，给一个固定高度让面板的上下分布看得出来。
const BOX = "h-80 overflow-hidden rounded-[var(--radius)] border border-border";

export const authPanelShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "分屏登录页",
      description:
        "左面板 + 右表单是登录/注册/找回密码的标准版式。右半边配 LoginForm surface={false} —— 视觉重量已由左侧面板承担，再套一张卡就是卡中卡。",
      code: `<div className="grid md:grid-cols-2">
  <AuthPanel
    brand={<Brand name="瀚云" description="全球边缘计算" />}
    title="把想法送上全球边缘"
    description="五分钟创建账号，开启第一个项目。无需信用卡。"
    highlights={["免费开始，闲时算力自动归零", "从 git push 到全球边缘上线"]}
  />
  <div className="grid place-items-center p-8">
    <LoginForm surface={false} />
  </div>
</div>`,
      render: () => (
        <div className={`grid md:grid-cols-2 ${BOX}`}>
          <AuthPanel
            brand={<Brand name="瀚云" description="全球边缘计算" />}
            title="把想法送上全球边缘"
            description="五分钟创建账号，开启第一个项目。"
            highlights={HIGHLIGHTS.slice(0, 2)}
          />
          <div className="hidden place-items-center overflow-auto p-6 md:grid">
            <LoginForm surface={false} showRemember={false} />
          </div>
        </div>
      ),
    },
    {
      title: "背景配方",
      description:
        "三档都由 token 混色写死在组件内（以 --color-bg 打底，暗色自动跟随）。Tailwind 工具类给不出带 color-mix 的 radial-gradient，而 guard 禁止消费方给库件传 style —— 这正是本组件存在的理由。",
      code: `<>
  <AuthPanel gradient="radial" title="radial" />
  <AuthPanel gradient="linear" title="linear" />
  <AuthPanel gradient="mesh"   title="mesh" />
  <AuthPanel gradient="none"   title="none" />
</>`,
      render: () => (
        <div className="grid gap-3 sm:grid-cols-2">
          {(["radial", "linear", "mesh", "none"] as const).map((g) => (
            <div key={g} className="h-40 overflow-hidden rounded-[var(--radius)] border border-border">
              <AuthPanel gradient={g} title={g} description="以 --color-bg 打底，暗色自动跟随" />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "品牌色",
      description:
        "color 走 resolveTone，与 Brand.color / Dot.color / ChartSeries.color 同一条路径：语义色名、任意 CSS 色或变量都接得住。渐变与勾选标记一起换色。",
      code: `<AuthPanel color="chart-2" title="换个品牌色" highlights={["渐变与勾选标记一起跟随"]} />`,
      render: () => (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={`h-52 overflow-hidden rounded-[var(--radius)] border border-border`}>
            <AuthPanel
              color="chart-2"
              gradient="mesh"
              title="chart-2"
              highlights={["渐变与勾选标记一起跟随"]}
            />
          </div>
          <div className={`h-52 overflow-hidden rounded-[var(--radius)] border border-border`}>
            <AuthPanel
              color="success"
              gradient="mesh"
              title="success"
              highlights={["语义色名照常解析"]}
            />
          </div>
        </div>
      ),
    },
    {
      title: "底部区",
      description: "footer 贴在面板底部（备案号 / 版权 / 次要链接），顶部内容与它两端对齐。",
      code: `<AuthPanel
  brand={<Brand name="瀚云" />}
  title="欢迎回来"
  footer="© 2026 瀚云 · 京ICP备 000000 号"
/>`,
      render: () => (
        <div className={BOX}>
          <AuthPanel
            brand={<Brand name="瀚云" />}
            title="欢迎回来"
            description="登录以继续"
            footer="© 2026 瀚云 · 京ICP备 000000 号"
          />
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "gradient",
      type: "select",
      options: ["radial", "linear", "mesh", "none"],
      defaultValue: "radial",
      label: "背景配方",
    },
    {
      prop: "color",
      type: "select",
      options: ["primary", "success", "warning", "danger", "chart-2", "chart-4"],
      defaultValue: "primary",
      label: "品牌色",
    },
    { prop: "title", type: "text", defaultValue: "把想法送上全球边缘" },
    { prop: "description", type: "text", defaultValue: "五分钟创建账号，开启第一个项目。" },
  ],
  states: [
    {
      name: "radial（默认）",
      render: () => (
        <div className="h-40 w-72 overflow-hidden rounded-[var(--radius)] border border-border">
          <AuthPanel title="欢迎回来" description="登录以继续" />
        </div>
      ),
    },
    {
      name: "mesh + 卖点",
      render: () => (
        <div className="h-40 w-72 overflow-hidden rounded-[var(--radius)] border border-border">
          <AuthPanel gradient="mesh" title="开始使用" highlights={["免费开始"]} />
        </div>
      ),
    },
    {
      name: "none（自叠图案用）",
      render: () => (
        <div className="h-40 w-72 overflow-hidden rounded-[var(--radius)] border border-border">
          <AuthPanel gradient="none" title="纯底" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="h-60 w-full overflow-hidden rounded-[var(--radius)] border border-border">
      <AuthPanel
        brand={<Brand name="瀚云" />}
        gradient={p.gradient as "radial" | "linear" | "mesh" | "none"}
        color={p.color as string}
        title={p.title as string}
        description={p.description as string}
        highlights={HIGHLIGHTS.slice(0, 2)}
      />
    </div>
  ),
  toCode: (p) =>
    `<AuthPanel\n  gradient="${p.gradient}"\n  color="${p.color}"\n  title="${p.title}"\n  description="${p.description}"\n/>`,
};
