---
"@hulianui/mcp": patch
---

`inspect_project`：monorepo 子项目里的 registry 包不再被误判为 `local-link`（closes #68）

`linkKindOf` 的「逃逸」判据以**发现该包的那一层** `node_modules` 为基准，而 pnpm workspace 子项目里 `apps/web/node_modules/@hulianui/ui` 指向的是**仓库根**的 `node_modules/.pnpm/…`——天然逃出 `apps/web` 那层，于是每个子项目里的普通 registry 安装都被判成本地源码接入。`#45` 的回归 fixture 是单包项目、`.pnpm` 恰好与发现层同级，所以当时能过，缺陷藏了下来。

后果与 `#45` 相同而且更隐蔽：`linked` 恒 `true` 让「声明 vs 实装」的版本漂移门禁**静默失效**，同时 `importStrategy` 给出错误原因（说是本地源码接入、要求上 Vite 预构建插件），`@hulianui/tokens` 一并误判。

改法：基准从「那一层」改为**沿途每一层** `node_modules`，任一层收得住就不算本地接入。显式 `workspace:` / `link:` / `file:` 的判据不动。

于是 workspace 子项目里的普通安装现在如实回报：

```json
{ "declared": "0.18.0", "installed": "0.18.0", "linked": false, "linkKind": null }
```

补了真实 workspace fixture 的回归（根有 `pnpm-workspace.yaml`，`apps/web` 的软链指向根 `.pnpm` store），含负向边界：软链指向仓库内 `packages/ui` **源码目录**（不在任何 `node_modules` 内）时仍要判 `local-link`——判据放宽不能过头。
