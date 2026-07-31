import type { ReactNode } from "react";
import type { Locale } from "../config/locale";

/** 生成模式：字符密码 / 密码短语（词组）。 */
export type GeneratorMode = "password" | "passphrase";

/** 熵值分档。阈值见 core 的 STRENGTH_THRESHOLDS。 */
export type StrengthLevel = "weak" | "fair" | "good" | "strong";

/**
 * 均匀随机整数源：返回 `[0, max)` 内的整数，各值等概率。
 * 默认实现走 crypto.getRandomValues + 拒绝采样；测试/复现场景可注入伪随机。
 */
export type RandomInt = (max: number) => number;

export interface PasswordOptions {
  /** 长度，clamp 到 5–128，默认 14。 */
  length?: number;
  /** 含大写 A–Z，默认 true。 */
  uppercase?: boolean;
  /** 含小写 a–z，默认 true。 */
  lowercase?: boolean;
  /** 含数字 0–9，默认 true。 */
  digits?: boolean;
  /** 含符号 !@#$%^&*，默认 true。 */
  special?: boolean;
  /** 至少几个数字，clamp 到 1–9，默认 1（digits 关闭时该项无效）。 */
  minDigits?: number;
  /** 至少几个符号，clamp 到 1–9，默认 1（special 关闭时该项无效）。 */
  minSpecial?: number;
  /** 排除形近字符 I l 1 O 0 o，默认 false。开启会略微降低熵，换来可抄写性。 */
  avoidAmbiguous?: boolean;
}

export interface PassphraseOptions {
  /** 词数，clamp 到 3–20，默认 6（6 词≈65 bit，是默认值里第一个够强的档；再少只到「一般」）。 */
  words?: number;
  /** 词间分隔符，默认 `-`。 */
  separator?: string;
  /** 每个词首字母大写，默认 false。不增加熵，只为满足「必须含大写」的密码策略。 */
  capitalize?: boolean;
  /** 随机挑一个词，在词尾追加一位数字，默认 false。 */
  includeNumber?: boolean;
  /** 词库，默认内置 PASSPHRASE_WORDLIST。要求词间互不重复，否则实际熵低于账面值。 */
  wordlist?: readonly string[];
}

/** 一次生成的结果与其安全性度量。 */
export interface GeneratedSecret {
  value: string;
  mode: GeneratorMode;
  /** 熵（bit）。这是生成过程的理论熵，不是对既有密码的猜测强度评分。 */
  entropy: number;
  strength: StrengthLevel;
}

/**
 * 面板文案。直接取自 Locale 的同名段，不另立一份接口——
 * 两处各写一遍必然漂移（加了 locale 字段忘了加这里，编译期还未必报出来）。
 * 逐条字段说明见 config/locale.ts。
 */
export type PasswordGeneratorLabels = Locale["passwordGenerator"];

export interface PasswordGeneratorProps {
  /** 受控模式；不传则组件自管。 */
  mode?: GeneratorMode;
  /** 非受控初始模式，默认 "password"。 */
  defaultMode?: GeneratorMode;
  onModeChange?: (mode: GeneratorMode) => void;
  /**
   * 允许的模式，默认两种全开。只给一种时隐藏顶部切换器
   * （嵌进注册表单这类「只要密码」的场景用）。
   */
  modes?: readonly GeneratorMode[];
  /** 密码模式的初始参数（用户在面板上的改动之后由组件自管）。 */
  defaultPasswordOptions?: PasswordOptions;
  /** 密码短语模式的初始参数。 */
  defaultPassphraseOptions?: PassphraseOptions;
  /** 参数变更回调，用于把用户偏好持久化到 localStorage / 账号设置。 */
  onOptionsChange?: (state: {
    mode: GeneratorMode;
    password: PasswordOptions;
    passphrase: PassphraseOptions;
  }) => void;
  /** 每次产出新值时触发（首次挂载自动生成也算）。 */
  onGenerate?: (result: GeneratedSecret) => void;
  /** 点复制时触发。组件已写入剪贴板，这里只做提示/埋点。 */
  onCopy?: (value: string) => void;
  /** 显示复制按钮，默认 true。 */
  copyable?: boolean;
  /** 显示强度条，默认 true。 */
  showStrength?: boolean;
  /** 显示参数区，默认 true。关掉只剩「结果 + 重新生成」，适合塞进 Popover。 */
  showOptions?: boolean;
  /** 底部动作槽，通常放「使用此密码」按钮。 */
  actions?: ReactNode;
  /** 文案覆盖（逐条 merge）。 */
  labels?: Partial<PasswordGeneratorLabels>;
  className?: string;
}
