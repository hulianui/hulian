import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  isEditableEventTarget,
  shouldEnableSidebarTooltip,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "./sidebar";

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "matchMedia");
});

/** 把视口桩成移动端 / 桌面端。jsdom 本身没有 matchMedia，组件里的守卫默认走桌面形态。 */
function stubMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function Shell({
  collapsible = "icon",
  ...providerProps
}: { collapsible?: "offcanvas" | "icon" | "none" } & Record<string, unknown>) {
  return (
    <SidebarProvider fitViewport={false} {...providerProps}>
      <Sidebar collapsible={collapsible} aria-label="主导航">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>导航</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="工作台">
                    <span>工作台</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction aria-label="工作台的更多操作">…</SidebarMenuAction>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<a href="/projects" />}>
                    <span>项目</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>7</SidebarMenuBadge>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton isActive>
                        <span>组件库</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <input aria-label="标题" />
        <textarea aria-label="备注" />
        <div contentEditable aria-label="富文本" suppressContentEditableWarning>
          <strong data-testid="rich-child">加粗</strong>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

const aside = () => document.querySelector("aside")!;
const trigger = () => screen.getByRole("button", { name: "切换侧栏" });

describe("isEditableEventTarget", () => {
  it("原生表单控件算输入态", () => {
    for (const tag of ["input", "textarea", "select"]) {
      expect(isEditableEventTarget(document.createElement(tag))).toBe(true);
    }
  });
  it("普通元素不算", () => {
    expect(isEditableEventTarget(document.createElement("div"))).toBe(false);
    expect(isEditableEventTarget(document.createElement("button"))).toBe(false);
  });
  it("null / 非元素返回 false", () => {
    expect(isEditableEventTarget(null)).toBe(false);
    expect(isEditableEventTarget({} as EventTarget)).toBe(false);
  });
  it("contenteditable 元素本身算输入态", () => {
    const el = document.createElement("div");
    el.setAttribute("contenteditable", "");
    expect(isEditableEventTarget(el)).toBe(true);
  });
  it("contenteditable 的后代也算（富文本里 target 常是 <strong> 而不是编辑区）", () => {
    const host = document.createElement("div");
    host.setAttribute("contenteditable", "true");
    const child = document.createElement("strong");
    host.append(child);
    document.body.append(host);
    expect(isEditableEventTarget(child)).toBe(true);
    host.remove();
  });
  it("contenteditable=false 不算（显式关掉的只读区）", () => {
    const el = document.createElement("div");
    el.setAttribute("contenteditable", "false");
    expect(isEditableEventTarget(el)).toBe(false);
  });
});

describe("shouldEnableSidebarTooltip", () => {
  it("仅在「有 tooltip + 非移动端 + 已折叠」三条同时成立时启用", () => {
    expect(shouldEnableSidebarTooltip(true, "collapsed", false)).toBe(true);
    expect(shouldEnableSidebarTooltip(true, "expanded", false)).toBe(false);
    expect(shouldEnableSidebarTooltip(true, "collapsed", true)).toBe(false);
    expect(shouldEnableSidebarTooltip(false, "collapsed", false)).toBe(false);
  });
});

describe("useSidebar", () => {
  it("脱离 Provider 直接抛错，而不是静默返回假状态", () => {
    const Bad = () => {
      useSidebar();
      return null;
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(/SidebarProvider/);
    spy.mockRestore();
  });

  it("暴露 issue 约定的七个字段", () => {
    let seen: Record<string, unknown> = {};
    const Probe = () => {
      seen = useSidebar() as unknown as Record<string, unknown>;
      return null;
    };
    render(
      <SidebarProvider fitViewport={false}>
        <Probe />
      </SidebarProvider>,
    );
    expect(Object.keys(seen).sort()).toEqual(
      ["isMobile", "open", "openMobile", "setOpen", "setOpenMobile", "state", "toggleSidebar"].sort(),
    );
  });
});

describe("Sidebar 状态机", () => {
  it("默认展开；SidebarTrigger 点击后折叠", () => {
    render(<Shell />);
    expect(aside().getAttribute("data-state")).toBe("expanded");
    fireEvent.click(trigger());
    expect(aside().getAttribute("data-state")).toBe("collapsed");
  });

  it("defaultOpen={false} 首帧即折叠", () => {
    render(<Shell defaultOpen={false} />);
    expect(aside().getAttribute("data-state")).toBe("collapsed");
  });

  it("受控：不改内部态，只回调（父不更新则 DOM 不动）", () => {
    const onOpenChange = vi.fn();
    render(<Shell open onOpenChange={onOpenChange} />);
    fireEvent.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(aside().getAttribute("data-state")).toBe("expanded");
  });

  it("非受控也会触发 onOpenChange（消费方据此做持久化）", () => {
    const onOpenChange = vi.fn();
    render(<Shell onOpenChange={onOpenChange} />);
    fireEvent.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(aside().getAttribute("data-state")).toBe("collapsed");
  });

  it("三种折叠形态各自的 data-collapsible 与宽度", () => {
    const { unmount } = render(<Shell collapsible="icon" />);
    fireEvent.click(trigger());
    expect(aside().getAttribute("data-collapsible")).toBe("icon");
    expect(aside().style.width).toBe("var(--hl-sidebar-width-icon)");
    unmount();

    const offcanvas = render(<Shell collapsible="offcanvas" />);
    fireEvent.click(trigger());
    expect(aside().getAttribute("data-collapsible")).toBe("offcanvas");
    expect(aside().style.width).toBe("0px");
    offcanvas.unmount();

    render(<Shell collapsible="none" />);
    fireEvent.click(trigger());
    // none 档：状态机照常翻，但宽度不动（也不打 data-collapsible）。
    expect(aside().getAttribute("data-state")).toBe("collapsed");
    expect(aside().getAttribute("data-collapsible")).toBe("");
    expect(aside().style.width).toBe("var(--hl-sidebar-width)");
  });

  it("SidebarRail 也能开合，且无障碍名与 SidebarTrigger 不同字", () => {
    render(<Shell />);
    const rail = document.querySelector('aside button[tabindex="-1"]') as HTMLElement;
    expect(rail.getAttribute("aria-label")).toBe("拖到边缘切换侧栏");
    expect(rail.getAttribute("aria-label")).not.toBe(trigger().getAttribute("aria-label"));
    fireEvent.click(rail);
    expect(aside().getAttribute("data-state")).toBe("collapsed");
  });

  it("width / iconWidth 写进包裹层的 CSS 变量", () => {
    render(<Shell width="18rem" iconWidth="4rem" />);
    const wrapper = document.querySelector("[data-hulian-sidebar-wrapper]") as HTMLElement;
    expect(wrapper.style.getPropertyValue("--hl-sidebar-width")).toBe("18rem");
    expect(wrapper.style.getPropertyValue("--hl-sidebar-width-icon")).toBe("4rem");
  });

  it("SidebarTrigger 的 aria-controls 指向真实存在的 aside", () => {
    render(<Shell />);
    const id = trigger().getAttribute("aria-controls");
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).toBe(aside());
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
  });
});

describe("Cmd/Ctrl+B 快捷键", () => {
  const press = (init: KeyboardEventInit & { target?: Element } = {}) => {
    const { target, ...rest } = init;
    fireEvent.keyDown(target ?? window, { key: "b", metaKey: true, ...rest });
  };

  it("在页面上按 Cmd+B 切换侧栏", () => {
    render(<Shell />);
    press();
    expect(aside().getAttribute("data-state")).toBe("collapsed");
    press({ ctrlKey: true, metaKey: false });
    expect(aside().getAttribute("data-state")).toBe("expanded");
  });

  it("不带 Cmd/Ctrl 的裸 b 不触发", () => {
    render(<Shell />);
    fireEvent.keyDown(window, { key: "b" });
    expect(aside().getAttribute("data-state")).toBe("expanded");
  });

  it("input / textarea 内让路（否则「在任务标题里打 b 侧栏乱跳」）", () => {
    render(<Shell />);
    press({ target: screen.getByLabelText("标题") });
    expect(aside().getAttribute("data-state")).toBe("expanded");
    press({ target: screen.getByLabelText("备注") });
    expect(aside().getAttribute("data-state")).toBe("expanded");
  });

  it("contenteditable 及其后代内让路（Cmd+B 在富文本里是「加粗」）", () => {
    render(<Shell />);
    press({ target: screen.getByLabelText("富文本") });
    expect(aside().getAttribute("data-state")).toBe("expanded");
    press({ target: screen.getByTestId("rich-child") });
    expect(aside().getAttribute("data-state")).toBe("expanded");
  });

  it("event.defaultPrevented 时让路（别人已经处理过这次按键）", () => {
    render(<Shell />);
    // 必须在 document 的**捕获**阶段拦：组件监听在 window 冒泡阶段，
    // 直接往 window 再加一个冒泡监听只会排在组件后面，测不到 defaultPrevented 分支。
    const swallow = (event: Event) => event.preventDefault();
    document.addEventListener("keydown", swallow, true);
    fireEvent.keyDown(document.body, { key: "b", metaKey: true });
    document.removeEventListener("keydown", swallow, true);
    expect(aside().getAttribute("data-state")).toBe("expanded");
  });

  it("shortcutKey={false} 完全关掉；自定义按键生效", () => {
    const { unmount } = render(<Shell shortcutKey={false} />);
    press();
    expect(aside().getAttribute("data-state")).toBe("expanded");
    unmount();

    render(<Shell shortcutKey="k" />);
    press();
    expect(aside().getAttribute("data-state")).toBe("expanded");
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(aside().getAttribute("data-state")).toBe("collapsed");
  });

  it("卸载后不再监听（不泄漏到下一棵树）", () => {
    const { unmount } = render(<Shell />);
    unmount();
    expect(() => press()).not.toThrow();
    expect(document.querySelector("aside")).toBeNull();
  });
});

describe("结构合法性", () => {
  it("菜单项里没有 button 套 button / a 套 button", () => {
    const { container } = render(<Shell />);
    expect(container.querySelectorAll("button button").length).toBe(0);
    expect(container.querySelectorAll("a button").length).toBe(0);
    expect(container.querySelectorAll("button a").length).toBe(0);
  });

  it("SidebarMenuAction 是 SidebarMenuButton 的兄弟节点，两者都可聚焦", () => {
    render(<Shell />);
    const button = screen.getByRole("button", { name: "工作台" });
    const action = screen.getByRole("button", { name: "工作台的更多操作" });
    expect(action.parentElement).toBe(button.parentElement);
    expect(button.parentElement?.tagName.toLowerCase()).toBe("li");
  });

  it("render 注入把菜单项渲染成真链接（保住 link 语义与客户端路由）", () => {
    render(<Shell />);
    const link = screen.getByRole("link", { name: "项目" });
    expect(link.getAttribute("href")).toBe("/projects");
    expect(link.className).toContain("rounded-");
  });

  it("激活项用 aria-current=page 而不是 aria-selected（后者在 button/link 上无效）", () => {
    render(<Shell />);
    expect(screen.getByRole("button", { name: "工作台" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "组件库" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "项目" }).getAttribute("aria-current")).toBeNull();
  });

  it("菜单列表显式带 role=list（preflight 清了 list-style，Safari/VO 会摘掉语义）", () => {
    const { container } = render(<Shell />);
    for (const ul of container.querySelectorAll("ul")) {
      expect(ul.getAttribute("role")).toBe("list");
    }
  });

  it("折叠时不额外插入按钮（Tooltip 包裹不改可聚焦元素数量）", () => {
    const { container } = render(<Shell />);
    const before = container.querySelectorAll("aside button").length;
    fireEvent.click(trigger());
    expect(container.querySelectorAll("aside button").length).toBe(before);
  });
});

describe("SidebarMenuSkeleton", () => {
  it("宽度是确定值（随机宽度会让 SSR 与 hydration 对不上）", () => {
    const { container } = render(
      <SidebarProvider fitViewport={false}>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );
    const bar = container.querySelector('[data-sidebar="menu-skeleton-bar"]') as HTMLElement;
    expect(bar.style.width).toBe("70%");
  });

  it("showIcon={false} 去掉图标占位", () => {
    const { container } = render(
      <SidebarProvider fitViewport={false}>
        <Sidebar>
          <SidebarMenuSkeleton showIcon={false} width="50%" />
        </Sidebar>
      </SidebarProvider>,
    );
    const row = container.querySelector('[data-sidebar="menu-skeleton"]')!;
    expect(row.children.length).toBe(1);
  });
});

describe("移动端", () => {
  it("isMobile 时同一套 Sidebar 渲染成抽屉，桌面 aside 不再存在", () => {
    stubMatchMedia(true);
    render(<Shell />);
    expect(document.querySelector("aside")).toBeNull();
    expect(screen.getByRole("button", { name: "切换侧栏" })).toBeTruthy();
  });

  it("抽屉带无障碍标题与说明（视觉隐藏）", () => {
    stubMatchMedia(true);
    render(<Shell />);
    fireEvent.click(trigger());
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("侧边导航");
    const title = screen.getByText("侧边导航");
    expect(title.className).toContain("sr-only");
    expect(dialog.textContent).toContain("按 Esc 或点击遮罩关闭");
  });

  it("移动端切换的是抽屉开关，桌面展开态不动", () => {
    stubMatchMedia(true);
    let seen: { open: boolean; openMobile: boolean } | null = null;
    const Probe = () => {
      const { open, openMobile } = useSidebar();
      seen = { open, openMobile };
      return null;
    };
    render(
      <SidebarProvider fitViewport={false}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
        <SidebarInset>
          <SidebarTrigger />
          <Probe />
        </SidebarInset>
      </SidebarProvider>,
    );
    fireEvent.click(trigger());
    expect(seen).toEqual({ open: true, openMobile: true });
  });

  it("移动端 SidebarTrigger 不写 aria-controls（那个 aside 根本不在 DOM 里）", () => {
    stubMatchMedia(true);
    render(<Shell />);
    expect(trigger().getAttribute("aria-controls")).toBeNull();
  });
});

// ===== 栏底色逃生口 + inset 形态（#224）=====
//
// 消费方的迁移规约普遍禁止用 className 顶库组件的颜色（顶了色，升级时的视觉回归无从归因），
// 而侧栏底色写死 bg-surface 时，桥接层里 surface 与 bg 同为白的项目会得到「侧栏 / 页面底 /
// 内容浮岛三者同色、只剩 1px 边框分界」。改 --color-surface 又会牵动 Card / Popover / Menu。
describe("Sidebar 栏底色与 inset 形态（#224）", () => {
  const aside = () => document.querySelector("aside")!;

  it("默认底色走专用变量，且回落到 --color-surface（不传等于零改动）", () => {
    render(<Shell />);
    expect(aside().className).toContain("bg-[var(--hl-sidebar-surface,var(--color-surface))]");
  });

  it("className 仍然能顶掉底色（twMerge 后来者胜，逃生口不是牢笼）", () => {
    render(
      <SidebarProvider fitViewport={false}>
        <Sidebar className="bg-primary" aria-label="主导航">
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(aside().className).toContain("bg-primary");
    expect(aside().className).not.toContain("--hl-sidebar-surface");
  });

  it("inset：侧栏留 8px 外白 + 不画分界线，收成 offcanvas 时外白归零", () => {
    render(
      <SidebarProvider fitViewport={false} defaultOpen={false}>
        <Sidebar variant="inset" collapsible="offcanvas" aria-label="主导航">
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    const cls = aside().className;
    expect(cls).toContain("p-2");
    // 关键：offcanvas 收起时 aside 宽度是 0，border-box 下 padding 仍占位，
    // 不归零就会残留 16px 宽的「关不干净」的侧栏。
    expect(cls).toContain("data-[collapsible=offcanvas]:p-0");
    expect(cls).not.toContain("border-r");
  });

  it("inset 的浮岛样式挂在 SidebarInset 上，靠 peer 读前一个兄弟的形态", () => {
    render(
      <SidebarProvider fitViewport={false}>
        <Sidebar variant="inset" aria-label="主导航">
          <SidebarContent />
        </Sidebar>
        <SidebarInset />
      </SidebarProvider>,
    );
    expect(aside().className).toContain("peer/sidebar");
    expect(aside().getAttribute("data-variant")).toBe("inset");
    const main = document.querySelector("main")!.className;
    expect(main).toContain("peer-data-[variant=inset]/sidebar:m-2");
    expect(main).toContain("peer-data-[variant=inset]/sidebar:rounded-xl");
  });

  it("默认形态仍是 data-variant=sidebar，浮岛样式不命中", () => {
    render(<Shell />);
    expect(aside().getAttribute("data-variant")).toBe("sidebar");
    expect(aside().className).toContain("border-r");
  });

  it("外壳只在装着 inset 侧栏时才铺栏底色（浮岛四周露的是它）", () => {
    const { container } = render(<Shell />);
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "has-[aside[data-variant=inset]]:bg-",
    );
  });
});

// ===== 减弱动效（#225）=====
//
// 侧栏开合是整页级的容器变形，是 prefers-reduced-motion: reduce 下最该关掉的那一类
// （前庭敏感人群对大面积位移最敏感）。过渡写在内联 style 上，优先级高于任何普通 CSS 规则，
// 消费方要关只能 !important + 猜库内部 DOM 结构 —— 结构一变就静默失效，且失效表现是
// 「无障碍偏好不生效」，不会有任何报错。所以必须由组件自己响应。
describe("Sidebar 的 prefers-reduced-motion（#225）", () => {
  /** 只让指定媒体查询为真，其余为假（默认的 stubMatchMedia 对任何 query 都返回同一个值）。 */
  function stubMatchMediaFor(trueQuery: string) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: query.includes(trueQuery),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }

  it("默认（未开减弱）写入宽度过渡", () => {
    render(<Shell />);
    const style = document.querySelector("aside")!.style;
    expect(style.transitionProperty).toBe("width, min-width");
    expect(style.transitionDuration).not.toBe("");
  });

  it("开启减弱动效时整条 transition 都不写（而不是留一条 0s）", () => {
    stubMatchMediaFor("prefers-reduced-motion");
    render(<Shell />);
    const style = document.querySelector("aside")!.style;
    expect(style.transitionProperty).toBe("");
    expect(style.transitionDuration).toBe("");
    expect(style.transitionTimingFunction).toBe("");
    // 宽度本身照旧（关的是动效，不是功能）
    expect(style.width).toBe("var(--hl-sidebar-width)");
  });

  it("减弱动效时消费方自己的 style 仍然照常合并（逃生口不受影响）", () => {
    stubMatchMediaFor("prefers-reduced-motion");
    render(
      <SidebarProvider fitViewport={false}>
        <Sidebar style={{ transitionProperty: "width" }} aria-label="主导航">
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(document.querySelector("aside")!.style.transitionProperty).toBe("width");
  });
});
