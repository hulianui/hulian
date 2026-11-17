"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { BorderBeam } from "../border-beam";
import { Snippet, SnippetGroup } from "./snippet";

export const snippetShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "单行可复制命令，默认带 $ 提示符与右侧复制按钮。",
      code: `<Snippet>pnpm add @hulianui/ui</Snippet>`,
      render: () => <Snippet>pnpm add @hulianui/ui</Snippet>,
    },
    {
      title: "无提示符（代码片段）",
      description: "symbol={null} 去掉提示符，按 JS 规则着色，适合粘贴代码片段。",
      code: `<Snippet symbol={null}>const theme = useTheme()</Snippet>`,
      render: () => <Snippet symbol={null}>const theme = useTheme()</Snippet>,
    },
    {
      title: "自定义复制文本",
      description: "text 指定实际复制内容，可与展示文本不同。",
      code: `<Snippet text="pnpm --filter @hulianui/ui build">
  pnpm --filter ... build
</Snippet>`,
      render: () => (
        <Snippet text="pnpm --filter @hulianui/ui build">pnpm --filter ... build</Snippet>
      ),
    },
    {
      title: "一组上手步骤（SnippetGroup）",
      description:
        "SnippetGroup 把几条命令堆叠在同一张卡里，组画外框与分隔线；muted 标出次要行；overlay 放 BorderBeam 这类装饰层。",
      code: `<SnippetGroup overlay={<BorderBeam size={120} duration={9} />}>
  <Snippet>pnpm add @hulianui/ui @hulianui/tokens</Snippet>
  <Snippet>npx @hulianui/mcp init-agent</Snippet>
  <Snippet symbol={null} highlight={false} muted>https://hulian.dev/start</Snippet>
</SnippetGroup>`,
      render: () => (
        <SnippetGroup overlay={<BorderBeam size={120} duration={9} />} className="w-full max-w-md">
          <Snippet>pnpm add @hulianui/ui @hulianui/tokens</Snippet>
          <Snippet>npx @hulianui/mcp init-agent</Snippet>
          <Snippet symbol={null} highlight={false} muted>
            https://hulian.dev/start
          </Snippet>
        </SnippetGroup>
      ),
    },
  ],
  controls: [],
  states: [
    { name: "command", render: () => <Snippet>pnpm add @hulianui/ui</Snippet> },
    { name: "no-symbol", render: () => <Snippet symbol={null}>const theme = useTheme()</Snippet> },
    { name: "long", render: () => <Snippet>pnpm --filter @hulianui/ui build</Snippet> },
  ],
  renderWithProps: () => <Snippet>pnpm add @hulianui/ui</Snippet>,
  toCode: () => `<Snippet>pnpm add @hulianui/ui</Snippet>`,
};
