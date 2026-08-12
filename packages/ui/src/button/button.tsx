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

export const buttonVariants = cva(BUTTON_BASE_CLASS, {
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
      // 语义档。取值集是 conventions 里「语义 tone SSOT」的全集，其余组件按各自能表达的范围裁剪子集。
      // brand 是 primary 的对外名字（历史遗留的两种叫法，Button 以 brand 为准）。
      tone: { brand: "", success: "", warning: "", danger: "", neutral: "" },
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
      { variant: "soft", tone: "brand", class: "bg-primary/12 text-primary hover:bg-primary/20" },
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
