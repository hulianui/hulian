"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ChevronDown } from "../_icons";
import { Button } from "./button";

export const buttonShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认实心按钮，另有浅底、描边、幽灵、文字链接共 5 种变体。",
      code: `<Button>默认</Button>
<Button variant="soft">浅底</Button>
<Button variant="outline">描边</Button>
<Button variant="ghost">幽灵</Button>
<Button variant="link">文字链接</Button>`,
      render: () => (
        <>
          <Button>默认</Button>
          <Button variant="soft">浅底</Button>
          <Button variant="outline">描边</Button>
          <Button variant="ghost">幽灵</Button>
          <Button variant="link">文字链接</Button>
        </>
      ),
    },
    {
      title: "尺寸",
      description: "xs / sm / md / lg 四档高度：24 / 32 / 40 / 48px。",
      code: `<Button size="xs">超小</Button>
<Button size="sm">小</Button>
<Button size="md">中</Button>
<Button size="lg">大</Button>`,
      render: () => (
        <>
          <Button size="xs">超小</Button>
          <Button size="sm">小</Button>
          <Button size="md">中</Button>
          <Button size="lg">大</Button>
        </>
      ),
    },
    {
      title: "密集工具栏（24px 的 xs 档）",
      description:
        "中后台工具栏与表格行内的主流形态是 24px 高、12px 字，sm(32px) 对它们是大一档。xs 的圆角与图文间距一并收紧，不必再写覆盖类。同排的纯图标微操作用 iconXs（20px），两者刻意不等高。",
      code: `<Button size="xs" variant="outline">录制</Button>
<Button size="xs" variant="outline">回放</Button>
<Button size="xs" variant="soft">已筛选</Button>
<Button size="iconXs" variant="ghost" tone="neutral" aria-label="更多">
  <ChevronDown className="size-4" />
</Button>`,
      render: () => (
        <div className="flex items-center gap-1 rounded-md border border-hairline bg-surface p-1">
          <Button size="xs" variant="outline">
            录制
          </Button>
          <Button size="xs" variant="outline">
            回放
          </Button>
          <Button size="xs" variant="soft">
            已筛选
          </Button>
          <Button size="iconXs" variant="ghost" tone="neutral" aria-label="更多">
            <ChevronDown className="size-4" />
          </Button>
        </div>
      ),
    },
    {
      title: "图标档与文字档等高",
      description:
        "iconSm/icon/iconLg 的边长依次等于 sm/md/lg 的高度（32/40/48）。混排取同名的一对才不会露台阶。",
      code: `<Button size="sm">小</Button>
<Button size="iconSm" aria-label="更多"><ChevronDown className="size-4" /></Button>
<Button size="md">中</Button>
<Button size="icon" aria-label="更多"><ChevronDown className="size-4" /></Button>
<Button size="lg">大</Button>
<Button size="iconLg" aria-label="更多"><ChevronDown className="size-5" /></Button>`,
      render: () => (
        <>
          <Button size="sm">小</Button>
          <Button size="iconSm" aria-label="更多">
            <ChevronDown className="size-4" />
          </Button>
          <Button size="md">中</Button>
          <Button size="icon" aria-label="更多">
            <ChevronDown className="size-4" />
          </Button>
          <Button size="lg">大</Button>
          <Button size="iconLg" aria-label="更多">
            <ChevronDown className="size-5" />
          </Button>
        </>
      ),
    },
    {
      title: "密集表格里的 20px 微型档",
      description:
        "iconXs 是 20px 方形，专给表格行内的展开箭头 / 小动作用——最小的 iconSm(32px) 会把 compact 行高撑起来。它刻意不与任何文字档等高，别拿它跟 sm 混排。",
      code: `<Button variant="ghost" tone="neutral" size="iconXs" aria-label="展开">
  <ChevronDown className="size-4" />
</Button>`,
      render: () => (
        <>
          <Button variant="ghost" tone="neutral" size="iconXs" aria-label="展开">
            <ChevronDown className="size-4" />
          </Button>
          <Button variant="outline" size="iconXs" aria-label="展开">
            <ChevronDown className="size-4" />
          </Button>
          <Button size="iconSm" aria-label="对照：iconSm 32px">
            <ChevronDown className="size-4" />
          </Button>
        </>
      ),
    },
    {
      title: "语义档",
      description:
        "tone 表达「这是什么性质的操作」，与 variant（形态）正交。neutral 的实心是反色，不是灰底。",
      code: `<Button>提交</Button>
<Button tone="success">通过</Button>
<Button tone="warning">驳回</Button>
<Button tone="danger">删除</Button>
<Button tone="neutral">跳过</Button>`,
      render: () => (
        <>
          <Button>提交</Button>
          <Button tone="success">通过</Button>
          <Button tone="warning">驳回</Button>
          <Button tone="danger">删除</Button>
          <Button tone="neutral">跳过</Button>
        </>
      ),
    },
    {
      title: "语义档 × 形态",
      description: "同一个 tone 换 variant 即得浅底 / 描边 / 幽灵形态，不必为此另开枚举值。",
      code: `<Button tone="success" variant="outline">通过</Button>
<Button tone="warning" variant="outline">驳回</Button>
<Button tone="danger" variant="outline">删除</Button>
<Button tone="success" variant="ghost">通过</Button>
<Button tone="danger" variant="link">删除</Button>`,
      render: () => (
        <>
          <Button tone="success" variant="outline">
            通过
          </Button>
          <Button tone="warning" variant="outline">
            驳回
          </Button>
          <Button tone="danger" variant="outline">
            删除
          </Button>
          <Button tone="success" variant="ghost">
            通过
          </Button>
          <Button tone="danger" variant="link">
            删除
          </Button>
        </>
      ),
    },
    {
      title: "浅色语义底（soft）",
      description:
        "浅语义底 + 同色文字，权重介于 outline 与 solid 之间：次主操作、成对出现的取消键、以及「这个筛选开着」这类状态化触发器。底色由语义色本身按透明度派生，改主色时跟着走。",
      code: `<Button variant="soft">次主操作</Button>
<Button variant="soft" tone="success">通过</Button>
<Button variant="soft" tone="warning">驳回</Button>
<Button variant="soft" tone="danger">取消</Button>
<Button variant="soft" tone="neutral">跳过</Button>`,
      render: () => (
        <>
          <Button variant="soft">次主操作</Button>
          <Button variant="soft" tone="success">
            通过
          </Button>
          <Button variant="soft" tone="warning">
            驳回
          </Button>
          <Button variant="soft" tone="danger">
            取消
          </Button>
          <Button variant="soft" tone="neutral">
            跳过
          </Button>
        </>
      ),
    },
    {
      title: "块级铺满",
      description: "block 让按钮撑满容器宽度，用于移动端主操作与表单底部提交。",
      code: `<Button block>登录</Button>
<Button block variant="outline">使用其它方式</Button>`,
      render: () => (
        <div className="w-full max-w-xs space-y-2">
          <Button block>登录</Button>
          <Button block variant="outline">
            使用其它方式
          </Button>
        </div>
      ),
    },
    {
      title: "加载与禁用",
      description: "loading 自动进入禁用并显示 spinner。",
      code: `<Button loading>加载中</Button>
<Button disabled>禁用</Button>`,
      render: () => (
        <>
          <Button loading>加载中</Button>
          <Button disabled>禁用</Button>
        </>
      ),
    },
  ],
  controls: [
    {
      prop: "variant",
      type: "select",
      options: ["solid", "soft", "outline", "ghost", "link"],
      defaultValue: "solid",
    },
    {
      prop: "tone",
      type: "select",
      options: ["brand", "success", "warning", "danger", "neutral"],
      defaultValue: "brand",
    },
    {
      prop: "size",
      type: "select",
      options: ["xs", "sm", "md", "lg", "icon", "iconSm", "iconLg", "iconXs"],
      defaultValue: "md",
    },
    { prop: "block", type: "boolean", defaultValue: false, label: "块级铺满" },
    { prop: "loading", type: "boolean", defaultValue: false },
    { prop: "children", type: "text", defaultValue: "瑚琏按钮", label: "文案" },
  ],
  states: [
    { name: "default", render: () => <Button>默认</Button> },
    { name: "xs", render: () => <Button size="xs">密集档</Button> },
    { name: "soft", render: () => <Button variant="soft">浅底</Button> },
    {
      name: "soft-danger",
      render: () => (
        <Button variant="soft" tone="danger">
          取消
        </Button>
      ),
    },
    { name: "outline", render: () => <Button variant="outline">描边</Button> },
    { name: "ghost", render: () => <Button variant="ghost">幽灵</Button> },
    { name: "link", render: () => <Button variant="link">文字链接</Button> },
    { name: "success", render: () => <Button tone="success">通过</Button> },
    { name: "warning", render: () => <Button tone="warning">驳回</Button> },
    { name: "danger", render: () => <Button tone="danger">危险</Button> },
    { name: "neutral", render: () => <Button tone="neutral">跳过</Button> },
    { name: "disabled", render: () => <Button disabled>禁用</Button> },
    { name: "loading", render: () => <Button loading>加载中</Button> },
  ],
  renderWithProps: (p) => (
    <Button
      variant={p.variant as "solid" | "soft" | "outline" | "ghost" | "link"}
      tone={p.tone as "brand" | "success" | "warning" | "danger" | "neutral"}
      size={p.size as "xs" | "sm" | "md" | "lg" | "icon" | "iconSm" | "iconLg" | "iconXs"}
      block={p.block as boolean}
      loading={p.loading as boolean}
    >
      {p.children as string}
    </Button>
  ),
  toCode: (p) =>
    `<Button variant="${p.variant}" tone="${p.tone}" size="${p.size}"${p.block ? " block" : ""}${p.loading ? " loading" : ""}>${p.children}</Button>`,
};
