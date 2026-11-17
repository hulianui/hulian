"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type {
  TabsListProps,
  TabsPanelProps,
  TabsProps,
  TabsSize,
  TabsTabProps,
  TabsTone,
} from "./tabs.types";

// ── 自动轮播 ───────────────────────────────────────────────────────────────
// 首页「产品线」这类展示型 tab：没人操作时按固定节奏换档，选中 tab 底部一条进度条走满即换。
// 计时交给进度条自己的动画（WAAPI）：暂停 = 动画暂停，于是「条停了、档照换」的两套时钟不会对不上。
// 以下情况暂停：指针悬停 / 焦点在组件内、组件不在视口（< 30% 可见）。系统要求减少动态效果时整个不启用。
// 访客一旦自己选档（点击 / 键盘）就永久停下，把控制权交还给人。
type TabValue = TabsProps["value"];
interface AutoPlayContextValue {
  current: TabValue;
  running: boolean;
  duration: number;
  advance: () => void;
  register: (value: TabValue, el: HTMLElement) => () => void;
}
const TabsAutoPlayContext = createContext<AutoPlayContextValue | null>(null);

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// 自动换档也要走 onValueChange（受控用法得跟上），Base UI 的签名要求带 eventDetails。
// reason 取 "none"；trigger 为空即可区分「不是人点的」。
function autoPlayDetails(direction: "right" | "down") {
  return {
    reason: "none",
    event: typeof Event === "function" ? new Event("autoplay") : undefined,
    cancel() {},
    allowPropagation() {},
    isCanceled: false,
    isPropagationAllowed: false,
    trigger: undefined,
    activationDirection: direction,
  } as unknown as Parameters<NonNullable<TabsProps["onValueChange"]>>[1];
}

function AutoPlayTabs({
  autoPlay,
  value: valueProp,
  defaultValue,
  onValueChange,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: TabsProps & { autoPlay: number }) {
  const controlled = valueProp !== undefined;
  const [inner, setInner] = useState<TabValue>(defaultValue);
  const current = controlled ? valueProp : inner;
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  // 挂载前按「减少动态效果」处理：SSR 首屏不出进度条，避免水合前后不一致。
  const [reduced, setReduced] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabs = useRef(new Map<TabValue, HTMLElement>());
  const running = !stopped && !reduced && !hovered && visible;

  useEffect(() => {
    // 缺 matchMedia 的环境（jsdom、部分 WebView）按「不减少动效」处理，不抛错。
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false);
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const currentRef = useRef(current);
  currentRef.current = current;

  const advance = useCallback(() => {
    // 按 DOM 顺序取未禁用的 tab：注册顺序不一定等于视觉顺序（条件渲染、重排）。
    const entries = [...tabs.current.entries()]
      .filter(([, el]) => el.isConnected && !el.hasAttribute("data-disabled"))
      .sort((a, b) =>
        a[1].compareDocumentPosition(b[1]) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
    if (entries.length < 2) return;
    const i = entries.findIndex(([v]) => Object.is(v, currentRef.current));
    const next = entries[(i + 1) % entries.length][0];
    if (!controlled) setInner(next);
    onValueChange?.(next, autoPlayDetails(props.orientation === "vertical" ? "down" : "right"));
  }, [controlled, onValueChange, props.orientation]);

  const register = useCallback((value: TabValue, el: HTMLElement) => {
    tabs.current.set(value, el);
    return () => {
      if (tabs.current.get(value) === el) tabs.current.delete(value);
    };
  }, []);

  const ctx = useMemo(
    () => ({ current, running, duration: autoPlay, advance, register }),
    [current, running, autoPlay, advance, register],
  );

  return (
    <TabsAutoPlayContext.Provider value={stopped || reduced ? null : ctx}>
      <BaseTabs.Root
        {...props}
        ref={rootRef}
        value={current}
        onValueChange={(v, details) => {
          // Base UI 自己修正选中值（initial / missing / disabled）不算人为操作；只有 none 是用户选的。
          if (details?.reason === "none") setStopped(true);
          if (!controlled) setInner(v);
          onValueChange?.(v, details);
        }}
        onPointerEnter={(e) => {
          setHovered(true);
          onPointerEnter?.(e);
        }}
        onPointerLeave={(e) => {
          setHovered(false);
          onPointerLeave?.(e);
        }}
        onFocus={(e) => {
          setHovered(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setHovered(false);
          onBlur?.(e);
        }}
      />
    </TabsAutoPlayContext.Provider>
  );
}

/** 选中 tab 底部的轮播进度条：WAAPI 从 0 走到满，走满即换下一档；暂停时动画一起停。 */
function AutoPlayProgress({ ctx }: { ctx: AutoPlayContextValue }) {
  const ref = useRef<HTMLSpanElement>(null);
  const anim = useRef<Animation | null>(null);
  const { advance, duration, running } = ctx;
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    const a = el.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration,
      easing: "linear",
      fill: "both",
    });
    a.pause();
    a.onfinish = () => advanceRef.current();
    anim.current = a;
    return () => {
      a.onfinish = null;
      a.cancel();
    };
  }, [duration]);

  useEffect(() => {
    const a = anim.current;
    if (!a) return;
    if (running) a.play();
    else a.pause();
  }, [running]);

  return (
    <span
      ref={ref}
      aria-hidden
      data-slot="tabs-autoplay-progress"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary"
    />
  );
}

