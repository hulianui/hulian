"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { cva } from "class-variance-authority";
import { Menu } from "../_icons";
import { renderAsElement } from "../button/button-base";
import { useComponentLocale } from "../config/locale-context";
import { Drawer, DrawerContent } from "../drawer";
import { Input } from "../input";
import { resolveBreakpointPx } from "../layout/layout-sider";
import { cn } from "../lib/cn";
import { usePrefersReducedMotion } from "../lib/use-prefers-reduced-motion";
import { motionDurationCss, motionEaseCss } from "../motion";
import { Skeleton } from "../skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import type {
  SidebarContextValue,
  SidebarGroupActionProps,
  SidebarInputProps,
  SidebarMenuActionProps,
  SidebarMenuButtonProps,
  SidebarMenuSkeletonProps,
  SidebarMenuSubButtonProps,
  SidebarProps,
  SidebarProviderProps,
  SidebarRailProps,
  SidebarState,
  SidebarTriggerProps,
} from "./sidebar.types";

// Sidebar = **组合式**应用外壳：状态机（展开/折叠/移动端抽屉）+ 一组结构槽位。
//
// 与库内两个近邻的分工（别再造第二个 AdminLayout）：
//  · NavMenu   —— 菜单**内容**本身，数据驱动（items 树），不含外壳、不含折叠态、不含移动端形态。
//    想要数据驱动的导航，直接把 <NavMenu> 放进 <SidebarContent> 即可，两者是嵌套关系不是竞争关系。
//  · AdminLayout —— **成品整页骨架**：侧栏 + 顶栏 + 多页签 + 内容区，一个 menuItems 就出一个中后台。
//    代价是形态被钉死：侧栏里塞不进工作区切换器、搜索框、每项右侧的次级菜单。
//  · Sidebar   —— **半成品**：只管左栏与其兄弟内容区（SidebarInset），里面长什么样全由 children 决定。
//    这正是 kaneo 那种「工作区切换器 + 项目列表带 per-item 菜单 + 底部用户卡」拼不进 AdminLayout 的原因。
//
// 布局刻意走 **in-flow flex 宽度过渡**，不是 shadcn 那套 `fixed` 面板 + 等宽占位 div：
// fixed 面板一旦被放进任何非全屏容器（文档站预览框、Viewport 设备框、分栏工作区）就会逃逸出框贴住视口。
// in-flow 方案与库内 LayoutSider / AdminLayout 同构，且不需要任何测量。

const SidebarContext = createContext<SidebarContextValue | null>(null);

// 这两个是纯内部管道，不进 useSidebar() 的公开形状：
//  · id 供 SidebarTrigger 的 aria-controls 指向真实存在的 aside；
//  · width 供移动端抽屉用 —— 抽屉 portal 到 body，拿不到 wrapper 上那个 CSS 变量。
const SidebarIdContext = createContext<string>("");
const SidebarWidthContext = createContext<string>("16rem");

/**
 * 读取侧栏状态机。必须在 `<SidebarProvider>` 内调用 —— 拿不到 context 直接抛，
 * 不做静默兜底：返回一个假的 `state: "expanded"` 只会让消费方以为侧栏坏了而不是没接上。
 */
export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("[瑚琏] useSidebar 必须在 <SidebarProvider> 内使用。");
  return ctx;
}

/**
 * 快捷键要不要让路。
 *
 * 这是本组件最容易漏、漏了最难查的一条：不判就是「在任务标题输入框里按 Cmd+B 侧栏乱跳」，
 * 而 Cmd+B 在富文本里本来是「加粗」。四种放行情形：
 *  1. `event.defaultPrevented` —— 别人已经处理过这次按键（如编辑器自己的加粗），我们不抢。
 *  2. input / textarea / select —— 原生表单控件内。
 *  3. contenteditable 元素本身。
 *  4. contenteditable 的**后代**：富文本里光标落在 `<strong>` 上时 target 是 strong 不是编辑区，
 *     只判自身会漏掉整个富文本编辑器 —— 所以要 closest 上溯。
 *
 * 用鸭子类型而不是 `instanceof HTMLElement`：跨 realm（iframe 预览 / 测试环境）下 instanceof 为假，
 * 而 jsdom 至今不实现 `isContentEditable`（恒 undefined），只靠它判会让第 3、4 条在测试里假绿。
 */
