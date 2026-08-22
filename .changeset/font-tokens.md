---
"@hulianui/tokens": minor
---

新增字型令牌 `--hl-font-sans` / `--hl-font-mono`（#319）。

此前 tokens 里没有任何字体变量：颜色、阴影、圆角、缓动都是两层令牌 + 运行时可换，唯独字体这一层空着。消费方想换字体只能覆盖 `body { font-family }` 靠继承往下渗，而 `@hulianui/ui` 里 48 个用 `font-mono` 的组件（Kbd / CodeEditor / JsonViewer / LogViewer / Snippet …）吃的是 Tailwind 的 `--font-mono`，根本不在那条继承链上 —— 换完字体，页面里仍有一批组件是另一套等宽栈，且改不动。

现在 `preset-opinionated.css` 用 `@theme inline` 把 `--font-sans` / `--font-mono` 映射到这两个运行时变量，改一行 `:root` 即可同时改掉：`font-sans` / `font-mono` 工具类、Tailwind preflight 给 `<html>` 的默认字体、以及那 48 个组件。

**默认值等价于 Tailwind v4 的默认字体栈**，不设这两个变量的项目渲染逐字不变。

局部换字体时正文与等宽的写法不对称（实测）：等宽只需在容器上写 `--hl-font-mono`；正文除变量外还要给容器加一个 `font-sans` 类 —— 自定义属性会继承，但 `font-family: var(…)` 只在声明了该属性的元素上重新解析，普通文字继承的是根节点已解析完的字体名。详见 `packages/tokens/README.md` 的「换字体」一节。