// 根：透传 Base UI Tabs.Root（value/defaultValue/onValueChange/orientation）。默认非受控。
// 传了 autoPlay（毫秒）才走自动轮播那一层；不传时与之前逐字相同。
export function Tabs({ autoPlay, ...props }: TabsProps) {
  if (autoPlay && autoPlay > 0) return <AutoPlayTabs autoPlay={autoPlay} {...props} />;
  return <BaseTabs.Root {...props} />;
}

// tab 条容器皮肤：underline=下划线条；solid=分段药丸轨道。relative 锚定内嵌 Indicator。
//
// 尺寸档（#269）：tab 条经常不是页面级导航，而是跟标题、搜索框同行的一个切换器 ——
// 那一行的既有高度是 28–32px，而 md 档带一颗计数 Tag 的 tab 是 36px、轨道 44px，塞不进去。
// 消费方压不回来：TabsList 是 inline-flex items-center，强写 h-7 只会让 36px 的 tab 居中溢出，
// 药丸上下各探出轨道 4px（实测），比高一点更难看。所以这一档只能由库给。
export const tabsListVariants = cva("relative inline-flex items-center", {
  variants: {
    variant: {
      underline: "border-b border-border",
      // bg-track 而非 bg-surface-hover：后者与药丸的 bg-surface 亮色下只差 3.3%、暗色下方向还是反的（#152）。
      solid: "rounded-[var(--hl-radius-control,var(--radius))] bg-track",
      // 卡片档：每个 tab 是一张带描述的卡（图标 + 标题 + 一行说明），竖排时纵向堆叠。
      // 展示型 tab（营销页的产品线、功能介绍）用；选中卡自己铺主色浅底，不另画滑块。
      card: "gap-2 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
    },
    size: { sm: "gap-0.5", md: "gap-1" },
  },
  // solid 的轨道内边距跟着尺寸走；md 逐字保持改动前的 p-1。
  compoundVariants: [
    { variant: "solid", size: "sm", class: "p-0.5" },
    { variant: "solid", size: "md", class: "p-1" },
    { variant: "card", class: "gap-2" },
  ],
  defaultVariants: { variant: "underline", size: "md" },
});

/**
 * 尺寸由 TabsList 下发给 TabsTab：尺寸与皮肤变体同层（都在 TabsList 上）才一致，
 * 而 tab 是散件、逐个传必然漂。默认 md —— TabsTab 单独用（不套本库的 List）时行为不变。
 */
