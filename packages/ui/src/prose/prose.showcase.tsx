"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Prose } from "./prose";
import type { ProseSize } from "./prose.types";

const Article = () => (
  <Prose className="max-w-2xl">
    <h1>瑚琏排版容器 Prose</h1>
    <p>
      Prose 把渲染好的富文本（markdown→HTML、MDX 输出或手写 JSX）统一接管为一致的阅读排版，
      标题、段落、列表、<a href="#">链接</a>、<code>行内代码</code> 与引用全部吃语义 token，
      明暗主题自动适配。
    </p>
    <h2>无序列表</h2>
    <ul>
      <li>零依赖、可在 RSC 中渲染（本体不加 use client）</li>
      <li>
        强调用 <strong>加粗</strong> 与 <em>斜体</em>
      </li>
      <li>所有颜色与圆角走 token，不写死</li>
    </ul>
    <h2>代码块</h2>
    <pre>
      <code>{`import { Prose } from "@hulian/ui";\n\n<Prose>{htmlContent}</Prose>;`}</code>
    </pre>
    <blockquote>排版即沉默的设计——容器统一规则，内容只管语义。</blockquote>
    <hr />
    <p>底部段落，验证首尾子元素外边距收敛。</p>
  </Prose>
);

export const proseShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "size",
      type: "select",
      options: ["sm", "base"],
      defaultValue: "base",
      label: "尺寸",
    },
  ],
  states: [
    {
      name: "完整文章（标题/段落/列表/代码/引用/分隔线）",
      render: () => <Article />,
    },
    {
      name: "紧凑尺寸（size=sm）",
      render: () => (
        <Prose size="sm" className="max-w-2xl">
          <h2>紧凑排版</h2>
          <p>
            size=&quot;sm&quot; 把基准字号降到 text-sm，适合侧栏说明、卡片内长文等密集场景，
            其余排版规则保持一致。
          </p>
          <ul>
            <li>侧栏文档</li>
            <li>卡片内富文本</li>
          </ul>
        </Prose>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Prose size={p.size as ProseSize} className="max-w-2xl">
      <h2>瑚琏 Prose</h2>
      <p>
        统一接管富文本排版，吃语义 token，<a href="#">链接</a> 与 <code>code</code> 一致呈现。
      </p>
      <blockquote>容器统一规则，内容只管语义。</blockquote>
    </Prose>
  ),
  toCode: (p) =>
    `<Prose${p.size === "sm" ? ' size="sm"' : ""}>{/* 富文本 HTML/JSX */}</Prose>`,
};
