import { cn } from "../lib/cn";
import type { SafariProps } from "./safari.types";

// 吸取自 magicui.design Safari（瑚琏风 CSS 框，非 verbatim 巨型 SVG）：浏览器窗口外壳包裹截图/children。
// 瑚琏化：纯 CSS（RSC 安全）；窗口 chrome 用 surface/border token 吃明暗；
// 三个红绿灯点用 macOS 固定色（设备拟物的真实世界约定，非主题色，刻意例外）。
export function Safari({
  url = "hulian.design",
  imageSrc,
  headerExtra,
  children,
  className,
  ...props
}: SafariProps) {
  return (
    <div
      {...props}
      // flex flex-col + 内容区 flex-1（#278）：壳此前只服务截图，内容有固有高度所以块级布局够用；
      // 但「活内容」（Electron 里用这个壳包原生 WebContentsView）要的是「壳撑满父容器、
      // 内容区吃掉顶栏之外的剩余高度」，而中间那层 div 消费方够不着，高度链在那里断掉。
      // 截图场景不受影响：实测 Chromium 下 auto 高度的列向 flex 容器仍按内容定高
      // （min-h-0 也不会让它塌成 0 —— 那是这个改法唯一值得担心的地方，已实测排除）。
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface shadow-lg",
        className,
      )}
    >
      {/* 顶栏：红绿灯 + 地址胶囊 */}
      <div className="flex items-center gap-2 border-b border-border bg-bg px-3 py-2">
        <div className="flex shrink-0 gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex max-w-[60%] flex-1 items-center justify-center truncate rounded-md bg-surface px-3 py-1 text-xs text-muted-foreground">
          {url}
        </div>
        {/* 顶栏右端：不传 headerExtra 时就是原来那块让地址胶囊居中的 w-12 占位（类名逐字节不变）。
            传了则改为 min-w-12：内容窄于占位时对称性完全保持，宽于占位时该格随内容生长
            —— 宁可让胶囊偏一点，也不裁掉按钮。 */}
        <div
          className={
            headerExtra == null
              ? "w-12 shrink-0"
              : "flex min-w-12 shrink-0 items-center justify-end gap-1"
          }
        >
          {headerExtra}
        </div>
      </div>
      {/* 内容区。min-h-0 flex-1 让活内容吃掉顶栏之外的剩余高度（截图场景高度仍由内容决定）。 */}
      <div className="min-h-0 flex-1 bg-bg">
        {imageSrc ? <img src={imageSrc} alt="" className="block w-full" /> : children}
      </div>
    </div>
  );
}
