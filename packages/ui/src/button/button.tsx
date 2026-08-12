"use client";
import { cloneElement, forwardRef, memo, type ReactNode } from "react";
import { type HTMLMotionProps } from "motion/react";
import { cva } from "class-variance-authority";
import { Loader2 } from "../_icons";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { pressable, LazyMotionProvider, m } from "../motion";
import { BUTTON_BASE_CLASS, BUTTON_SIZE_CLASS } from "./button-base";
import type { ButtonProps } from "./button.types";

// soft 的默认（brand）配色。两处共用：tone="brand" 那格，以及 tone="current" 落在 soft 上时
// 补回同一份外观（见下方注释）——写两遍字面量迟早会漂开。
const SOFT_BRAND = "bg-primary/12 text-primary hover:bg-primary/20";

const buttonVariantsCva = cva(BUTTON_BASE_CLASS, {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow",
        outline: "border border-hairline bg-surface text-foreground shadow-sm hover:bg-surface-hover",
        ghost: "text-foreground hover:bg-surface-hover",
        // 浅语义底 + 语义文字，视觉权重介于 outline 与 solid 之间。次级工具栏上「这个筛选开着」
        // 这类状态化触发器要的就是这一档：outline+brand 与未激活态渲染结果一样（分辨不出），
        // solid 又重到盖过页面主操作（#197）。色由 compoundVariants 按 tone 给，同 Tag / Chip。
        soft: "",
        // 文字链接按钮：零横向内边距，文字直接贴单元格/容器左缘，用于表格行内操作（查看/编辑）等。
        link: "text-primary underline-offset-4 hover:underline",
      },
      // 语义档。前五档取值集是 conventions 里「语义 tone SSOT」的全集，其余组件按各自能表达的范围裁剪子集。
      // brand 是 primary 的对外名字（历史遗留的两种叫法，Button 以 brand 为准）。
      //
      // current 不是第六个语义色，是「**别设色**、跟随容器继承」（#215）。彩色卡片 / 彩色行里的
      // 图标按钮要跟着容器变色，而五个语义档给的都是**绝对值**，接不住继承；`muted` 同样是绝对值，
      // 方向还相反（钉到次要灰）。词沿用 `Spinner` 已有的 `tone="current"`，不另造概念。
      tone: { brand: "", success: "", warning: "", danger: "", neutral: "", current: "" },
      size: BUTTON_SIZE_CLASS,
      // 块级铺满：移动端主操作、表单底部提交几乎必用，此前只能写 className="w-full"。
      block: { true: "w-full" },
      // 层级档（#211）：静息色降一档到次要灰，hover 回到该 tone 的本色。
      // **刻意不做成 tone 的第六档**：tone 是语义色 SSOT、横跨 29 个组件，而 muted 是层级不是色相，
      // 塞进去会逼 solid / soft 回答「muted 实心是什么」——而 bg-muted 实心看起来就是 disabled。
      // 类由 compoundVariants 按 variant × tone 给：只有无底色的 ghost / link 有意义。
      muted: { true: "" },
    },
    compoundVariants: [
      // solid：语义底 + 对应前景 + 独立的 hover 档。0.27.0 前 danger 的 hover 写回自身
      // （hover:bg-danger），等于危险按钮没有悬停反馈——tokens 补齐 *-hover 后一并修掉。
      {
        variant: "solid",
        tone: "danger",
        class: "bg-danger text-danger-foreground hover:bg-danger-hover",
      },
      {
        variant: "solid",
        tone: "success",
        class: "bg-success text-success-foreground hover:bg-success-hover",
      },
      {
        variant: "solid",
        tone: "warning",
        class: "bg-warning text-warning-foreground hover:bg-warning-hover",
      },
      // neutral solid 走「反色」而不是灰底：灰底实心与 outline 几乎不可分辨，而反色是
      // 明确的「次主操作」。hover 落到 muted，两个主题都朝对比更弱的方向走一步。
      { variant: "solid", tone: "neutral", class: "bg-foreground text-bg hover:bg-muted-foreground" },
      // soft：静息 12% 语义底（与 Tag / Chip 的 soft 同一口径），hover 加深到 20% 给交互反馈。
      // neutral 不用不透明的 surface-hover 顶，而是同构地用 foreground 低透明度——五档结构一致，
      // 且亮暗两态自适应（亮色是半透明黑，暗色是半透明白），不必为它新造一个中性底 token。
      { variant: "soft", tone: "brand", class: SOFT_BRAND },
      // current 落在 soft 上按**无效**处理（同 muted，另有 warnOnce）。必须显式补回默认档的外观：
      // soft 的颜色全在 compoundVariants 里、base 是空串，不补这条它就不是「无效」而是
      // 「丢掉底色」——渲染出一个透明底的 soft 按钮，比静默无效更糟。
      // solid / link 不需要这条：它们的颜色写在 variant base 上，不命中 compound 时原样保留。
      { variant: "soft", tone: "current", class: SOFT_BRAND },
      { variant: "soft", tone: "success", class: "bg-success/12 text-success hover:bg-success/20" },
      { variant: "soft", tone: "warning", class: "bg-warning/12 text-warning hover:bg-warning/20" },
      { variant: "soft", tone: "danger", class: "bg-danger/12 text-danger hover:bg-danger/20" },
      { variant: "soft", tone: "neutral", class: "bg-foreground/8 text-foreground hover:bg-foreground/14" },
      { variant: "outline", tone: "danger", class: "border-danger text-danger" },
      { variant: "outline", tone: "success", class: "border-success text-success" },
      { variant: "outline", tone: "warning", class: "border-warning text-warning" },
      // outline / ghost 的 neutral 就是各自的中性形态本身，无需追加类。
      { variant: "ghost", tone: "danger", class: "text-danger" },
      { variant: "ghost", tone: "success", class: "text-success" },
      { variant: "ghost", tone: "warning", class: "text-warning" },
      // current：唯一作用是把 base / variant 写死的静息色**撤掉**，交还给继承（#215）。
      // 只有无底色的两档说得通——solid / soft 自带背景，前景必须与背景成对，跟随容器
      // 会直接做出对比度不合规的组合，故落在那几档上按无效处理 + 开发期点名（同 muted）。
      // 生效依赖出口那层 tailwind-merge：`text-current` 与 base 的 `text-foreground` 是同一属性，
      // 不收敛就由样式表顺序裁决（#217 修的正是这个）。
      { variant: "ghost", tone: "current", class: "text-current" },
      { variant: "outline", tone: "current", class: "text-current" },
      // link：去掉 size 档的固定高度与横向内边距，回归纯文字链接（不影响行高，文字左缘对齐表头）。
      { variant: "link", class: "h-auto px-0" },
      { variant: "link", tone: "danger", class: "text-danger" },
      { variant: "link", tone: "success", class: "text-success" },
      { variant: "link", tone: "warning", class: "text-warning" },
      { variant: "link", tone: "neutral", class: "text-foreground" },
      // ── muted 层级档（#211）────────────────────────────────────────────────
      // 顺序要紧：这几条排在上面的 tone 档之后，靠 tailwind-merge「后来者胜」把静息色顶掉，
      // 再由更具体的那条把 hover 目标改回本 tone 的颜色。
      // 消费方手写的那批（18 处）正是这个形状：静息 muted → hover 回正文黑 + ghost 的浅底。
      { variant: "ghost", muted: true, class: "text-muted-foreground hover:text-foreground" },
      // link 的默认 tone 是 brand，所以 hover 回主色；neutral 那条在下面改回正文黑。
      { variant: "link", muted: true, class: "text-muted-foreground hover:text-primary" },
      { variant: "link", tone: "neutral", muted: true, class: "hover:text-foreground" },
      // 非中性 tone：静息一律降成次要灰，hover 才亮出语义色。
      // 「静息灰、悬停变红」的删除链接是中后台密集行里的常见形态，不是把语义色丢了。
      //
      // **刻意没有 { variant:"ghost", tone:"brand" } 这一格**（#218）。cva 在这里分不出
      // 「显式写了 tone="brand"」和「没写 tone」——`tone` 的默认值就是 brand，compoundVariants
      // 拿到的是应用默认值之后的值。所以给这一格补 `hover:text-primary`，改的是**所有**
      // 不写 tone 的 `ghost muted`，把 #211 刚立的「静息灰 → hover 正文黑」换掉——而那正是
      // 消费方 18 处手写、#211 收编进来的形状（有测试钉着）。同理静息态补 `text-primary`
      // 会把本仓 207 处默认 ghost 一起刷成主色。
      // 区分只能在组件层做（props 里没传就是 undefined），故改为开发期告警，见下方 ButtonImpl。
      { variant: "ghost", tone: "danger", muted: true, class: "hover:text-danger" },
      { variant: "ghost", tone: "success", muted: true, class: "hover:text-success" },
      { variant: "ghost", tone: "warning", muted: true, class: "hover:text-warning" },
      { variant: "link", tone: "danger", muted: true, class: "hover:text-danger" },
      { variant: "link", tone: "success", muted: true, class: "hover:text-success" },
      { variant: "link", tone: "warning", muted: true, class: "hover:text-warning" },
    ],
    defaultVariants: { variant: "solid", tone: "brand", size: "md" },
  },
);

