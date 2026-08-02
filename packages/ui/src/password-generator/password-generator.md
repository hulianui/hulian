---
slug: password-generator
name: PasswordGenerator
category: forms
group: advanced
tags: []
exports:
  [
    PasswordGenerator,
    generatePassword,
    generatePassphrase,
    generateSecret,
    passwordEntropy,
    passphraseEntropy,
    strengthOf,
    randomInt,
    shuffle,
    resolvePasswordOptions,
    resolvePassphraseOptions,
    buildPools,
    PASSPHRASE_WORDLIST,
    CHARSET,
    AMBIGUOUS,
    LENGTH_RANGE,
    WORDS_RANGE,
    MIN_COUNT_RANGE,
    STRENGTH_THRESHOLDS,
  ]
status: enriched
---

# PasswordGenerator

> 密码生成器 · Bitwarden 式双模面板（字符密码 + 密码短语·内置 1747 词表）+ 熵值实时评级四档强度条 + 参数即改即重算 + 逐字符着色（数字蓝符号红·手抄可辨）+ 复制/重生成 + i18n · 随机源 crypto.getRandomValues 拒绝采样消模偏（拒绝 Math.random）+ 生成算法作纯函数导出可服务端复用 + SSR 首帧占位不水合失配 · forms/advanced

## 何时用

给用户**造**一个新密码：注册页、改密页、密码管理器、API 密钥申请、批量开户后台。
展示**已有**的密钥用 [SecretField](../secret-field/secret-field.md)（掩码 + 显形 + 复制），录入密码用 [Input](../input/input.md) type=password —— 三者职责不重叠。

不做的事：不校验既有密码的强度（那需要字典与模式识别，是 zxcvbn 那类库的活；本组件只报自己生成过程的理论熵），不生成用户名，不接邮箱转发服务。

## 安全底线

这个组件真正的含金量在 `core`，不在面板：

- **随机源只用 `crypto.getRandomValues`**。`Math.random()` 是可预测 PRNG，观察少量输出即可反推内部状态并复现整条序列，用它生成的密码等于没生成。环境不支持时组件显示错误提示，**不静默降级**。
- **拒绝采样消除模偏**。常见写法 `bytes[i] % pool.length` 会把 2^32 除不尽的尾巴多分给前几个字符，让它们出现概率偏高——熵被悄悄削掉而外观毫无异样。这里把落在尾巴里的取值丢弃重抽。
- **结果整体洗牌**。先按类别补足下限再洗牌，避免「前两位必是大写和小写」这种可被裁剪搜索空间的位置规律。
- **勾选即保证出现**。勾了数字却生成出不含数字的密码是密码策略校验最常见的翻车点，所以每个启用类别至少出现 1 个。

熵按 `长度 × log2(池大小)` 计（短语按 `词数 × log2(词库大小)`）。这是上界：最少数字/符号这类约束会略微缩小合法空间，默认参数下差距不到 1 bit。

## 导入

