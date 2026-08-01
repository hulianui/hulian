# @hulianui/guard

## 0.2.1

### Patch Changes

- 4e0f452: 修正两处让公开子路径入口用不了的问题（#35 / #36 P0-2）

  **`@hulianui/ui/vitest-preset` 补类型声明**

  `docs/consuming.md` §1 推荐的这条入口在包里没有对应 `.d.ts`，`strict` 的 TS 消费方
  按文档写就会 `TS7016: Could not find a declaration file`，而 `vitest.config.ts` 通常
  落在 tsconfig 的 `include` 里，等于直接卡住消费方的 typecheck 门禁。

  新增 `vitest-preset.d.ts`（`withHulian` / `hulianDedupe` / `hulianConditions` /
  `hulianMainFields` / `hulianInlineDeps`），并给 exports 补 `types`，与同为工具入口的
  `./vite` 对齐。`withHulian` 用泛型透传入参类型，消费方自己的字段在 `defineConfig`
  里不会被抹成宽泛的 `UserConfig`。

  **guard / conventions 不再错禁公开子路径**

  `no-private-deep-import` 的 pattern 是 `^@hulianui/ui/`，把**所有**子路径一律判 error，
  于是这些全成了违规：

  ```ts
  import { Button } from "@hulianui/ui/button"; // consuming.md §3 明确推荐
  import { withHulian } from "@hulianui/ui/vitest-preset"; // 库自己的官方集成入口
  import { hulian } from "@hulianui/ui/vite";
  ```

  门禁与文档、与 package.json exports 三方打架。现在改成以 exports 为真源：显式条目加
  `./*` 能解析到的目录（有 `index.ts` 的）全部放行，只拦真正解析不出来的——库内部路径
  （`_icons`、`src/...`）与 0.15.0 随 MUI 一起移除的 `date-pickers`。放行名单在生成
  conventions 时从真实目录算出，不需要人工维护。

## 0.2.0

### Minor Changes

- 235cee5: 新增可执行的 `@hulianui/guard` 约束门禁，并让 MCP 安装指引返回页面递归依赖、显式接入清单和安装后检查命令。

  `SelectTrigger` 现在透传原生 button 属性，并在 searchable 模式下正确合并消费方 ref 与内部锚点 ref。
