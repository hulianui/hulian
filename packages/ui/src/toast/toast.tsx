"use client";
import { Toast } from "@base-ui/react/toast";
import { cn } from "../lib/cn";
import { overlayTransitions } from "../motion";
import type { ToastOptions, ToastPosition, ToastProviderProps, ToastTone } from "./toast.types";
import { useComponentLocale } from "../config/locale-context";

/** 挂在 Base UI `data` 上的瑚琏私有载荷（`type` 已被 tone 占用）。 */
interface ToastData {
  loading?: boolean;
}

// 模块级全局单例 manager：触发(toast())与渲染(<ToastProvider/>)解耦。框架无关、SSR 安全。
const hulianToastManager = Toast.createToastManager<ToastData>();

/** 命令式触发一条 toast。返回 toast id。页面任意处可调，只要挂了一个 <ToastProvider/>。 */
export function toast(options: ToastOptions): string {
  const { title, description, tone = "neutral", timeout, loading = false } = options;
  return hulianToastManager.add({
    title,
    description,
    type: tone, // 用 Base UI type 承载瑚琏 tone，列表里据此上皮肤
    // 错误 urgent 播报，其余 polite。loading 强制 polite：「进行中」是陪跑不是结果，
    // 让它 assertive 会在读屏正念别的内容时插队打断，而且这条还会长时间挂着（#227）。
    priority: tone === "danger" && !loading ? "high" : "low",
    // loading 只改 timeout 的**默认值**（5000 → 0），不另起一套常驻语义：
    // 显式 timeout 依然优先，`{ loading: true, timeout: 3000 }` 就是 3 秒自己走。
    ...(timeout !== undefined ? { timeout } : loading ? { timeout: 0 } : {}),
    ...(loading && { data: { loading: true } }),
  });
}

/**
 * 按 id 关掉一条 toast（不传 id = 关掉全部）。
 *
 * 「进行中 → 完成后关掉它 → 弹结果」这条链路缺的就是它：`toast()` 早就返回 id，
 * 但此前没有任何出口能消费这个 id（manager 是模块级私有单例），于是「正在上传…」
 * 只能等它自己超时，跟随后弹出的「上传成功」同屏并存（#227）。
 *
 * 关闭走的是正常出场过渡，不是硬拔 DOM。
 */
toast.close = (id?: string): void => {
  hulianToastManager.close(id);
};