export function isEditableEventTarget(target: EventTarget | null): boolean {
  const el = target as
    | (Partial<HTMLElement> & { closest?: (selectors: string) => unknown })
    | null;
  if (!el || typeof el.tagName !== "string") return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.isContentEditable) return true;
  if (typeof el.closest !== "function") return false;
  return el.closest('[contenteditable]:not([contenteditable="false"])') != null;
}

/**
 * icon 折叠档下 `SidebarMenuButton` 的 tooltip 该不该挂。
 *
 * 抽成纯函数是为了能被直接断言：这条判断在 DOM 上几乎不留痕迹（Tooltip 关闭时不渲染任何东西），
 * 只测「渲染没崩」等于没测。三个条件缺一不可 —— 展开态文字就在旁边、移动端抽屉里也是全宽带文字的，
 * 两种情况下挂 Tooltip 都是纯噪音，还会在触屏上挡住相邻项。
 */
export function shouldEnableSidebarTooltip(
  hasTooltip: boolean,
  state: SidebarState,
  isMobile: boolean,
): boolean {
  return hasTooltip && !isMobile && state === "collapsed";
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  mobileBreakpoint = "md",
  shortcutKey = "b",
  width = "16rem",
  iconWidth = "3rem",
  fitViewport = true,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const [openI, setOpenI] = useState(defaultOpen);
  const open = openProp ?? openI;
  const [openMobile, setOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenI(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  // 响应式：视口窄于断点即切抽屉。首帧恒 false（= 桌面形态）而不是读 window ——
  // SSR 与 hydration 必须给出同一棵树，第一帧就读视口宽度是 hydration mismatch 的经典来源。
  // jsdom 无 matchMedia → 守卫跳过，测试里默认桌面形态（要测移动端就自己桩 matchMedia）。
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(`(max-width: ${resolveBreakpointPx(mobileBreakpoint) - 1}px)`);
    setIsMobile(mql.matches);
    const handler = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [mobileBreakpoint]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile((prev) => !prev);
    else setOpen(!open);
  }, [isMobile, open, setOpen]);

  // 快捷键监听走 ref 持最新 toggle：把 toggleSidebar 放进依赖会让每次开合都重订阅一遍 window。
  const toggleRef = useRef(toggleSidebar);
  toggleRef.current = toggleSidebar;

  useEffect(() => {
    if (shortcutKey === false || typeof window === "undefined") return;
    const key = shortcutKey.toLowerCase();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== key) return;
      if (isEditableEventTarget(event.target)) return;
      event.preventDefault();
      toggleRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcutKey]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      state: open ? "expanded" : "collapsed",
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [open, setOpen, openMobile, isMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <SidebarIdContext.Provider value={sidebarId}>
        <SidebarWidthContext.Provider value={width}>
          <div
            data-hulian-sidebar-wrapper=""
            className={cn(
              "flex w-full text-foreground",
              // 整页外壳自钉视口高度（同 AdminLayout），侧栏与内容区各自内部滚动；
              // 嵌进定高容器预览时传 fitViewport={false} 跟随父容器。
              fitViewport ? "h-dvh overflow-hidden" : "h-full",
              // inset 形态下浮岛四周的留白露的是**外壳**的底，所以底色得挂在这一层。
              // 用 :has() 而不是把 variant 提到 Provider 上：形态是 <Sidebar> 的属性，
              // 提上来就等于要求两处各写一遍、还得保持一致（#224）。
              "has-[aside[data-variant=inset]]:bg-[var(--hl-sidebar-surface,var(--color-surface))]",
              className,
            )}
            style={
              {
                "--hl-sidebar-width": width,
                "--hl-sidebar-width-icon": iconWidth,
                ...style,
              } as CSSProperties
            }
            {...props}
          >
            {children}
          </div>
        </SidebarWidthContext.Provider>
      </SidebarIdContext.Provider>
    </SidebarContext.Provider>
  );
}

