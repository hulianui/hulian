import { Heading } from "../heading/heading";
import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import type { AuthPanelGradient, AuthPanelProps } from "./auth-panel.types";

// AuthPanel = 分屏认证页左侧那块宣传面板（渐变底 + 品牌 + 标语 + 卖点）。
// 登录 / 注册 / 找回密码三个页面共用一个版式，右半边配 <LoginForm surface={false} />。
//
// 它存在的理由是**渐变没有正经的表达方式**（hulianui/hulian#71）：
// Tailwind 工具类给不出 `radial-gradient(125% 125% at 0% 0%, color-mix(in oklab, …), …)`
// 这种带 token 混色的写法，而 guard 的 no-style-override 又是 error 级——两条一撞，消费方
// 只剩「裸 <div> + inline style」一条路（官方 signup block 自己就是这么写的，不是消费方偷懒）。
// 于是把配方收进组件：换品牌色只动 color prop，不必满仓库找那几段 inline 渐变。
//
// 纯展示零 hook（可 RSC）。

/** 三档配方都以 `--color-bg` 打底做 color-mix，因此暗色主题自动跟随，无需另写一套。 */
function backgroundFor(gradient: AuthPanelGradient, accent: string): string | undefined {
  switch (gradient) {
    case "none":
      return undefined;
    case "linear":
      return [
        `linear-gradient(135deg,`,
        `color-mix(in oklab, ${accent} 16%, var(--color-bg)) 0%,`,
        `var(--color-bg) 55%,`,
        `color-mix(in oklab, ${accent} 8%, var(--color-bg)) 100%)`,
      ].join(" ");
    case "mesh":
      // 三处光斑叠加。每层都得有自己的兜底色停靠点（transparent 收尾），否则后面的层会被压住。
      return [
        `radial-gradient(60% 60% at 12% 8%, color-mix(in oklab, ${accent} 20%, transparent) 0%, transparent 60%),`,
        `radial-gradient(50% 50% at 88% 22%, color-mix(in oklab, ${accent} 12%, transparent) 0%, transparent 55%),`,
        `radial-gradient(70% 70% at 50% 100%, color-mix(in oklab, ${accent} 14%, transparent) 0%, transparent 65%),`,
        `var(--color-bg)`,
      ].join(" ");
    default:
      return [
        `radial-gradient(125% 125% at 0% 0%,`,
        `color-mix(in oklab, ${accent} 12%, var(--color-bg)) 0%,`,
        `var(--color-bg) 60%)`,
      ].join(" ");
  }
}

/** 卖点前的勾选标记（纯装饰，不进无障碍树——列表语义由 ul/li 自己承担）。 */
function CheckMark({ accent }: { accent: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 size-4 shrink-0"
      style={{ color: accent }}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function AuthPanel({
  brand,
  title,
  titleLevel = 2,
  description,
  highlights,
  children,
  footer,
  color = "primary",
  gradient = "radial",
  className,
  style,
  ...rest
}: AuthPanelProps) {
  const accent = resolveTone(color) ?? "var(--color-primary)";
  const background = backgroundFor(gradient, accent);
  return (
    <div
      className={cn(
        // h-full：面板由外层栅格定高（分屏页通常是 h-dvh 的一列），自己不定高度。
        "flex h-full flex-col justify-between gap-10 p-10 text-foreground",
        gradient === "none" && "bg-surface",
        className,
      )}
      // 自家背景在前、消费方 style 在后：想整块换底图时仍能覆盖（逃生口）。
      style={background ? { background, ...style } : style}
      {...rest}
    >
      <div className="flex flex-col gap-8">
        {brand}
        {(title != null || description != null) && (
          <div className="flex flex-col gap-3">
            {title != null && (
              <Heading level={titleLevel} size="3xl" weight="bold" balance className="leading-tight">
                {title}
              </Heading>
            )}
            {description != null && (
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>

      {(highlights?.length || footer != null) && (
        <div className="flex flex-col gap-6">
          {highlights?.length ? (
            <ul className="flex flex-col gap-3">
              {highlights.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckMark accent={accent} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {footer != null && <div className="text-xs text-muted-foreground">{footer}</div>}
        </div>
      )}
    </div>
  );
}
