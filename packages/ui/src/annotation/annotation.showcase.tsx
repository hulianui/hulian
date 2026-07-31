import type { ShowcaseSpec } from "../showcase/types";
import { Annotation } from "./annotation";
import type { AnnotationSide, AnnotationTone } from "./annotation.types";

const SIDES: AnnotationSide[] = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];

export const annotationShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "包住一段行内内容，note 就是那句手写旁注。side 说的是**标签在哪**（同 Tooltip/Popover），箭头自动从标签指回目标。标注绝对定位、不占布局位置，所以要给容器留出四周空间。",
      code: `<p>
  任务 ID 写成 <Annotation note="稳定 ID" side="ne">CLI-042</Annotation>，
  改标题也不会失联。
</p>`,
      render: () => (
        <div className="px-10 py-14 text-[0.95rem]">
          任务 ID 写成{" "}
          <Annotation note="稳定 ID" side="ne">
            CLI-042
          </Annotation>
          ，改标题也不会失联。
        </div>
      ),
    },
    {
      title: "解剖一行代码",
      description:
        "标注最典型的用法：把一行东西拆开逐块讲。同一行里挂多条标注时靠 side 错开方位，必要时再用 offset 微调。末尾三条彼此紧挨，用 --hl-ann-spread 收窄荧光笔的外扩量，免得底色连成一整片分不出边界。",
      code: `<code>
  - [ ] <Annotation note="稳定 ID" side="n" tone="primary">CLI-042</Annotation>{" "}
  Add export command{" "}
  <Annotation note="标签" side="n" tone="success" className="[--hl-ann-spread:0.1em]">#cli</Annotation>{" "}
  <Annotation note="优先级" side="s" tone="danger" className="[--hl-ann-spread:0.1em]">!high</Annotation>{" "}
  <Annotation note="自定义字段" side="se" tone="warning" className="[--hl-ann-spread:0.1em]">
    @blocked_by:CLI-041
  </Annotation>
</code>`,
      render: () => (
        <div className="px-10 py-20">
          <code className="font-mono text-[0.9rem] whitespace-nowrap">
            - [ ]{" "}
            <Annotation note="稳定 ID" side="n" tone="primary">
              CLI-042
            </Annotation>{" "}
            Add export command{" "}
            <Annotation note="标签" side="n" tone="success" className="[--hl-ann-spread:0.1em]">
              #cli
            </Annotation>{" "}
            <Annotation note="优先级" side="s" tone="danger" className="[--hl-ann-spread:0.1em]">
              !high
            </Annotation>{" "}
            <Annotation
              note="自定义字段"
              side="se"
              tone="warning"
              className="[--hl-ann-spread:0.1em]"
            >
              @blocked_by:CLI-041
            </Annotation>
          </code>
        </div>
      ),
    },
    {
      title: "八个方位",
      description:
        "side 是标签所在的方位。四个正方位在对应边居中，四个对角方位锚在目标角上、朝外侧对齐 —— 标签变长时只会向远离目标的方向生长。",
      code: `{["n", "ne", "e", "se", "s", "sw", "w", "nw"].map((side) => (
  <Annotation key={side} note={side} side={side}>目标</Annotation>
))}`,
      // 标签是绝对定位的，横向方位（e/w/对角）会伸出去很远 —— 格子间距必须留够，
      // 否则相邻两条标注会互相压。这也是消费方最容易踩的一点。
      render: () => (
        <div className="grid grid-cols-4 gap-x-32 gap-y-24 px-20 py-20 text-[0.9rem]">
          {SIDES.map((side) => (
            <span key={side} className="text-center">
              <Annotation note={side} side={side} labelWidth={60}>
                目标
              </Annotation>
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "语气色",
      description:
        "tone 只染标注自己（荧光笔底色由它派生），被标注的正文保持原色不变。rainbow 是循环色相，纯装饰用；降低动效偏好下它会停在起始色。",
      code: `<Annotation note="中性" tone="neutral">默认</Annotation>
<Annotation note="主色" tone="primary">强调</Annotation>
<Annotation note="正解" tone="success">通过</Annotation>
<Annotation note="注意" tone="warning">警告</Annotation>
<Annotation note="坑" tone="danger">危险</Annotation>
<Annotation note="彩虹" tone="rainbow">装饰</Annotation>`,
      render: () => (
        <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-20 px-10 py-16 text-[0.95rem]">
          <Annotation note="中性" tone="neutral">
            默认
          </Annotation>
          <Annotation note="主色" tone="primary">
            强调
          </Annotation>
          <Annotation note="正解" tone="success">
            通过
          </Annotation>
          <Annotation note="注意" tone="warning">
            警告
          </Annotation>
          <Annotation note="坑" tone="danger">
            危险
          </Annotation>
          <Annotation note="彩虹" tone="rainbow">
            装饰
          </Annotation>
        </div>
      ),
    },
    {
      title: "只圈不注",
      description: "不传 note 就只留荧光笔底色，不画箭头也不画标签 —— 用来单纯圈出一段内容。反过来 mark={false} 则保留标注、去掉底色。",
      code: `<p>
  真正要紧的是 <Annotation tone="warning">这一句</Annotation>，
  其余是<Annotation note="可以跳过" side="s" mark={false}>背景交代</Annotation>。
</p>`,
      render: () => (
        <div className="px-10 py-16 text-[0.95rem]">
          真正要紧的是 <Annotation tone="warning">这一句</Annotation>，其余是{" "}
          <Annotation note="可以跳过" side="s" mark={false}>
            背景交代
          </Annotation>
          。
        </div>
      ),
    },
    {
      title: "标签放 ReactNode",
      description:
        "note 是真实 DOM 节点而不是 CSS 伪元素的 content，所以能放任意 ReactNode —— 内嵌代码、链接、强调都行，读屏也读得到。",
      code: `<Annotation
  note={<>见 <code>docs/specs</code></>}
  side="e"
  tone="primary"
>
  spec 文件
</Annotation>`,
      render: () => (
        <div className="px-10 py-14 text-[0.95rem]">
          <Annotation
            note={
              <>
                见 <code className="font-mono">docs/specs</code>
              </>
            }
            side="e"
            tone="primary"
            labelWidth={130}
          >
            spec 文件
          </Annotation>
        </div>
      ),
    },
    {
      title: "手写字体与摆正",
      description:
        "手写字体栈里的中文字体（手札体 / 翩翩体 / 行楷）是系统字体，装了才有；没装则回落到正文字体，倾斜角与配色仍在。要在正式文档里更克制，可以 handwritten={false} 配 rotate={0}。",
      code: `<Annotation note="手写 · 默认倾斜" side="n">默认</Annotation>
<Annotation note="正文字体 · 摆正" side="n" handwritten={false} rotate={0}>克制</Annotation>`,
      render: () => (
        <div className="flex items-center justify-center gap-x-24 px-10 py-16 text-[0.95rem]">
          <Annotation note="手写 · 默认倾斜" side="n" labelWidth={120}>
            默认
          </Annotation>
          <Annotation note="正文字体 · 摆正" side="n" handwritten={false} rotate={0} labelWidth={120}>
            克制
          </Annotation>
        </div>
      ),
    },
  ],
  controls: [
    { prop: "note", type: "text", defaultValue: "稳定 ID", label: "标签" },
    {
      prop: "side",
      type: "select",
      options: SIDES,
      defaultValue: "ne",
      label: "方位",
    },
    {
      prop: "tone",
      type: "select",
      options: ["neutral", "primary", "success", "warning", "danger", "rainbow"],
      defaultValue: "neutral",
      label: "语气",
    },
    { prop: "mark", type: "boolean", defaultValue: true, label: "荧光笔底色" },
    { prop: "handwritten", type: "boolean", defaultValue: true, label: "手写字体" },
  ],
  states: [
    {
      name: "默认（右上）",
      render: () => (
        <div className="px-8 py-12">
          <Annotation note="稳定 ID">CLI-042</Annotation>
        </div>
      ),
    },
    {
      name: "正下方",
      render: () => (
        <div className="px-8 py-12">
          <Annotation note="优先级" side="s" tone="danger">
            !high
          </Annotation>
        </div>
      ),
    },
    {
      name: "正右方",
      render: () => (
        <div className="px-8 py-10">
          <Annotation note="自定义字段" side="e" tone="warning">
            @blocked_by
          </Annotation>
        </div>
      ),
    },
    {
      name: "只圈不注",
      render: () => (
        <div className="px-8 py-8">
          <Annotation tone="primary">这一段</Annotation>
        </div>
      ),
    },
    {
      name: "彩虹",
      render: () => (
        <div className="px-8 py-12">
          <Annotation note="装饰用" tone="rainbow">
            rainbow
          </Annotation>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="px-10 py-16 text-[0.95rem]">
      <Annotation
        note={String(p.note)}
        side={p.side as AnnotationSide}
        tone={p.tone as AnnotationTone}
        mark={Boolean(p.mark)}
        handwritten={Boolean(p.handwritten)}
      >
        CLI-042
      </Annotation>
    </div>
  ),
  toCode: (p) =>
    `<Annotation note="${p.note}" side="${p.side}" tone="${p.tone}"${p.mark ? "" : " mark={false}"}${p.handwritten ? "" : " handwritten={false}"}>CLI-042</Annotation>`,
};