// tone → 左边条 + 标题着色（与 Alert 语义 token 一致；neutral 用中性 border/foreground）。
const toneBorder: Record<ToastTone, string> = {
  neutral: "border-l-border",
  info: "border-l-info",
  success: "border-l-success",
  warning: "border-l-warning",
  danger: "border-l-danger",
};
const toneTitle: Record<ToastTone, string> = {
  neutral: "text-foreground",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

// 视口停靠位置（#227）。top-right 那一格与历史逐字一致
// （拼出来就是 `fixed right-4 top-4 z-[60] flex …`），故不传 position 的既有调用点渲染不变。
const viewportAnchor: Record<ToastPosition, string> = {
  "top-right": "right-4 top-4",
  "top-left": "left-4 top-4",
  "top-center": "left-1/2 top-4 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};

// 底部档的队列堆叠方向。Base UI 把最新一条放在 toasts 数组**头部**，
// flex-col 下它就离停靠边最远 —— 底部视口里新提示会被旧提示顶到半空，堆叠方向整个反过来。
// 这一段必须拼在基础类串的 flex-col **之后**：twMerge 同组取最后一个，写前面会被 flex-col 吃掉。
const viewportStack: Record<ToastPosition, string> = {
  "top-right": "",
  "top-left": "",
  "top-center": "",
  "bottom-right": "flex-col-reverse",
  "bottom-left": "flex-col-reverse",
  "bottom-center": "flex-col-reverse",
};

// 入场/出场位移方向随停靠边换手：贴右的从右边滑进来，贴左的从左边，
// 居中档没有「侧」可言，改走纵向（贴顶的从上、贴底的从下）。
// 方向搞反的话，toast 会先从屏幕内侧冒出来再退回停靠边，看着像弹错了地方。
const toastSlide: Record<ToastPosition, string> = {
  "top-right":
    "data-[starting-style]:translate-x-4 data-[starting-style]:opacity-0 data-[ending-style]:translate-x-4 data-[ending-style]:opacity-0",
  "bottom-right":
    "data-[starting-style]:translate-x-4 data-[starting-style]:opacity-0 data-[ending-style]:translate-x-4 data-[ending-style]:opacity-0",
  "top-left":
    "data-[starting-style]:-translate-x-4 data-[starting-style]:opacity-0 data-[ending-style]:-translate-x-4 data-[ending-style]:opacity-0",
  "bottom-left":
    "data-[starting-style]:-translate-x-4 data-[starting-style]:opacity-0 data-[ending-style]:-translate-x-4 data-[ending-style]:opacity-0",
  "top-center":
    "data-[starting-style]:-translate-y-4 data-[starting-style]:opacity-0 data-[ending-style]:-translate-y-4 data-[ending-style]:opacity-0",
  "bottom-center":
    "data-[starting-style]:translate-y-4 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-4 data-[ending-style]:opacity-0",
};

/**
 * loading 档的转圈图标（#227）。
 *
 * 刻意不复用 `<Spinner/>`：它带 `role="status"` + `aria-label`，而 toast 本身已经在
 * Base UI 的 aria-live 区里被播报过一遍 —— 活动区里再嵌一个活动区会让读屏重复播报，
 * 且播的是「加载中」这种与标题无关的话。这里只要一个纯视觉记号，故 aria-hidden。
 *
 * reduced-motion 下**减速而不停转**（库内装饰性动效统一走 `[animation:none]`，这里有意不同）：
 * 这个圈是「进行中」在视觉上唯一的记号，定格成一段静止圆弧就跟普通装饰图标没区别，
 * 状态信息当场消失。放慢到 2.4s 一圈既去掉了快速旋转，又保留了「它还在动」。
 */
function ToastSpinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground motion-reduce:[animation-duration:2.4s]"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ToastList({ position }: { position: ToastPosition }) {
  const { toasts } = Toast.useToastManager<ToastData>();
  const { close } = useComponentLocale().toast ?? { close: "关闭" };
  return toasts.map((t) => {
    const tone = (t.type as ToastTone) ?? "neutral";
    const isLoading = t.data?.loading === true;
    return (
      <Toast.Root
        key={t.id}
        toast={t}
        className={cn(
          "flex items-start gap-3 rounded-[var(--radius)] border border-l-2 border-hairline bg-surface p-4 shadow-lg",
          toneBorder[tone] ?? toneBorder.neutral,
          // 进出场：滑入 + 淡入，用 motion-token CSS 镜像驱动 Base UI data-* 过渡
          toastSlide[position] ?? toastSlide["top-right"],
        )}
        style={overlayTransitions.popup}
      >
        {isLoading && <ToastSpinner />}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Toast.Title
            className={cn("text-sm font-medium", toneTitle[tone] ?? toneTitle.neutral)}
          />
          <Toast.Description className="text-sm text-muted-foreground" />
        </div>
        <Toast.Close
          aria-label={close}
          className="shrink-0 rounded-[var(--radius)] p-0.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <svg
            viewBox="0 0 16 16"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </Toast.Close>
      </Toast.Root>
    );
  });
}

/**
 * 单挂一次（推荐应用根/段落 layout）。含 Viewport + 列表。
 * children 可选且透传渲染：`<ToastProvider><App/></ToastProvider>` 包裹式与
 * `<ToastProvider />` 自闭合并列兄弟两种写法均可（Provider 语义组件收 children 是生态普遍预期）。
 */
export function ToastProvider({ children, position = "top-right" }: ToastProviderProps) {
  return (
    <Toast.Provider toastManager={hulianToastManager}>
      {children}
      <Toast.Viewport
        className={cn(
          "fixed",
          viewportAnchor[position] ?? viewportAnchor["top-right"],
          "z-[60] flex w-[min(90vw,22rem)] flex-col gap-2 outline-none",
          viewportStack[position],
        )}
      >
        <ToastList position={position} />
      </Toast.Viewport>
    </Toast.Provider>
  );
}
