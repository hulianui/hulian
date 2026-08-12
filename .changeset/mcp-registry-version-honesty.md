---
"@hulianui/mcp": minor
---

版本戳不再撒谎：产物与源码不同版时改为 error 级横幅，并给出兜底路径（#246）

**症状**：MCP 返回的组件文档顶着 `registry v0.39.0` 的版本戳，而产物其实是 0.37.0 的源码生成的；同一条响应的脚注里 server 自己已经说了「产物版本 0.37.0，源码已是 0.39.0」。前后自相矛盾，而调用方（尤其是模型）只会信前面那个数，于是拿着过期 props 以为是最新。

**根因不在生成器，在展示层**。`registry.json` 写的一直是「生成那一刻的源码版本」，这个字段是对的。是 #47 为了消掉 validate 里的假 skew，让 `registryMeta.version` 在本地模式下取**源码**版本，而拼版本戳那一行照抄了这个字段却仍用「registry v…」作标签 —— 一个字段承担了两种含义，标签说的是产物，数字给的是源码。产物真正落后时，这两者恰好分叉，而分叉正是唯一需要说话的时刻。

- **版本戳诚实**：两者一致时照旧一行 `registry v<版本>`；不一致时写成 `产物 registry v<A> ≠ 源码 v<B>`，两个数都给出。`sourceInfo()` 同步补 `sourceVersion` 与 `versionSkew` 两个字段，`version` 的既有口径（这份检出/这次安装实际是什么版本，validate 据此比 skew）不变。
- **不一致是 error 级，且贴在响应最顶部**，不再是脚注。脚注排在长文档之后，模型读到那儿时前面的 props 早被当成事实吸收了，而这条说的正是「前面那些 props 未必属于你装的那一版」。刻意不置 MCP 的 `isError`：那会让客户端把整条响应丢掉，调用方一个字都拿不到，而它此刻最需要的是「拿到内容 + 知道去哪儿核对」。
- **`get_component_doc` 直接把兜底路径写给调用方**：正文来自产物时明说「以 `node_modules/@hulianui/ui/src/<slug>/<slug>.md` 与同目录的 `<slug>.types.ts` 为准」——这两份随 npm 包发布，永远与实装版本同版。正文取自源码 md 时（在瑚琏仓库里开发）则换一句话：正文可信，旧的只是「有哪些组件」这张清单，跑 `pnpm llms-registry` 即可。两种来源的处方不同，笼统说一句「产物旧了」会让人去改错的东西。
- **补上消费方那一格**：`HULIAN_UI_ROOT` 指向 `node_modules/@hulianui/ui` 时根本没有 `apps/www/public`，旧的陈旧判定一进门就返回 null —— 「装的是 0.39.0、答的是线上 0.37.0」这条最常见的路径此前从未被检查过。现在版本比对独立于产物是否在本地，`get_component_doc({format:"json"})` 这条只读 `llms-props.json`、从不加载 registry 的路径也一并覆盖。

同一个 issue 的机械化那一半落在仓库侧（不随包发布）：新增 `pnpm registry:version` 比对 `registry.json` / `llms-props.json` / `llms.txt` / `llms-full.txt` 四份提交进仓库的产物与 `packages/ui` 的版本，挂进 CI 的静态门禁、`version-packages` 收尾以及 Release 工作流的发布前置。判据只比版本号不比内容：要拦的是「发了新版却没重跑生成器」，它靠版本号就能证明且零误报。这类漂移不会让任何编译或测试变红，只会越走越远。