```ts
import { PasswordGenerator } from "@hulianui/ui";
// 只要算法、不要面板（服务端 / 表单 / CLI 同样可用）：
import { generatePassword, generatePassphrase, passwordEntropy } from "@hulianui/ui";
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| mode | `"password"｜"passphrase"` | — | 受控模式；不传则组件自管 |
| defaultMode | `"password"｜"passphrase"` | `"password"` | 非受控初始模式 |
| modes | `GeneratorMode[]` | 两种全开 | 允许的模式。只给一种时隐藏顶部切换器 |
| defaultPasswordOptions | `PasswordOptions` | 见下 | 密码模式初始参数 |
| defaultPassphraseOptions | `PassphraseOptions` | 见下 | 短语模式初始参数 |
| copyable | `boolean` | `true` | 显示复制按钮 |
| showStrength | `boolean` | `true` | 显示熵值与强度条 |
| showOptions | `boolean` | `true` | 显示参数区。关掉只剩结果 + 重新生成，适合塞进 Popover |
| labels | `Partial<PasswordGeneratorLabels>` | — | 逐条覆盖文案（优先级高于 ConfigProvider locale） |
| className | `string` | — | 落在面板根节点 |

`PasswordOptions`：`length` 14（clamp 5–128）、`uppercase`/`lowercase`/`digits`/`special` 均 true、`minDigits`/`minSpecial` 1（clamp 1–9）、`avoidAmbiguous` false（排除 `I l 1 O 0 o`）。

`PassphraseOptions`：`words` 6（clamp 3–20）、`separator` `"-"`、`capitalize` false、`includeNumber` false、`wordlist` 内置 1747 词表。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onGenerate | `(result: GeneratedSecret) => void` | 每次产出新值（含首次挂载）。`{ value, mode, entropy, strength }` |
| onModeChange | `(mode: GeneratorMode) => void` | 模式切换（受控时用） |
| onOptionsChange | `(state) => void` | 参数变更，用于把用户偏好持久化 |
| onCopy | `(value: string) => void` | 复制回调。组件已写入剪贴板，这里只做提示/埋点 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| actions | `ReactNode` | 底部动作槽，通常放「使用此密码」 |

## 示例

```tsx
<PasswordGenerator onGenerate={(r) => setValue(r.value)} />
```

企业密码策略预设（16 位、至少 2 数字 2 符号、排除形近字符）：

```tsx
<PasswordGenerator
  modes={["password"]}
  defaultPasswordOptions={{ length: 16, minDigits: 2, minSpecial: 2, avoidAmbiguous: true }}
/>
```

挂在密码输入框旁的精简版（库里不另造带弹层的字段件，按需组合）：

```tsx
<Popover>
  <PopoverTrigger render={<Button variant="outline" size="sm">生成密码</Button>} />
  <PopoverContent className="w-72 p-0">
    <PasswordGenerator modes={["password"]} showOptions={false} />
  </PopoverContent>
</Popover>
```

换词库（中文词表 / EFF 完整表 / 领域词表）：

```tsx
<PasswordGenerator
  defaultMode="passphrase"
  defaultPassphraseOptions={{ words: 6, wordlist: myWordlist }}
/>
```

> 词库要求词间互不重复——有重复词时熵按去重后的规模算，`passphraseEntropy` 不会虚报。

## 纯函数单独用

面板之外，算法可以在服务端、表单校验、批量脚本里直接调：

```ts
import { generatePassword, generatePassphrase, passwordEntropy, strengthOf } from "@hulianui/ui";

const pw = generatePassword({ length: 20, avoidAmbiguous: true });
const bits = passwordEntropy({ length: 20, avoidAmbiguous: true }); // ≈ 119
strengthOf(bits); // "strong"

generatePassphrase({ words: 6, separator: "." });
```

所有生成函数的第二参数是可注入的随机源 `RandomInt`，测试里传伪随机即可让输出确定可复现：

```ts
generatePassword({ length: 8 }, () => 0); // 固定序列 → 固定结果
```

## 无障碍

- 结果区是 `<output aria-live="polite">`，重新生成后读屏会播报新值。
- 强度条是 `role="meter"`，带 `aria-valuenow`（0–4）与 `aria-valuetext`（档位名），不依赖颜色单独传达强弱。
- 所有图标按钮、滑块、数字输入都有 `aria-label`，取自当前 locale。

## i18n

文案走 `ConfigProvider` 的 `locale.passwordGenerator`（内置 zhCN / enUS）。单点覆盖用 `labels` prop，优先级高于 locale。

## 注意

- **SSR**：生成结果每次不同，首帧只渲染占位圆点，挂载后的 effect 里才出真值——所以服务端渲染不会水合失配，但也意味着首帧看不到密码。
- **改参数即重算**：任何参数变化都会重新生成一条。这是刻意的（改了长度却还看着旧密码会让人以为没生效），若需要「参数改了但值不变」请自行受控托管值。
- 词库约 16KB 未压缩，只在用到本组件时进包。