const TabsSizeContext = createContext<TabsSize>("md");

/**
 * 语义档同样由 TabsList 下发（走 TabsSizeContext 那条既有的路，不新造下发机制）。
 * 默认 brand：选中态带品牌色才读得出「这一页是当前页」，中性前景色与未选中的 muted 只差一档灰，
 * 在 solid 白药丸上尤其难认。最初为了「存量零像素变化」默认 neutral，后按产品口径改为 brand；
 * 要旧观感的调用点显式传 tone="neutral"。TabsTab 不套本库 List 单独用时也走这一档。
 */
const TabsToneContext = createContext<TabsTone>("brand");

/** 皮肤也下发：card 档的 tab 自己画卡皮，不吃 underline / solid 那套选中文字色。 */
const TabsVariantContext = createContext<"underline" | "solid" | "card">("underline");

/**
 * 选中文字色（皮肤无关，solid 与 underline 吃同一档 —— #316 要抹平的正是这两个皮肤对色的态度不一致）。
 *
 * `neutral` 那格刻意是**空串**：不追加任何类，让基类里原有的 `data-[active]:text-foreground`
 * 原样生效。于是 tone="neutral" 时 class 字符串与加 tone 之前逐字相同（不是"看起来一样"，是同一串），
 * 这是要旧观感的调用点的退路。
 *
 * 非 neutral 档靠 tailwind-merge 顶掉基类那条：`data-[active]:text-foreground` 与
 * `data-[active]:text-primary` 同组同变体，后者胜（#316 里实测过的行为）。
 */
const activeTextByTone: Record<TabsTone, string> = {
  neutral: "",
  brand: "data-[active]:text-primary",
  success: "data-[active]:text-success",
  warning: "data-[active]:text-warning",
  danger: "data-[active]:text-danger",
};

/**
 * 滑块的 tone 生效面**按皮肤分叉**，这不是漏做：
 * - underline 的下划线是"哪一段被选中"的主要色载体，必须跟 tone；
 * - solid 的药丸底保持 `bg-surface`（白药丸 + 语义字，即 #316 截图那个形态）。语义色铺满药丸
 *   会把 tab 文字自身的语义盖掉，且那一档（浅语义底，对齐 Button 的 `soft`）是留给后续的，
 *   现在就把 tone 钉死成"连底一起染"会堵死那条路。
 *
 * `neutral` 与 `brand` 都是空串：基类写的就是 `bg-primary` —— brand 是 primary 的对外名字，
 * 而 neutral 按 #316 的拍板"逐字保持今天的渲染"，今天的下划线本来就写死品牌色。
 */
const underlineIndicatorByTone: Record<TabsTone, string> = {
  neutral: "",
  brand: "",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

// Indicator 过渡：复用 motion-token 的 CSS 镜像，手感同 Dialog/Button，零 motion 运行时。
const indicatorTransition: CSSProperties = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
};

// Indicator 绑 Base UI 测好的 6 个几何变量 → 纯 CSS 平滑滑动。
// underline 只动 width + translateX；solid 动 width/height + translate(x,y)。
const indicatorByVariant: Record<
  "underline" | "solid",
  { className: string; style: CSSProperties }
> = {
  underline: {
    className: "pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-primary",
    style: {
      ...indicatorTransition,
      transitionProperty: "transform, width",
      width: "var(--active-tab-width)",
      transform: "translateX(var(--active-tab-left))",
    },
  },
  solid: {
    className:
      "pointer-events-none absolute left-0 top-0 rounded-[calc(var(--hl-radius-control,var(--radius))-0.25rem)] bg-surface shadow-sm",
    style: {
      ...indicatorTransition,
      transitionProperty: "transform, width, height",
      width: "var(--active-tab-width)",
      height: "var(--active-tab-height)",
      transform: "translate(var(--active-tab-left), var(--active-tab-top))",
    },
  },
};