/**
 * 出口这层 `cn`（tailwind-merge）不是可有可无的（#217）。
 *
 * cva 只做字符串拼接、不做冲突消解——base 的 `text-foreground` 与 compound 的 `text-danger`
 * 会**同时**留在类串里。`<Button>` 内部本来就有 `cn()` 兜着，但 `buttonVariants` 作为公共出口
 * 没有：文档明示的「只要按钮样式不要 `<button>` 语义」那条路上，两条规则都进 DOM，
 * 最终谁生效由**样式表顺序**决定，而不是由 cva 顺序决定。消费方实测 16 个常用组合里 6 个渲染错色，
 * 其中 3 个是 danger 按钮丢掉红色——用户看不出那是破坏性操作。
 *
 * 对 `<Button>` 侧是幂等的（twMerge 跑两遍结果相同），消费方零改动。
 * 类型保持 cva 产物的形状：`ButtonProps` 靠 `VariantProps<typeof buttonVariants>` 推导。
 */
export const buttonVariants: typeof buttonVariantsCva = (props) => cn(buttonVariantsCva(props));

export { BUTTON_BASE_CLASS, BUTTON_SIZE_CLASS };

const ButtonImpl = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, tone, size, block, muted, loading, disabled, children, render, ...props },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    // muted 只对无底色的两档有意义。落在 solid / soft / outline 上时它一个类都不加，
    // 那就是个静默无效的 prop —— 静默无效比报错更难查，所以开发期点名。
    if (muted && variant && variant !== "ghost" && variant !== "link") {
      warnOnce(
        `button-muted-on-${variant}`,
        `[hulian] Button: muted 只在 variant="ghost" / "link" 上有效，variant="${variant}" 上不会有任何变化。` +
          `想要更弱的实心/浅底按钮请改用 variant="ghost" muted 或 tone="neutral"。`,
      );
    }
    // ghost 上的 brand 与 neutral 渲染结果逐字相同（#218）——`ghost` 的中性外观**就是**它的
    // 默认形态，而 tone 的默认值恰好叫 brand，于是显式写 tone="brand" 的人拿到的不是主色。
    // 这一格不能在 cva 里补（理由见上），但这里能：没传 tone 时它是 undefined，
    // 只有**显式**写了才等于 "brand"，所以 207 处不写 tone 的 ghost 一条告警都不会看到。
    // 判据同 muted：静默无效的 prop 比报错更难查。
    if (tone === "brand" && variant === "ghost") {
      warnOnce(
        "button-ghost-tone-brand",
        `[hulian] Button: variant="ghost" 上的 tone="brand" 与不写 tone 渲染结果相同（中性外观），` +
          `不会得到主色。要主色文字按钮请用 variant="link"（默认就是主色），` +
          `要「静息灰 → hover 主色」请用 variant="link" muted。`,
      );
    }
    // 同理（#215）：current 的意思是「别设色、跟随容器」，只有无底色的 ghost / outline 说得通。
    // solid / soft 自带背景，前景跟着容器走会做出对比度不合规的组合；link 的静息色是主色，
    // 那是链接的身份不是容器的。落在这几档上一个类都不加，故照 muted 的先例开发期点名。
    if (tone === "current" && variant && variant !== "ghost" && variant !== "outline") {
      warnOnce(
        `button-tone-current-on-${variant}`,
        `[hulian] Button: tone="current" 只在 variant="ghost" / "outline" 上有效，variant="${variant}" 上不会有任何变化。` +
          `solid / soft 自带背景，前景色必须与背景成对；link 的静息色是主色。`,
      );
    }
    const content = (
      <>
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {children ?? (render?.props as { children?: ReactNode } | undefined)?.children}
      </>
    );

    // render：渲染为自定义元素（<a>/<Link>）。:disabled 伪类只对表单元素有效，故非 button
    // 用 aria-disabled + 显式 pointer-events/opacity 表达禁用；不套 motion（无 press 缩放）。
    if (render) {
      const renderProps = render.props as Record<string, unknown>;
      return cloneElement(
        render,
        {
          ...props,
          ref,
          className: cn(
            buttonVariants({ variant, tone, size, block, muted }),
            isDisabled && "pointer-events-none opacity-50",
            className,
            renderProps.className as string | undefined,
          ),
          "aria-disabled": isDisabled || undefined,
          "data-disabled": isDisabled ? "" : undefined,
        } as Record<string, unknown>,
        content,
      );
    }

    return (
      // 减包：m + LazyMotionProvider(domAnimation) 取代全量 motion
      <LazyMotionProvider>
        <m.button
          ref={ref}
          // 默认 type="button"，而不是原生 <button> 的默认值 submit（#219）。
          // 表单里的辅助按钮（「查看」「设为封面」「+ 添加一项」）不写 type 时会走完整条提交链路：
          // 校验 → onFinish → 请求发出 → 抽屉关闭，而且失败得很安静——不抛错、不打 console，
          // 类型检查与构建全绿，现象只是「点了个查看按钮，抽屉怎么关了」。等发现时数据已经写回去了。
          // shadcn/ui、Ant Design、MUI 都在这一层抹平这个 HTML 历史包袱，理由相同：
          // 按钮出现在表单里是常态，而其中绝大多数不是提交按钮。
          // 库内所有提交按钮（ProForm / LoginForm / FormDialog / SearchForm）本来就显式写了
          // type="submit"，故这次改动对库内零影响。放在展开之前，调用点写的 type 照样覆盖。
          type="button"
          className={cn(buttonVariants({ variant, tone, size, block, muted }), className)}
          disabled={isDisabled}
          // press 反馈走 motion 的 transform scale，与 CSS 的颜色过渡互不干扰；禁用态不缩放
          whileTap={isDisabled ? undefined : pressable.whileTap}
          transition={pressable.transition}
          {...(props as HTMLMotionProps<"button">)}
        >
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {children}
        </m.button>
      </LazyMotionProvider>
    );
  },
);
ButtonImpl.displayName = "Button";

export const Button = memo(ButtonImpl);
Button.displayName = "Button";
