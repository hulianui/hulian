---
"@hulianui/ui": patch
---

fix(ui): 消除 Base UI rc.0 Toast 的 React 19 flushSync 告警

Toast 出现时 `ToastRoot` 在 layout effect 里调 `ReactDOM.flushSync` 写回测得高度，React 19 报 `flushSync was called from inside a lifecycle method`（dev 下每次 2 条：1 条正常 + 1 条 StrictMode 双调用）。经 `pnpm patch` 把 base-ui 的 `recalculateHeight` 改为 `flushSync` 可选形参（默认关），对齐上游 mui/base-ui master 修复——layout-effect 路径直接 setState（React 本就在 paint 前同步 flush，无需 flushSync 且无闪烁），observer 回调仍走 flushSync。

仅影响 dev 控制台噪声（production 本就剥离该警告）。注意：补丁经 `patchedDependencies` 落地，惠及本仓库 + dev 软链消费方；npm 发布版不携带该补丁，registry 消费方如遇同告警需各自加同款 patch。
