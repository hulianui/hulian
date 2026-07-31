---
"@hulianui/ui": minor
---

新增 PasswordGenerator 密码生成器（Bitwarden 式双模面板）

**字符密码 + 密码短语双模**。密码模式给长度（5–128）、四类字符开关、最少数字/符号、排除形近字符；短语模式给词数（3–20）、分隔符、首字母大写、附加数字，词从内置 1747 词的常用短词表里取。参数改了立刻重算，熵值实时评级四档强度条。

**真正的含金量在算法，不在面板**，所以生成逻辑全部作为纯函数导出，服务端 / 表单校验 / CLI 都能直接调：

```ts
import { generatePassword, generatePassphrase, passwordEntropy, strengthOf } from "@hulianui/ui";
```

三条不可省的安全实现：

- **随机源只用 `crypto.getRandomValues`**。`Math.random()` 是可预测 PRNG，用它生成的密码等于没生成。环境不支持时组件显示错误提示，**不静默降级**。
- **拒绝采样消除模偏**。`bytes[i] % pool.length` 这种常见写法会让前几个字符出现概率偏高——熵被悄悄削掉而外观毫无异样。
- **结果整体洗牌**。否则「前两位必是大写和小写」成了可被利用的位置规律。

生成函数第二参数是可注入的随机源，测试里传伪随机即可让输出确定可复现。

文案接入 `ConfigProvider` 的 `locale.passwordGenerator`（内置 zhCN / enUS），亦可用 `labels` prop 逐条覆盖。结果区是 `aria-live` 的 `<output>`，强度条是 `role="meter"` 带 `aria-valuetext`，不靠颜色单独传达强弱。SSR 首帧渲染占位符，不会水合失配。

配套 70 个测试（47 个算法 + 23 个组件），覆盖拒绝采样、约束满足、洗牌有效性、词库无重复、SSR 占位。
