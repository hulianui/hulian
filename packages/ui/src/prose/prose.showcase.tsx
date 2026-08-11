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
      <code>{`import { Prose } from "@hulianui/ui";\n\n<Prose>{htmlContent}</Prose>;`}</code>
    </pre>
    <blockquote>排版即沉默的设计——容器统一规则，内容只管语义。</blockquote>
    <hr />
    <p>底部段落，验证首尾子元素外边距收敛。</p>
  </Prose>
);

// 折叠块：教程长文里的「展开看答案」，含嵌套一层（内层落弱背景与外层区分）。
const Collapsibles = () => (
  <Prose className="max-w-2xl">
    <h2>折叠块 details / summary</h2>
    <p>markdown 产物里的 GFM 折叠块直接吃 Prose 的排版，与代码块同一个视觉家族。</p>
    <details open>
      <summary>展开看答案</summary>
      <p>
        列表推导式会一次性把结果全部算出来放进内存；生成器表达式只在迭代时逐个产出，
        处理大文件时后者不会把整份数据读进来。
      </p>
      <details>
        <summary>展开看报错怎么读（嵌套一层）</summary>
        <p>嵌套的折叠块落弱背景，与外层拉开一档，明暗主题下都能看出层级。</p>
      </details>
    </details>
    <details>
      <summary>展开看完整代码（默认收起）</summary>
      <pre>
        <code>{`with open("data.txt") as f:\n    total = sum(int(line) for line in f)`}</code>
      </pre>
    </details>
  </Prose>
);

const WideTable = ({ scrollableTables }: { scrollableTables?: boolean }) => (
  <Prose scrollableTables={scrollableTables} className="max-w-sm">
    <table>
      <thead>
        <tr>
          <th>时间戳</th>
          <th>上游通道</th>
          <th>模型名称</th>
          <th>请求数</th>
          <th>失败率</th>
          <th>平均耗时</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2026-08-11</td>
          <td>华东主通道</td>
          <td>claude-opus-5</td>
          <td>12,345</td>
          <td>0.12%</td>
          <td>820ms</td>
        </tr>
        <tr>
          <td>2026-08-10</td>
          <td>华北备用通道</td>
          <td>claude-sonnet-5</td>
          <td>8,901</td>
          <td>0.31%</td>
          <td>640ms</td>
        </tr>
      </tbody>
    </table>
  </Prose>
);

export const proseShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础排版",
      description: "把渲染好的富文本（HTML/JSX/MDX 输出）塞进 Prose，标题/段落/列表/链接/行内代码统一吃语义 token。",
      code: `<Prose>
  <h1>瑚琏排版容器 Prose</h1>
  <p>
    标题、段落、列表、<a href="#">链接</a>、<code>行内代码</code> 与引用
    全部吃语义 token，明暗主题自动适配。
  </p>
  <ul>
    <li>零依赖、可在 RSC 中渲染</li>
    <li>强调用 <strong>加粗</strong> 与 <em>斜体</em></li>
  </ul>
  <blockquote>排版即沉默的设计。</blockquote>
</Prose>`,
      render: () => <Article />,
    },
    {
      title: "紧凑尺寸",
      description: 'size="sm" 把基准字号降到 text-sm，适合侧栏说明、卡片内长文。',
      code: `<Prose size="sm">
  <h2>紧凑排版</h2>
  <p>适合侧栏说明、卡片内长文等密集场景，其余排版规则保持一致。</p>
  <ul>
    <li>侧栏文档</li>
    <li>卡片内富文本</li>
  </ul>
</Prose>`,
      render: () => (
        <Prose size="sm" className="max-w-2xl">
          <h2>紧凑排版</h2>
          <p>适合侧栏说明、卡片内长文等密集场景，其余排版规则保持一致。</p>
          <ul>
            <li>侧栏文档</li>
            <li>卡片内富文本</li>
          </ul>
        </Prose>
      ),
    },
    {
      title: "折叠块（含嵌套）",
      description: "GFM 的 details / summary 与代码块同一视觉家族；嵌套折叠块落弱背景与外层区分。",
      code: `<Prose>
  <details open>
    <summary>展开看答案</summary>
    <p>生成器表达式只在迭代时逐个产出，不会把整份数据读进内存。</p>
    <details>
      <summary>展开看报错怎么读（嵌套一层）</summary>
      <p>嵌套的折叠块落弱背景，与外层拉开一档。</p>
    </details>
  </details>
</Prose>`,
      render: () => <Collapsibles />,
    },
    {
      title: "宽表横向滚动",
      description:
        "scrollableTables 让列多的表格在自身内部横向滚动，不撑破版心；表头随之不换行（否则列会被压到一列一字，永远不滚）。代价是表格宽度改为按内容撑开。",
      code: `<Prose scrollableTables>
  <table>{/* 六列宽表：窄容器内自己横向滚动 */}</table>
</Prose>`,
      render: () => <WideTable scrollableTables />,
    },
  ],
  controls: [
    {
      prop: "size",
      type: "select",
      options: ["sm", "base"],
      defaultValue: "base",
      label: "尺寸",
    },
    {
      prop: "scrollableTables",
      type: "boolean",
      defaultValue: false,
      label: "宽表横向滚动",
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
    {
      name: "折叠块（details/summary，含嵌套一层）",
      render: () => <Collapsibles />,
    },
    {
      name: "宽表：默认（撑破容器）",
      render: () => <WideTable />,
    },
    {
      name: "宽表：scrollableTables（表内横向滚动）",
      render: () => <WideTable scrollableTables />,
    },
  ],
  renderWithProps: (p) => (
    <Prose size={p.size as ProseSize} scrollableTables={p.scrollableTables as boolean} className="max-w-2xl">
      <h2>瑚琏 Prose</h2>
      <p>
        统一接管富文本排版，吃语义 token，<a href="#">链接</a> 与 <code>code</code> 一致呈现。
      </p>
      <details>
        <summary>展开看答案</summary>
        <p>折叠块与代码块同一视觉家族，summary 不可选中。</p>
      </details>
      <blockquote>容器统一规则，内容只管语义。</blockquote>
    </Prose>
  ),
  toCode: (p) =>
    `<Prose${p.size === "sm" ? ' size="sm"' : ""}${p.scrollableTables ? " scrollableTables" : ""}>{/* 富文本 HTML/JSX */}</Prose>`,
};
