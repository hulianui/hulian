# @hulianui/guard

> **English TL;DR** — An AST-based linter for [`@hulianui/ui`](https://www.npmjs.com/package/@hulianui/ui) consumers. It executes the machine-readable rules in `conventions.json` and catches misuse that TypeScript and unit tests cannot see. Zero dependencies beyond TypeScript. English docs: <https://hulianui.haloritual.com/en>

瑚琏 Hulian 的**用法门禁** —— 把 `conventions.json` 里的约束真正跑起来，拦住「类型检查通不过不了、单测也看不见」的那类误用。

- License：MIT

## 它拦的是哪一类问题

TypeScript 管签名，单测管行为，但下面这些**编译通过、测试全绿、页面照常渲染**，只是意思不对：

| 写法 | 实际发生了什么 |
|---|---|
| `<Button style={{ color: "red" }}>` | 绕过 OKLCH 语义 token，明暗切换与运行时换肤当场失效 |
| `toast.success("已保存")` | `toast` 没有成员快捷方法，运行时才炸 |
| `fill="var(--primary)"` | Tailwind v4 的真名带 `--color-` 前缀，裸名不解析 → SVG 变黑 |
| `className="bg-muted p-4"` | `--color-muted` 是次要**文字**色，当背景用亮色发脏、暗色发白 |
| `import { X } from "@hulianui/ui/_icons"` | 不在 `exports` 里，解析失败 |

这些都是有确定判据的，所以能自动执行。需要结合业务判断的部分留在 `conventions.json` 的 `advisories` 里，本工具**不冒充**硬门禁。

## 用法

```bash
# CI 里对消费方源码跑一遍
npx -y @hulianui/guard src/components src/app

# 也可以装进项目
pnpm add -D @hulianui/guard
npx hulian-check src
```

不传路径时检查当前目录。

### 退出码

| 码 | 含义 |
|---|---|
| `0` | 通过（可能有 warning，warning 只报告不失败） |
| `1` | 存在 **error** 级违规 |
| `2` | 参数错误、路径不存在，或源码语法解析失败 |

`--format json` 输出结构化结果，便于接自己的报告流水线。

### 编程调用

```js
import { checkFiles, checkSource } from "@hulianui/guard";

const result = checkFiles(["src"]);
// result.diagnostics: [{ file, line, column, ruleId, severity, message, instead? }]
```

## 自定义规则

`--config path/to/conventions.json` 可以追加自己团队的规则。

**内置的 error 级规则不能被关掉或改写** —— 自定义配置里出现同 `id` 但内容不同的条目会直接报错。理由很直接：一个能被项目关掉的门禁，等于没有门禁。要豁免请在调用处逐个说明，而不是整条关闭。

## 规则从哪来

规则真源是仓库里的 `scripts/gen-conventions.mjs`，产物 `conventions.json` 同时被本包和 [`@hulianui/mcp`](https://www.npmjs.com/package/@hulianui/mcp) 消费 —— 前者在 CI 里**事后拦**，后者让 AI 在**写代码时**就拿到同一份约束。线上版本：<https://hulianui.haloritual.com/conventions.json>

## License

[MIT](https://github.com/hulianui/hulian/blob/master/LICENSE) © 瑚琏 Hulian
