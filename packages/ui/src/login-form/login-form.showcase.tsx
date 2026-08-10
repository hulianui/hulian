"use client";
import { useState } from "react";
import { AuthPanel } from "../auth-panel/auth-panel";
import { Link } from "../link";
import type { ShowcaseSpec } from "../showcase/types";
import { LoginForm } from "./login-form";

// 前缀图标：_icons 里没有 user/key（那是业务图标，库只收组件自用的那批），
// 示例里内联两枚，消费方通常直接用 lucide-react。
const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "size-4",
};
const UserIcon = () => (
  <svg {...iconProps}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const KeyIcon = () => (
  <svg {...iconProps}>
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
    <path d="m21 2-9.6 9.6" />
    <circle cx="7.5" cy="15.5" r="5.5" />
  </svg>
);

function Demo() {
  const [user, setUser] = useState<string | null>(null);
  return (
    <div
      className="flex min-h-[560px] w-full items-center justify-center rounded-[var(--radius)] border border-border p-6"
      // 有意图的登录页背景：primary 微染径向辉光自顶部渐隐到 bg（token 驱动·自动适配明暗）
      style={{
        background:
          "radial-gradient(125% 125% at 50% 0%, color-mix(in oklab, var(--color-primary) 8%, var(--color-bg)) 0%, var(--color-bg) 60%)",
      }}
    >
      <div className="flex w-full max-w-md flex-col items-stretch gap-3">
        <LoginForm
          logo={
            <span className="inline-flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">瑚</span>
              <span className="text-base font-semibold tracking-tight">瑚琏 Admin</span>
            </span>
          }
          subtitle="欢迎回来，请登录你的管理后台"
          onFinish={async (v) => {
            await new Promise((r) => setTimeout(r, 700));
            setUser(`${v.username}${v.remember ? "（已记住）" : ""}`);
          }}
          footer={
            <div className="flex justify-between text-sm">
              <Link href="#">忘记密码</Link>
              <Link href="#">注册账号</Link>
            </div>
          }
        />
        {user && (
          <p className="text-center text-sm text-muted-foreground" role="status">
            登录中：{user}
          </p>
        )}
      </div>
    </div>
  );
}

// 三个逃生口合演：rules 追加格式校验 + 受控值外显 + beforeSubmit 拦一道「模拟验证码」
function EscapeHatchDemo() {
  const [values, setValues] = useState({ username: "", password: "", remember: false });
  const [passed, setPassed] = useState(false);
  const [log, setLog] = useState<string | null>(null);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <LoginForm
        rules={{
          username: [{ pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, message: "账号需字母开头，3~16 位字母/数字/下划线" }],
          password: [{ min: 6, max: 32, message: "密码 6~32 位" }],
        }}
        values={values}
        onValuesChange={(_changed, all) => setValues(all)}
        extra={
          <label className="flex items-center gap-2 rounded-[var(--radius)] border border-dashed border-border p-3 text-sm text-muted-foreground">
            <input type="checkbox" checked={passed} onChange={(e) => setPassed(e.target.checked)} />
            模拟人机验证（真实场景放 ClickCaptcha）
          </label>
        }
        beforeSubmit={async () => {
          if (!passed) {
            setLog("beforeSubmit 返回 false → 提交已中止");
            return false;
          }
          await new Promise((r) => setTimeout(r, 500));
        }}
        onFinish={({ username }) => setLog(`onFinish：${username} 登录中`)}
      />
      <p className="text-xs text-muted-foreground">
        外部实时值：{values.username || "—"} / {values.password ? "•".repeat(values.password.length) : "—"}
      </p>
      {log && (
        <p className="text-xs text-muted-foreground" role="status">
          {log}
        </p>
      )}
    </div>
  );
}

