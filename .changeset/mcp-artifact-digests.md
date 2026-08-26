---
"@hulianui/mcp": minor
---

`source.artifactDigests`：每条响应带上**这一次调用真正读到的**产物的 sha256（#332）

版本号只能证明「同一次发版」，证明不了「同一份内容」。同一个版本号内产物会被重新生成
（改完组件跑 `pnpm llms-registry`，版本不变而内容全变），线上产物也随文档站每次构建重写 ——
本 server 的新鲜度告警本身就承认这件事。对只是读一读的调用方无所谓；对拿 `llms-props.json`
做**受约束生成**、事后还要复核「我当时照着的那份 props 到底是哪一份」的调用方，版本号给不出
答案，只能靠摘要。

```json
{ "source": { "artifactDigests": { "llms-props.json": "sha256:9b7022c6…" } } }
```

三条口径：

- 摘要算在**读到 / 收到的字节**上，`shasum -a 256 <文件>` 能逐字对上；不是解析后重新序列化的
  结果（那个键序与空白都变了，拿去跟仓库里的文件比对会永远对不上，还不如没有）。
- 只列**这次调用真的读过**的产物：`list_components` 只有 `registry.json`，
  `get_component_doc({format:"json"})` 只有 `llms-props.json`，不读产物的 tool 就是空对象。
  作用域用 `AsyncLocalStorage`，多个 tool 调用同时在飞也不会互相串账。
- 源码 md 与产物 md 用不同的名字（`src/<slug>/<slug>.md` vs `d/<slug>.md`），因为它们本来
  就是两份不同的文件（对照 `docComesFromSource`）。

纯新增字段，既有响应结构不变。
