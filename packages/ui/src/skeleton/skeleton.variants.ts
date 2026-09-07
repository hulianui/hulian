import { cva } from "class-variance-authority";

// 骨架块的皮肤单独成模块（#349）：底色与圆角是纯数据，没有 React、没有 motion，
// 因此可以被**不想背 motion 运行时**的消费点引用 —— Table 的加载骨架行就是这么一处
// （从 skeleton.tsx 引任何东西都会把 motion 整个拉进 table 入口，实测 +29.6KB gzip，
// 直接顶穿 scripts/size-limits.json 里 table 的 101KB 上限）。
// skeleton.tsx 再从这里 re-export，对外导出面一个字不变。
export const skeletonVariants = cva("bg-surface-hover", {
  variants: {
    shape: {
      text: "h-4 w-full rounded",
      circle: "rounded-full",
      rect: "rounded-[var(--radius)]",
    },
  },
  defaultVariants: { shape: "text" },
});