export const loginFormShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "自管 useForm：账号/密码必填 + 记住我 + 异步提交 loading。",
      code: `<LoginForm
  onFinish={async ({ username, password, remember }) => {
    await api.login(username, password, remember);
  }}
/>`,
      render: () => (
        <div className="w-full max-w-md">
          <LoginForm
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 700));
            }}
          />
        </div>
      ),
    },
    {
      title: "品牌 logo + 副标题",
      description: "logo 落头部左上作品牌标，subtitle 作引导文案。",
      code: `<LoginForm
  logo={<Logo />}
  subtitle="欢迎回来，请登录你的管理后台"
  onFinish={({ username }) => console.log(username)}
/>`,
      render: () => (
        <div className="w-full max-w-md">
          <LoginForm
            logo={
              <span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                  瑚
                </span>
                <span className="text-base font-semibold tracking-tight">瑚琏 Admin</span>
              </span>
            }
            subtitle="欢迎回来，请登录你的管理后台"
            onFinish={() => {}}
          />
        </div>
      ),
    },
    {
      title: "底部链接区",
      description: "footer 放忘记密码 / 注册等附加操作，带顶部分隔线。",
      code: `<LoginForm
  footer={
    <div className="flex justify-between text-sm">
      <Link href="/forgot">忘记密码</Link>
      <Link href="/register">注册账号</Link>
    </div>
  }
  onFinish={() => {}}
/>`,
      render: () => (
        <div className="w-full max-w-md">
          <LoginForm
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">忘记密码</Link>
                <Link href="#">注册账号</Link>
              </div>
            }
            onFinish={() => {}}
          />
        </div>
      ),
    },
    {
      title: "自定义校验 + 受控值 + 提交前拦截",
      description:
        "rules 追加格式约束（内置必填仍先跑）；values/onValuesChange 让外部拿到实时值；beforeSubmit 在 onFinish 之前插一步（验证码等），返回 false 即中止。",
      code: `<LoginForm
  rules={{
    username: [{ pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, message: "账号格式不正确" }],
    password: [{ min: 6, message: "密码至少 6 位" }],
  }}
  values={values}
  onValuesChange={(_changed, all) => setValues(all)}
  extra={<ClickCaptcha backgroundSrc={captcha.background} onComplete={setPoints} />}
  beforeSubmit={async () => {
    if (points.length < 3) return false;   // 未过验证码 → 中止提交
    await verifyCaptcha(points);
  }}
  onFinish={({ username }) => api.login(username)}
/>`,
      render: () => <EscapeHatchDemo />,
    },
    {
      title: "字段外观槽（label / placeholder / prefix）",
      description:
        "fields 只覆盖外观——取值、校验、autoComplete 默认值仍由模板托管，所以换个 label 不会把浏览器的账号/密码自动填充弄丢。业务里字段叫「管理员账号」「工号」「手机号」，或要在框里放人形/钥匙图标时用它，不必为此拆掉整个模板。",
      code: `<LoginForm
  fields={{
    username: { label: "管理员账号", placeholder: "请输入账号", prefix: <UserRound /> },
    password: { placeholder: "请输入密码", prefix: <KeyRound /> },
  }}
/>`,
      render: () => (
        <div className="w-full max-w-md">
          <LoginForm
            fields={{
              username: { label: "管理员账号", placeholder: "请输入账号", prefix: <UserIcon /> },
              password: { placeholder: "请输入密码", prefix: <KeyIcon /> },
            }}
            onFinish={() => {}}
          />
        </div>
      ),
    },
    {
      title: "分屏登录页（surface={false}）",
      description:
        "左品牌面板 + 右表单时，视觉重量已由 AuthPanel 承担，右半边再套一张卡就是卡中卡。surface={false} 把边框/底色/阴影/内距一起关掉，表面交给外层——不必再用 className 一条条抵消库件自己的表面。",
      code: `<div className="grid xl:grid-cols-2">
  <AuthPanel title="欢迎回来" description="统一身份认证平台" />
  <div className="grid place-items-center p-8">
    <LoginForm surface={false} />
  </div>
</div>`,
      render: () => (
        <div className="grid overflow-hidden rounded-[var(--radius)] border border-border sm:grid-cols-2">
          <AuthPanel title="欢迎回来" description="统一身份认证平台" className="hidden sm:flex" />
          <div className="grid place-items-center p-6">
            <LoginForm surface={false} showRemember={false} onFinish={() => {}} />
          </div>
        </div>
      ),
    },
    {
      title: "隐藏记住我",
      description: "showRemember={false} 去掉「记住我」勾选（如不支持持久会话的场景）。",
      code: `<LoginForm showRemember={false} onFinish={() => {}} />`,
      render: () => (
        <div className="w-full max-w-md">
          <LoginForm showRemember={false} onFinish={() => {}} />
        </div>
      ),
    },
  ],
  controls: [],
  states: [{ name: "登录模板 · 校验 + 记住我 + 异步提交", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<LoginForm
  logo={<Logo />}
  onFinish={async ({ username, password, remember }) => {
    await api.login(username, password, remember);
  }}
  footer={<Link href="/forgot">忘记密码</Link>}
/>`,
};