// 栏底色：默认就是 --color-surface（不传等于零改动），但留一个专用变量做逃生口（#224）。
//
// 为什么不让消费方直接顶 className：那会把「侧栏用什么底色」这件事变成调用点的私事，
// 升级时的视觉回归无从归因（消费方的迁移规约也普遍禁止顶库组件的颜色）。
// 为什么不让他们改 --color-surface：那是全库共用的表面色，为侧栏改一处会牵动
// Card / Popover / Menu 等所有件。
//
// shadcn 血统的应用侧栏几乎都有「导航面是后面一层、内容是前面一层」的明度差，而本库的
// surface 与 bg 在亮色下可能同为白（取决于消费方的桥接层），三层同色只剩 1px 边框分界。
// 给一个变量就够了：`[--hl-sidebar-surface:var(--color-muted)]` 或任意色值挂在
// SidebarProvider 上即可，不必碰全局 token，也不必顶色。
const SIDEBAR_SURFACE = "bg-[var(--hl-sidebar-surface,var(--color-surface))]";

export function Sidebar({
  side = "left",
  collapsible = "offcanvas",
  variant = "sidebar",
  mobileTitle,
  mobileDescription,
  mobileShowClose = false,
  mobileClassName,
  className,
  style,
  children,
  ...props
}: SidebarProps) {
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar();
  const sidebarId = useContext(SidebarIdContext);
  const width = useContext(SidebarWidthContext);
  const reduceMotion = usePrefersReducedMotion();
  const locale = useComponentLocale().sidebar;
  const title = mobileTitle ?? locale?.mobileTitle ?? "侧边导航";
  const description = mobileDescription ?? locale?.mobileDescription ?? "应用主导航。按 Esc 或点击遮罩关闭。";

  // 折叠形态只影响桌面；移动端恒按展开态渲染（抽屉本来就是全宽的）。
  const collapsed = state === "collapsed" && collapsible !== "none";
  const shell = (
    <div
      data-sidebar="root"
      data-state={isMobile ? "expanded" : state}
      data-collapsible={!isMobile && collapsed ? collapsible : ""}
      data-side={side}
      data-mobile={isMobile || undefined}
      className="group/sidebar flex h-full w-full min-w-0 flex-col"
    >
      {children}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={openMobile} onOpenChange={setOpenMobile}>
        <DrawerContent
          side={side}
          showClose={mobileShowClose}
          // 无障碍：抽屉必须有可及的名字与说明，但侧栏的可见标题应该由消费方放进 SidebarHeader，
          // 所以这两条一律 sr-only（Dialog.Title 里放 sr-only 子元素，标题元素本身高度为 0）。
          title={<span className="sr-only">{title}</span>}
          description={<span className="sr-only">{description}</span>}
          descriptionClassName="sr-only"
          scrollable={false}
          // 抽屉默认 24px 内边距 + 24rem 宽是「面板」尺寸，侧栏要的是零内边距 + 跟随 width。
          // --hl-overlay-pad 必须与内边距同步归零，否则正文那层负边距会把内容顶出抽屉外。
          className={cn(
            "w-auto max-w-[85vw] gap-0 border-none p-0 [--hl-overlay-pad:0px]",
            mobileClassName,
          )}
          bodyClassName="m-0 flex min-h-0 flex-1 flex-col p-0"
        >
          <div className={cn("flex h-full flex-col", SIDEBAR_SURFACE)} style={{ width }}>
            {shell}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // 宽度在 in-flow 里过渡：三个值都是 CSS 变量引用或 0，计算值变化即触发 transition。
  const resolvedWidth =
    collapsible === "none" || !collapsed
      ? "var(--hl-sidebar-width)"
      : collapsible === "icon"
        ? "var(--hl-sidebar-width-icon)"
        : "0px";

  const inset = variant === "inset";

  return (
    <aside
      id={sidebarId}
      data-state={state}
      data-collapsible={collapsed ? collapsible : ""}
      data-side={side}
      data-variant={variant}
      // peer/sidebar：SidebarInset 是它的**后继兄弟**，靠这个把 inset 形态传给内容区，
      // 不必把 variant 塞进 context 再多一层订阅（也不必要求两者写在同一个组件里）。
      className={cn(
        "peer/sidebar relative flex h-full shrink-0 flex-col overflow-hidden",
        SIDEBAR_SURFACE,
        // inset 形态下侧栏与内容区之间靠留白分界，不要边框（有边框就成了「带线的浮岛」）
        inset
          ? "p-2 data-[collapsible=offcanvas]:p-0"
          : side === "left"
            ? "border-r border-border"
            : "border-l border-border",
        // offcanvas 收到 0 宽时边框仍会占 1px，留下一条「关不干净」的竖线。
        "data-[collapsible=offcanvas]:border-none",
        className,
      )}
      style={{
        width: resolvedWidth,
        minWidth: resolvedWidth,
        // 减弱动效时**整条 transition 都不写**（#225）：这几条是内联 style，优先级高于任何
        // 普通 CSS 规则，消费方只能用 !important + 猜库内部 DOM 结构才盖得掉——而那种写法
        // 结构一变就静默失效，失效的表现还是「无障碍偏好不生效」，不会有任何报错。
        // 侧栏开合是整页级的容器变形，正是 reduce 下最该关掉的那一类（前庭敏感人群对大面积位移最敏感）。
        ...(reduceMotion
          ? null
          : {
              transitionProperty: "width, min-width",
              transitionDuration: motionDurationCss.base,
              transitionTimingFunction: motionEaseCss.out,
            }),
        ...style,
      }}
      {...props}
    >
      {shell}
    </aside>
  );
}

/**
 * 侧栏的兄弟内容区：占满剩余宽度、自己滚动。
 *
 * `Sidebar variant="inset"` 时自动变成浮岛（外留白 + 圆角 + 描边），靠 `peer-data-*` 读
 * 前一个兄弟（aside）的形态 —— 所以两者必须是同一层的兄弟，中间不要再包一层 div。
 * 移动端侧栏走抽屉（不在流内），选择器自然不命中，浮岛样式也就不生效，与 shadcn 一致。
 */
export function SidebarInset({ className, ...props }: ComponentProps<"main">) {
  return (
    <main
      className={cn(
        "relative flex min-h-0 min-w-0 flex-1 flex-col bg-bg",
        "peer-data-[variant=inset]/sidebar:m-2 peer-data-[variant=inset]/sidebar:ml-0",
        "peer-data-[variant=inset]/sidebar:overflow-hidden peer-data-[variant=inset]/sidebar:rounded-xl",
        "peer-data-[variant=inset]/sidebar:border peer-data-[variant=inset]/sidebar:border-hairline",
        "peer-data-[variant=inset]/sidebar:shadow-sm",
        // 贴右时留白要换边，否则浮岛与侧栏之间没有缝、外侧反而空着
        "peer-data-[side=right]/sidebar:peer-data-[variant=inset]/sidebar:ml-2",
        "peer-data-[side=right]/sidebar:peer-data-[variant=inset]/sidebar:mr-0",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarTrigger({
  render,
  className,
  onClick,
  children,
  ...props
}: SidebarTriggerProps) {
  const { toggleSidebar, isMobile, open, openMobile } = useSidebar();
  const sidebarId = useContext(SidebarIdContext);
  const locale = useComponentLocale().sidebar;
  const label = props["aria-label"] ?? locale?.toggle ?? "切换侧栏";
  const merged = {
    ...props,
    type: "button" as const,
    "aria-label": label,
    "aria-expanded": isMobile ? openMobile : open,
    // 移动端侧栏是 portal 出去的抽屉，此时那个 aside 根本不在 DOM 里 ——
    // aria-controls 指向不存在的 id 比不写更糟。
    "aria-controls": isMobile ? undefined : sidebarId,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) toggleSidebar();
    },
  };
  const content = children ?? <Menu className="size-4" aria-hidden />;
  const cls = cn(
    "inline-grid size-8 shrink-0 cursor-pointer place-items-center rounded-[var(--radius)] text-muted-foreground outline-none transition-colors",
    "hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
    className,
  );
  if (render) return renderAsElement(render, merged, cls, undefined, content);
  return (
    <button {...merged} className={cls}>
      {content}
    </button>
  );
}

/**
 * 贴边热区：鼠标够到侧栏边缘即可开合，不必回到顶栏找按钮。
 *
 * 两个刻意的决定：
 *  · `tabIndex={-1}` —— 键盘用户的入口是 SidebarTrigger，两个 Tab 落点做同一件事只是噪音。
 *  · 无障碍名**不与 SidebarTrigger 同字**（走 locale 的 `sidebar.rail` 而非 `sidebar.toggle`）。
 *    同一个侧栏里两个叫「切换侧栏」的按钮，读屏用户在元素列表里无从分辨点哪个，
 *    而 `getByRole("button", { name: "切换侧栏" })` 也会当场报「找到多个」—— 后者正是前者的回声。
 */
export function SidebarRail({ label, className, onClick, ...props }: SidebarRailProps) {
  const { toggleSidebar } = useSidebar();
  const locale = useComponentLocale().sidebar;
  const name = label ?? locale?.rail ?? "拖到边缘切换侧栏";
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={name}
      title={name}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggleSidebar();
      }}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-3 cursor-pointer outline-none sm:block",
        // 移动端是抽屉，边缘热区在触屏上只会和系统的侧滑手势打架。
        "group-data-[mobile]/sidebar:hidden",
        "group-data-[side=left]/sidebar:right-0 group-data-[side=right]/sidebar:left-0",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:-translate-x-1/2 after:transition-colors",
        "hover:after:bg-primary focus-visible:after:bg-primary",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-sidebar="header"
      className={cn("flex shrink-0 flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden",
        // icon 档下把纵向滚动关掉：3rem 宽里出现滚动条会把图标挤歪，而折叠态本来就该只留一列图标。
        "group-data-[collapsible=icon]/sidebar:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-sidebar="footer"
      className={cn("flex shrink-0 flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

export function SidebarSeparator({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("mx-2 h-px shrink-0 bg-border", className)}
      {...props}
    />
  );
}

/** 侧栏内的搜索框：透传 Input，只把尺寸与底色换成贴合侧栏的一套。 */
export function SidebarInput({ className, ...props }: SidebarInputProps) {
  return <Input size="sm" className={cn("bg-bg", className)} {...props} />;
}

export function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

export function SidebarGroupLabel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-[var(--radius)] px-2 text-xs font-medium text-muted-foreground",
        // 折叠成图标条后这行小标题没有可读宽度，留着只会变成一截被裁断的字。
        "group-data-[collapsible=icon]/sidebar:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroupAction({
  render,
  className,
  ...props
}: SidebarGroupActionProps) {
  const cls = cn(
    "absolute right-3 top-3 inline-grid size-5 cursor-pointer place-items-center rounded-sm text-muted-foreground outline-none transition-colors",
    "hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
    "group-data-[collapsible=icon]/sidebar:hidden",
    className,
  );
  const { children, ...rest } = props;
  if (render) return renderAsElement(render, rest, cls, undefined, children);
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

export function SidebarGroupContent({ className, ...props }: ComponentProps<"div">) {
  return <div data-sidebar="group-content" className={cn("w-full text-sm", className)} {...props} />;
}

export function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-sidebar="menu"
      // Tailwind preflight 把 list-style 清成 none，Safari/VoiceOver 会因此把 list 语义摘掉（同 NavMenu）。
      role="list"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

export const sidebarMenuButtonVariants = cva(
  [
    "group/menu-button peer/menu-button flex w-full min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-[var(--radius)] px-2 text-left text-sm outline-none transition-colors",
    "hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&>svg]:size-4 [&>svg]:shrink-0 [&>span:last-child]:min-w-0 [&>span:last-child]:flex-1 [&>span:last-child]:truncate",
    // icon 档：退化成正方形图标按钮，文字标签整块收走（所以标签必须包在 <span> 里）。
    "group-data-[collapsible=icon]/sidebar:size-8 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:px-0",
    "group-data-[collapsible=icon]/sidebar:[&>span:last-child]:hidden",
  ],
  {
    variants: {
      size: { sm: "h-7", md: "h-8", lg: "h-10" },
      isActive: {
        // 激活态用 primary-subtle 的弱底 + primary 文字，不借 muted 当背景
        // （muted 是弱**背景**、muted-foreground 才是次要文字，混用会让整行退成正文同色）。
        true: "bg-primary-subtle font-medium text-primary hover:bg-primary-subtle hover:text-primary",
        false: "text-muted-foreground",
      },
    },
    defaultVariants: { size: "md", isActive: false },
  },
);

export function SidebarMenuButton({
  isActive = false,
  size = "md",
  tooltip,
  tooltipSide = "right",
  render,
  className,
  children,
  ...props
}: SidebarMenuButtonProps) {
  const { state, isMobile } = useSidebar();
  const cls = cn(sidebarMenuButtonVariants({ size, isActive }), className);
  const merged = {
    ...props,
    "data-active": isActive || undefined,
    // aria-selected 在 button / link 上都不生效；导航当前项的正解是 aria-current。
    "aria-current": isActive ? ("page" as const) : undefined,
  };

  const trigger = render ? (
    renderAsElement(render, merged, cls, undefined, children)
  ) : (
    <button type="button" className={cls} {...merged}>
      {children}
    </button>
  );

  if (!shouldEnableSidebarTooltip(tooltip != null, state, isMobile)) return trigger;
  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

/**
 * 悬浮在菜单项右侧的次级动作（通常触发一个 Menu）。
 *
 * **它是 SidebarMenuButton 的兄弟节点，不是子节点** —— 整行可点的按钮里再嵌一个按钮是无效 HTML，
 * React 会在 hydration 期报错，读屏也读不出第二个可操作元素。放进同一个 `<SidebarMenuItem>` 里
 * 用绝对定位覆盖行右侧即可，两者各自是独立的可聚焦元素。
 */
export function SidebarMenuAction({
  showOnHover = false,
  render,
  className,
  children,
  ...props
}: SidebarMenuActionProps) {
  const cls = cn(
    "absolute right-1 top-1 z-10 inline-grid size-6 cursor-pointer place-items-center rounded-sm text-muted-foreground outline-none transition-colors",
    "hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
    "group-data-[collapsible=icon]/sidebar:hidden",
    showOnHover &&
      "opacity-0 focus-visible:opacity-100 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100",
    className,
  );
  if (render) return renderAsElement(render, props, cls, undefined, children);
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}

export function SidebarMenuBadge({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 top-1 inline-flex h-6 min-w-6 select-none items-center justify-center rounded-[var(--radius)] px-1 text-xs font-medium tabular-nums text-muted-foreground",
        "peer-data-[active=true]/menu-button:text-primary",
        "group-data-[collapsible=icon]/sidebar:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenuSkeleton({
  showIcon = true,
  // 刻意**不**用随机宽度：随机值在服务端与客户端各摇一次，必然 hydration mismatch。
  // 要参差不齐的观感就按 index 传一组确定值进来。
  width = "70%",
  className,
  ...props
}: SidebarMenuSkeletonProps) {
  return (
    <div
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-[var(--radius)] px-2", className)}
      {...props}
    >
      {showIcon && <Skeleton shape="rect" className="size-4 shrink-0" />}
      {/* 宽度落在外层 div 而不是 Skeleton：Skeleton 的 props 刻意 Omit 掉了 style（它自己要用内联
          背景渐变做微光），传进去编译不过。 */}
      <div
        data-sidebar="menu-skeleton-bar"
        className="min-w-0 group-data-[collapsible=icon]/sidebar:hidden"
        style={{ width }}
      >
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function SidebarMenuSub({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-sidebar="menu-sub"
      role="list"
      className={cn(
        "mx-3.5 flex min-w-0 flex-col gap-1 border-l border-border px-2 py-0.5",
        "group-data-[collapsible=icon]/sidebar:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenuSubItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

export function SidebarMenuSubButton({
  isActive = false,
  size = "md",
  render,
  className,
  children,
  ...props
}: SidebarMenuSubButtonProps) {
  const cls = cn(
    "flex w-full min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-[var(--radius)] px-2 text-left outline-none transition-colors",
    "hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&>svg]:size-4 [&>svg]:shrink-0 [&>span:last-child]:min-w-0 [&>span:last-child]:flex-1 [&>span:last-child]:truncate",
    size === "sm" ? "h-6 text-xs" : "h-7 text-sm",
    isActive ? "bg-primary-subtle font-medium text-primary" : "text-muted-foreground",
    className,
  );
  const merged = {
    ...props,
    "data-active": isActive || undefined,
    "aria-current": isActive ? ("page" as const) : undefined,
  };
  if (render) return renderAsElement(render, merged, cls, undefined, children);
  return (
    <button type="button" className={cls} {...merged}>
      {children}
    </button>
  );
}
