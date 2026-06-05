import type { Metadata } from "next";
import { AnimatedThemeToggler } from "@hulian/ui";
import { DocHeader, Section, Code, Note } from "../_components/doc-kit";

export const metadata: Metadata = { title: "暗色模式 Dark mode · 瑚琏 Hulian" };

// 一个迷你界面预览：放在 data-theme 作用域里即「就地」吃对应主题的语义 token
function MiniUI() {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-bg p-5">
      <div className="rounded-[var(--radius)] border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-foreground">卡片标题</p>
        <p className="mt-1 text-xs text-muted">次要描述文字走 color-muted。</p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-[var(--radius)] bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            主按钮
          </span>
          <span className="rounded-[var(--radius)] border border-border px-3 py-1.5 text-xs text-foreground">
            次按钮
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DarkModePage() {
  return (
    <div>
      <DocHeader
        title="暗色模式"
        en="Dark mode"
        lede={
          <>
            主题由根元素的 <Code>data-theme</Code> 属性决定。语义 token 在{" "}
            <Code>{`[data-theme="dark"]`}</Code> 作用域内换一组值即可整站切换——无需任何 dark: 类名遍历。
          </>
        }
      />

      <Section title="实时切换" desc="右上角同款切换器，View Transitions 圆形揭示明暗。">
        <div className="flex items-center gap-4 rounded-[var(--radius)] border border-border bg-surface px-5 py-4">
          <AnimatedThemeToggler />
          <span className="text-sm text-muted">点击切换整个文档站的主题</span>
        </div>
      </Section>

      <Section
        title="就地作用域"
        desc={
          <>
            因为暗色 token 绑在 <Code>{`[data-theme="dark"]`}</Code>，任意子树包一层该属性即可「局部」变暗——
            下方两张卡片永远分别展示亮/暗，不随页面主题变。
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-theme="light">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Light</p>
            <MiniUI />
          </div>
          <div data-theme="dark">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Dark</p>
            <MiniUI />
          </div>
        </div>
      </Section>

      <Section title="0 闪烁（anti-FOUC）">
        <Note>
          <p>
            首屏在 <Code>&lt;head&gt;</Code> 注入内联脚本，于 React 水合前就把
            <Code>data-theme</Code> 写到 <Code>&lt;html&gt;</Code>，读 localStorage 偏好或系统{" "}
            <Code>prefers-color-scheme</Code>。配合 semantic.css 同步的 <Code>color-scheme</Code>
            ，连原生滚动条 / overscroll 回弹区都不会闪出错误底色。
          </p>
        </Note>
      </Section>

      <Section title="代码切换" desc="任何地方都可命令式读写主题。">
        <pre className="overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          <span className="text-muted">{"// 读"}</span>
          {"\n"}document.documentElement.dataset.theme; <span className="text-muted">{'// "light" | "dark"'}</span>
          {"\n\n"}<span className="text-muted">{"// 写（持久化由 useTheme/Toggler 负责）"}</span>
          {"\n"}document.documentElement.dataset.theme = "dark";
        </pre>
      </Section>
    </div>
  );
}
