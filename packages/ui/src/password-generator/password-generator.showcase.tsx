import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button/button";
import { PasswordGenerator } from "./password-generator";
import type { GeneratorMode } from "./password-generator.types";

export const passwordGeneratorShowcase: ShowcaseSpec = {
  controls: [
    { prop: "defaultMode", type: "select", options: ["password", "passphrase"], defaultValue: "password", label: "模式" },
    { prop: "showStrength", type: "boolean", defaultValue: true, label: "显示强度条" },
    { prop: "showOptions", type: "boolean", defaultValue: true, label: "显示参数区" },
    { prop: "copyable", type: "boolean", defaultValue: true, label: "可复制" },
  ],

  examples: [
    {
      title: "基础用法",
      description:
        "挂载即生成一条 14 位密码，改任何参数都会立刻重算。随机数来自 crypto.getRandomValues 并做了拒绝采样，不是 Math.random。结果区里数字标蓝、符号标红，手抄长串时才分得清 l 和 1。",
      code: `<PasswordGenerator />`,
      render: () => (
        <div className="max-w-sm">
          <PasswordGenerator />
        </div>
      ),
    },
    {
      title: "密码短语",
      description:
        "从内置的 1747 词表里随机取词拼成短语——好记、好念、好在手机上打。注意词数才是唯一的强度变量：短语看着长，3 词也只有 32 bit，6 词起才够用。",
      code: `<PasswordGenerator
  defaultMode="passphrase"
  defaultPassphraseOptions={{ words: 6, separator: "-", capitalize: true }}
/>`,
      render: () => (
        <div className="max-w-sm">
          <PasswordGenerator
            defaultMode="passphrase"
            defaultPassphraseOptions={{ words: 6, separator: "-", capitalize: true }}
          />
        </div>
      ),
    },
    {
      title: "企业密码策略预设",
      description:
        "把公司的密码规则写成默认参数：16 位、至少 2 个数字 2 个符号、排除形近字符（要口头念给同事或手抄进设备时必开）。用户仍可在面板上调，但起点就是合规的。",
      code: `<PasswordGenerator
  modes={["password"]}
  defaultPasswordOptions={{
    length: 16,
    minDigits: 2,
    minSpecial: 2,
    avoidAmbiguous: true,
  }}
/>`,
      render: () => (
        <div className="max-w-sm">
          <PasswordGenerator
            modes={["password"]}
            defaultPasswordOptions={{ length: 16, minDigits: 2, minSpecial: 2, avoidAmbiguous: true }}
          />
        </div>
      ),
    },
    {
      title: "精简版：塞进弹层",
      description:
        "关掉参数区只留「结果 + 换一个 + 复制」，宽度收窄后正好挂在密码输入框旁边的 Popover 里。库里不另造带弹层的字段组件——按需用 Popover + Button 组合即可。",
      code: `<Popover>
  <PopoverTrigger render={<Button variant="outline" size="sm">生成密码</Button>} />
  <PopoverContent className="w-72 p-0">
    <PasswordGenerator modes={["password"]} showOptions={false} />
  </PopoverContent>
</Popover>`,
      render: () => (
        <div className="w-72">
          <PasswordGenerator modes={["password"]} showOptions={false} />
        </div>
      ),
    },
    {
      title: "接住结果：actions 槽",
      description:
        "底部动作槽通常放「使用此密码」，把当前值写回表单。要拿值有两条路：onGenerate 每次出新值时回调（含熵与档位），或自己存一份 state 交给 actions 里的按钮。",
      code: `const [value, setValue] = useState("");

<PasswordGenerator
  onGenerate={(r) => setValue(r.value)}
  actions={<Button size="sm" onClick={() => form.setFieldValue("password", value)}>使用此密码</Button>}
/>`,
      render: () => (
        <div className="max-w-sm">
          <PasswordGenerator
            showOptions={false}
            actions={
              <Button size="sm" variant="outline">
                使用此密码
              </Button>
            }
          />
        </div>
      ),
    },
    {
      title: "不要强度条",
      description:
        "showStrength=false 收掉熵值与评级。适合已经在页面别处统一展示密码规则的场景——但别默认关掉，用户判断「够不够长」靠的就是它。",
      code: `<PasswordGenerator showStrength={false} modes={["password"]} />`,
      render: () => (
        <div className="max-w-sm">
          <PasswordGenerator showStrength={false} modes={["password"]} />
        </div>
      ),
    },
  ],

  states: [
    {
      name: "password",
      render: () => (
        <div className="max-w-sm">
          <PasswordGenerator modes={["password"]} />
        </div>
      ),
    },
    {
      name: "passphrase",
      render: () => (
        <div className="max-w-sm">
          <PasswordGenerator modes={["passphrase"]} />
        </div>
      ),
    },
    {
      name: "compact",
      render: () => (
        <div className="w-72">
          <PasswordGenerator modes={["password"]} showOptions={false} />
        </div>
      ),
    },
  ],

  renderWithProps: (props) => (
    <div className="max-w-sm">
      <PasswordGenerator
        defaultMode={(props.defaultMode as GeneratorMode) ?? "password"}
        showStrength={props.showStrength as boolean}
        showOptions={props.showOptions as boolean}
        copyable={props.copyable as boolean}
      />
    </div>
  ),

  toCode: (props) => {
    const attrs = [
      props.defaultMode && props.defaultMode !== "password"
        ? `defaultMode="${props.defaultMode}"`
        : "",
      props.showStrength === false ? "showStrength={false}" : "",
      props.showOptions === false ? "showOptions={false}" : "",
      props.copyable === false ? "copyable={false}" : "",
    ].filter(Boolean);
    return attrs.length ? `<PasswordGenerator\n  ${attrs.join("\n  ")}\n/>` : `<PasswordGenerator />`;
  },
};