export function TabsList({ className, variant, size, tone, children, ...props }: TabsListProps) {
  const v = variant ?? "underline";
  const s = size ?? "md";
  const t = tone ?? "brand";
  return (
    <BaseTabs.List {...props} className={cn(tabsListVariants({ variant: v, size: s }), className)}>
      {/* card 档没有滑块：选中卡自己铺底。 */}
      {v !== "card" && (
        <BaseTabs.Indicator
          className={
            v === "underline"
              ? cn(indicatorByVariant[v].className, underlineIndicatorByTone[t])
              : indicatorByVariant[v].className
          }
          style={indicatorByVariant[v].style}
        />
      )}
      <TabsVariantContext.Provider value={v}>
        <TabsSizeContext.Provider value={s}>
          <TabsToneContext.Provider value={t}>{children}</TabsToneContext.Provider>
        </TabsSizeContext.Provider>
      </TabsVariantContext.Provider>
    </BaseTabs.List>
  );
}

// Tab：皮肤无关。text-muted-foreground→data-[active]:text-foreground；relative z-10 让文字盖在 solid 药丸之上。
// 选中色可被 TabsList 的 tone 顶掉（见 activeTextByTone），未选中/hover 两态不受 tone 影响 ——
// tone 只回答"选中意味着什么"，静息层级是另一件事。
const tabsTabVariants = cva(
  cn(
    "relative z-10 cursor-pointer select-none rounded-[var(--hl-radius-control,var(--radius))] font-medium",
    "text-muted-foreground transition-colors hover:text-foreground data-[active]:text-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--hl-opacity-disabled,0.5)]",
  ),
  {
    variants: {
      // 纯文字实测：sm tab 24px / solid 轨道 28px；md 逐字保持改动前的 32 / 40。
      size: { sm: "px-2 py-1 text-xs", md: "px-3 py-1.5 text-sm" },
    },
    defaultVariants: { size: "md" },
  },
);

// card 档的 tab 皮：整张卡可点，选中铺主色浅底 + 浅边 + 轻投影，未选中透明边、悬停铺中性浅底。
// 文字色交给卡里的内容自己定（标题正文色、说明次要灰），tab 本身不染选中文字色。
const CARD_TAB =
  "relative flex w-full items-start gap-3.5 overflow-hidden rounded-xl border border-transparent p-4 text-left font-normal text-foreground hover:bg-surface-hover data-[active]:border-primary-border data-[active]:bg-primary-subtle data-[active]:text-foreground data-[active]:shadow-sm data-[active]:hover:bg-primary-subtle";

export function TabsTab({ className, children, value, ...props }: TabsTabProps) {
  const size = useContext(TabsSizeContext);
  const tone = useContext(TabsToneContext);
  const variant = useContext(TabsVariantContext);
  const autoPlay = useContext(TabsAutoPlayContext);
  const elRef = useRef<HTMLElement | null>(null);
  const register = autoPlay?.register;

  useEffect(() => {
    if (!register || !elRef.current) return;
    return register(value, elRef.current);
  }, [register, value]);

  const selected = autoPlay != null && Object.is(autoPlay.current, value);
  // tone 类排在 className 之前：消费方的 className 仍然是最后一道，能继续盖住库给的选中色。
  return (
    <BaseTabs.Tab
      {...props}
      value={value}
      ref={elRef}
      className={cn(
        tabsTabVariants({ size }),
        variant === "card" ? CARD_TAB : activeTextByTone[tone],
        className,
      )}
    >
      {children}
      {/* key 换档时重挂载：新选中的那一档从 0 重新走。 */}
      {selected && <AutoPlayProgress key={String(value)} ctx={autoPlay} />}
    </BaseTabs.Tab>
  );
}

export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return (
    <BaseTabs.Panel
      {...props}
      className={cn(
        "mt-3 rounded-[var(--radius)] text-sm text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        className,
      )}
    />
  );
}
