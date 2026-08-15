"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { X } from "../_icons";
import { useLocaleValue } from "../config/locale-context";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { DrawerContentProps, DrawerSide, DrawerSize } from "./drawer.types";

// 同 dialog.tsx：overlay 自管 mount/unmount，用 motion token CSS 镜像驱动原生过渡，零 motion 运行时。
// transition 简写(而非长写)：Base UI 过渡期会往内联 style 注入 transition 简写，与长写混用 →
// React "shorthand/longhand 混用" 警告并丢弃长写。
//
// 遮罩与面板刻意分开两套参数（原先共用一套 base/out）：
//  · 遮罩只是淡入淡出，跟随 overlay 通用档 base(200ms)/out 即可；
//  · 面板是整屏尺度的位移 —— 用 out(expo) + 200ms 会"冲到位再急停"，抽屉越大越明显。
//    换 drawer 曲线（iOS/Ionic）+ slow(300ms)：起步果断、尾段长距离减速，大面积滑动才有从容感。
const backdropTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

const panelTransition = {
  transition: `transform ${motionDurationCss.slow} ${motionEaseCss.drawer}, opacity ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

// 主轴尺寸档（#230）。抽屉的主轴随 side 换手：左右抽屉的主轴是宽，上下抽屉的主轴是高，
// 所以同一个档在两轴上不是同一个值 —— 视口本来就宽 > 高，「一屏够看」的宽高不等长。
// md 两列即历史上写死的 24rem / 20rem，故不传 size 的既有调用点渲染不变。
//
// 上限沿用既有的 min(90vw,…) / min(90vh,…) 写法而不是裸 rem：窄屏下 48rem 的抽屉会宽过视口，
// 而抽屉是贴边的，超出的那截直接落在屏幕外 —— 不是「挤一点」，是内容彻底够不着。
// full 档不设上限，它要的就是整屏。
const inlineSize: Record<DrawerSize, string> = {
  sm: "w-[min(90vw,20rem)]",
  md: "w-[min(90vw,24rem)]",
  lg: "w-[min(90vw,32rem)]",
  xl: "w-[min(90vw,48rem)]",
  full: "w-full",
};
const blockSize: Record<DrawerSize, string> = {
  sm: "h-[min(90vh,16rem)]",
  md: "h-[min(90vh,20rem)]",
  lg: "h-[min(90vh,32rem)]",
  xl: "h-[min(90vh,48rem)]",
  full: "h-full",
};

const DRAWER_SIZES = ["sm", "md", "lg", "xl", "full"] as const;

// 走 compoundVariants 而非把尺寸并进 side 的类串：尺寸要同时看 side 与 size 两个维度，
// 5×4 手写 20 行纯属抄写。这里给「size 等于默认值(md)」那一格也补了 class ——
// cva 的 compoundVariants 在 defaultVariants 之后匹配，分不出「显式传 md」与「压根没传」，
// 所以这样写会命中所有没传 size 的调用点。此处正是要的：md 那一格就是今天写死的值。
// side 数组刻意不加 `as const`：cva 的 ConfigVariantsMulti 收的是可变数组，readonly 元组进不去。
const sizeCompounds = DRAWER_SIZES.flatMap((size) => [
  { side: ["left", "right"] as DrawerSide[], size, class: inlineSize[size] },
  { side: ["top", "bottom"] as DrawerSide[], size, class: blockSize[size] },
]);

// side 决定贴边定位 + 交叉轴铺满 + 内边框 + 关闭态 translate（落在 starting/ending-style → 滑入/滑出）；
// 主轴尺寸由 size 档在 compoundVariants 里补。
export const drawerVariants = cva(
  [
    // 定位（fixed/absolute）由 DrawerContent 按 container 决定，故不写死在这里。
    // --hl-overlay-pad 与 p-6 必须同值：正文滚动区靠它做负边距补偿（见 DrawerContent 内注释）。
    // 消费方若用 className 覆盖内边距（如 p-0 做铺满型抽屉），必须一并覆盖这个变量，
    // 否则正文会向抽屉外溢出 —— 例：className="p-0 [--hl-overlay-pad:0px]"。
    "z-50 flex flex-col gap-1 bg-surface border-hairline p-6 [--hl-overlay-pad:1.5rem] text-foreground shadow-xl outline-none",
  ],
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full border-l data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
        left: "inset-y-0 left-0 h-full border-r data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
        top: "inset-x-0 top-0 w-full border-b data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full",
        bottom:
          "inset-x-0 bottom-0 w-full border-t data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
      },
      // 空串：这一维的实际 class 全在 compoundVariants 里（要和 side 一起看才知道压宽还是压高）。
      size: { sm: "", md: "", lg: "", xl: "", full: "" },
    },
    defaultVariants: { side: "right", size: "md" },
    compoundVariants: sizeCompounds,
  },
);

export function Drawer(props: ComponentProps<typeof BaseDialog.Root>) {
  return <BaseDialog.Root {...props} />;
}

export const DrawerTrigger = BaseDialog.Trigger;
export const DrawerClose = BaseDialog.Close;

export function DrawerContent({
  side = "right",
  size = "md",
  title,
  extra,
  description,
  children,
  footer,
  container,
  showClose = true,
  closeLabel,
  titleClassName,
  descriptionClassName,
  backdrop = true,
  backdropClassName,
  scrollable = true,
  bodyClassName,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: DrawerContentProps) {
  const loc = useLocaleValue("drawer", {
    close: "关闭",
  });
  // 沿用改动前 `{title && …}` 的真假口径：title="" / null / undefined 都不渲染标题元素。
  // 告警也挂在同一个判据上 —— 否则 title="" 会渲不出标题、又不触发告警，正好漏在中间。
  const hasTitle = Boolean(title);
  // 一个模态浮层必须有名字，而 Base UI 的 aria-labelledby 只来自 Dialog.Title，没有 Title 时
  // 它是 undefined 且不回落到任何东西 —— 三个槽都不给，读屏念出来的就是个无名对话框。
  // 这不是类型能拦住的（title 本来就可选），只能在开发期喊一声（#272）。
  if (!hasTitle && ariaLabel == null && ariaLabelledBy == null) {
    warnOnce(
      "drawer/no-accessible-name",
      "[hulian] DrawerContent 既没有 title 也没有 aria-label / aria-labelledby，读屏用户拿到的是一个没有名字的对话框。可见 header 由你自己画时（铺满型抽屉），传 aria-label 即可。",
    );
  }
  // 提供 container（如手机框 ref）→ 抽屉就地 portal 进该元素并改用 absolute 定位，
  // 贴该容器的边而非视口（容器须 position:relative + overflow-hidden）。否则默认 fixed 贴视口。
  const contained = container != null;
  const place = contained ? "absolute" : "fixed";
  return (
    <BaseDialog.Portal container={container}>
      {/* 遮罩可关（#185）：进度/通知这类自动弹出的抽屉要「陪跑」而不是「打断」。
          关掉它 + Root 传 modal={false} 才是真正的非模态 —— 只关一边都不成立：
          Backdrop 那层 inset-0 即使透明也照样吃掉整屏点击。 */}
      {backdrop && (
        <BaseDialog.Backdrop
          className={cn(
            place,
            "inset-0 z-40 bg-black/40 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            backdropClassName,
          )}
          style={backdropTransition}
        />
      )}
      <BaseDialog.Popup
        className={cn("relative", place, drawerVariants({ side, size }), className)}
        style={panelTransition}
        // 消费方给的 aria-* 最后落，压过 Base UI 由 Dialog.Title 派生的那份（#272）。
        // **必须条件展开，不能写 aria-labelledby={ariaLabelledBy}**：Base UI 的 mergeProps 用
        // `for...in` 遍历外部 props，键存在即覆盖，不看值是不是 undefined
        // （merge-props/mergeProps.js 的 mutablyMergeInto）。写成常规属性的话，每个只传了 title
        // 的抽屉都会被一个 undefined 抹掉 titleElementId —— 全库抽屉当场集体失去无障碍名。
        {...(ariaLabel != null && { "aria-label": ariaLabel })}
        {...(ariaLabelledBy != null && { "aria-labelledby": ariaLabelledBy })}
      >
        {/* 关闭按钮（hulianui/hulian#63）：纯展示型抽屉（导航菜单/详情面板，没有 footer 的那种）
            此前唯一的可见退路只有点遮罩，键盘用户只剩 Esc，读屏用户面板里根本没有「关闭」可达元素。
            绝对定位不占布局，故对既有的 title/正文/footer 结构零影响；标题侧留出 pr-10 免得被压。 */}
        {showClose && (
          <BaseDialog.Close
            aria-label={closeLabel ?? loc.close}
            className="absolute right-3 top-3 z-10 grid size-8 shrink-0 cursor-pointer place-items-center rounded-[var(--radius)] text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden />
          </BaseDialog.Close>
        )}
        {/* extra 缺席时保持原样：标题直接是 Popup 的 flex 子项，不多包一层 —— 这条列上的
            gap-1 是按「标题 / 说明 / 正文」三个直接子项调的，凭空多一个 div 会改动既有间距。 */}
        {extra == null ? (
          hasTitle && (
            <BaseDialog.Title
              className={cn("text-lg font-semibold", showClose && "pr-10", titleClassName)}
            >
              {title}
            </BaseDialog.Title>
          )
        ) : (
          // 标题行（#272）：标题左、操作右。`<h2>` 只收 phrasing content，按钮组塞进去既是
          // 非法嵌套，也会被 aria-labelledby 一并念进对话框的名字里（「通知 2 条未读 全部已读」），
          // 所以 extra 是标题的**兄弟**而不是子节点。
          // showClose 时整行让出右上角那 40px，让 extra 不被绝对定位的关闭按钮压住。
          <div
            className={cn(
              "flex items-center gap-2",
              hasTitle ? "justify-between" : "justify-end",
              showClose && "pr-10",
            )}
          >
            {hasTitle && (
              <BaseDialog.Title className={cn("min-w-0 text-lg font-semibold", titleClassName)}>
                {title}
              </BaseDialog.Title>
            )}
            <div className="flex shrink-0 items-center gap-2">{extra}</div>
          </div>
        )}
        {description && (
          // 同 dialog.tsx：传 "sr-only" 即「只给读屏的说明」（#179 评论）。
          <BaseDialog.Description
            className={cn("text-sm text-muted-foreground", descriptionClassName)}
          >
            {description}
          </BaseDialog.Description>
        )}
        {/* 正文独立滚动，长内容不挤压 footer，footer 始终钉底可见。
            横向负边距 + 等量内边距同 dialog.tsx：overflow-y-auto 会连带把 overflow-x 从 visible
            变成裁剪，而滚动容器宽度就等于内容宽度，w-full 的表单控件与它左右边界零余量，
            focus 环（ring-2 + ring-offset-2 向外 4px）的两条竖边正好落在 padding box 外被切掉。
            负边距铺满 Popup 宽度、等量内边距把内容推回原位，给焦点环腾出画的地方；
            净宽度变化为零，top/bottom 这类矮变体也不会因此冒出横向滚动条。
            走 --hl-overlay-pad 变量而非写死 -mx-6：抽屉的内边距可被 className 覆盖
            （仓库内就有 `className="w-72 p-0"` 的铺满型用法），写死会让正文溢出到抽屉外。

            纵向同样要给焦点环留位（`mt-1 pt-1` 与 `-mb-1 pb-1`，视觉间距净变化为零）：
            表单最后一个控件的下边界与滚动容器完全贴合，它的环往下那 4px 一样会被切掉。
            但纵向**只留 4px 而不是跟横向一样借 24px**：上下方紧挨着标题和 footer，
            借多了滚动内容会从标题底下穿出来一大截；4px 恰好够环画，穿透幅度肉眼不可见。 */}
        <div
          className={cn(
            "mx-[calc(var(--hl-overlay-pad,1.5rem)*-1)] -mb-1 mt-1 min-h-0 flex-1 px-[var(--hl-overlay-pad,1.5rem)] pb-1 pt-1",
            // 同 dialog.tsx：scrollable=false 时正文改成列向 flex 容器，把确定高度传给 children（#188）。
            scrollable ? "overflow-y-auto" : "flex flex-col",
            bodyClassName,
          )}
        >
          {children}
        </div>
        {footer != null && (
          <div className="mt-4 flex shrink-0 items-center justify-end gap-2 border-t border-border pt-4">
            {footer}
          </div>
        )}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
