"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./resizable";

// 真实「代码编辑器」式三栏布局：文件树 / 编辑器 / 预览。
// 内容足够撑满每个面板，拖动手柄时能直观看到三栏宽度此消彼长、文本自动回流。

const fileTree = [
  "src/",
  "  app/",
  "    page.tsx",
  "    layout.tsx",
  "  components/",
  "    nav.tsx",
  "    card.tsx",
  "  lib/",
  "    utils.ts",
  "package.json",
  "tsconfig.json",
];

const codeLines = [
  "export function Card({ title, children }) {",
  "  return (",
  '    <section className="rounded-lg border p-4">',
  "      <h3 className=\"font-semibold\">{title}</h3>",
  '      <div className="mt-2 text-sm">{children}</div>',
  "    </section>",
  "  );",
  "}",
];

function FileTree() {
  return (
    <div className="h-full bg-surface p-3">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">资源管理器</div>
      <ul className="space-y-0.5 font-mono text-xs text-foreground">
        {fileTree.map((f, i) => (
          <li key={i} className={f.includes(".") ? "" : "text-muted-foreground"} style={{ whiteSpace: "pre" }}>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Editor() {
  return (
    <div className="h-full bg-bg p-3">
      <div className="mb-2 text-xs text-muted-foreground">components/card.tsx</div>
      <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground">
        {codeLines.map((l, i) => (
          <div key={i}>
            <span className="mr-3 select-none text-muted-foreground">{String(i + 1).padStart(2, " ")}</span>
            {l}
          </div>
        ))}
      </pre>
    </div>
  );
}

function Preview() {
  return (
    <div className="h-full space-y-3 bg-surface p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">实时预览</div>
      <section className="rounded-[var(--radius)] border border-border p-3">
        <h3 className="text-sm font-semibold text-foreground">月度概览</h3>
        <p className="mt-1 text-xs text-muted-foreground">本月新增订单 1,284 笔，环比增长 12%。</p>
      </section>
    </div>
  );
}

// 上下分栏：聊天会话列表 / 实时日志面板（演示 vertical 方向）。
function ChatLog() {
  return (
    <div className="h-full overflow-auto bg-surface p-3">
      <div className="mb-2 text-xs font-medium text-muted-foreground">会话</div>
      <ul className="space-y-1 text-sm text-foreground">
        <li>客户 · 王女士：发货了吗？</li>
        <li>客服 · 小琏：已安排今日发出 📦</li>
        <li>客户 · 王女士：好的，谢谢！</li>
      </ul>
    </div>
  );
}
function LogPanel() {
  return (
    <div className="h-full overflow-auto bg-bg p-3 font-mono text-xs leading-relaxed text-muted-foreground">
      <div>[12:01:08] INFO  会话已接入 agent#7</div>
      <div>[12:01:24] INFO  推送物流单号 SF1024…</div>
      <div className="text-foreground">[12:01:31] WARN  客户满意度问卷未填</div>
      <div>[12:01:40] INFO  会话标记为已解决</div>
    </div>
  );
}

export const resizableShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "横向两栏",
      description: "direction=horizontal，拖动竖直手柄此消彼长，min 约束最小宽度。",
      code: `<ResizablePanelGroup direction="horizontal" defaultSizes={[35, 65]}>
  <ResizablePanel min={20}><FileTree /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel><Editor /></ResizablePanel>
</ResizablePanelGroup>`,
      render: () => (
        <div className="h-48 w-80 max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <ResizablePanelGroup direction="horizontal" defaultSizes={[35, 65]}>
            <ResizablePanel min={20}>
              <FileTree />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <Editor />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ),
    },
    {
      title: "纵向上下分栏",
      description: "direction=vertical，手柄变水平，上下面板拖动调高。",
      code: `<ResizablePanelGroup direction="vertical" defaultSizes={[55, 45]}>
  <ResizablePanel min={20}><ChatLog /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel min={20}><LogPanel /></ResizablePanel>
</ResizablePanelGroup>`,
      render: () => (
        <div className="h-64 w-[34rem] max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <ResizablePanelGroup direction="vertical" defaultSizes={[55, 45]}>
            <ResizablePanel min={20}>
              <ChatLog />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={20}>
              <LogPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ),
    },
    {
      title: "三栏编辑器布局",
      description: "多面板 + 多手柄；defaultSizes 给初始比例，键盘 ←/→ 也可微调。",
      code: `<ResizablePanelGroup direction="horizontal" defaultSizes={[24, 46, 30]}>
  <ResizablePanel min={15}><FileTree /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel min={25}><Editor /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel min={18}><Preview /></ResizablePanel>
</ResizablePanelGroup>`,
      render: () => (
        <div className="h-64 w-[34rem] max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <ResizablePanelGroup direction="horizontal" defaultSizes={[24, 46, 30]}>
            <ResizablePanel min={15}>
              <FileTree />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={25}>
              <Editor />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={18}>
              <Preview />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "direction",
      type: "select",
      options: ["horizontal", "vertical"],
      defaultValue: "horizontal",
      label: "方向",
    },
  ],
  states: [
    {
      name: "编辑器三栏（拖动手柄调整：文件树 / 编辑器 / 预览）",
      render: () => (
        <div className="h-64 w-[34rem] max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <ResizablePanelGroup direction="horizontal" defaultSizes={[24, 46, 30]}>
            <ResizablePanel min={15}>
              <FileTree />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={25}>
              <Editor />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={18}>
              <Preview />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ),
    },
    {
      name: "上下分栏（vertical：会话 / 日志，拖动横向手柄）",
      render: () => (
        <div className="h-64 w-[34rem] max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <ResizablePanelGroup direction="vertical" defaultSizes={[55, 45]}>
            <ResizablePanel min={20}>
              <ChatLog />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel min={20}>
              <LogPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ),
    },
    {
      name: "两栏 + 最小宽约束（侧栏 min=20%，键盘 ←/→ 也可微调）",
      render: () => (
        <div className="h-48 w-80 max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <ResizablePanelGroup direction="horizontal" defaultSizes={[35, 65]}>
            <ResizablePanel min={20}>
              <FileTree />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <Editor />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => {
    const direction = (p.direction as "horizontal" | "vertical") ?? "horizontal";
    return (
      <div className="h-64 w-[34rem] max-w-full overflow-hidden rounded-[var(--radius)] border border-border">
        <ResizablePanelGroup direction={direction} defaultSizes={[40, 60]}>
          <ResizablePanel min={20}>
            {direction === "horizontal" ? <FileTree /> : <ChatLog />}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>{direction === "horizontal" ? <Editor /> : <LogPanel />}</ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  },
  toCode: (p) =>
    `<ResizablePanelGroup direction="${p.direction ?? "horizontal"}" defaultSizes={[40, 60]}>\n  <ResizablePanel min={20}><FileTree /></ResizablePanel>\n  <ResizableHandle />\n  <ResizablePanel><Editor /></ResizablePanel>\n</ResizablePanelGroup>`,
};
