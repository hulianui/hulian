// 密码生成核心 —— 与 React 无关的纯逻辑，可在服务端 / 表单校验 / CLI 里单独用。
//
// 这个文件里唯一重要的事是**随机源的正确性**，UI 只是它的外壳：
//
// 1. 随机必须来自 crypto.getRandomValues。Math.random() 是可预测的 PRNG（V8 用 xorshift128+，
//    观察到少量输出即可反推内部状态、复现整条序列），拿它生成密码等于没生成。
// 2. 取字符不能写 `bytes[i] % pool.length`。2^32 通常不是池大小的整数倍，余数把区间尾巴多分给
//    了前几个字符，出现概率不均——这就是模偏（modulo bias），它悄悄削掉真实熵而外表毫无异样。
//    这里用拒绝采样：把造成不均的那截尾巴丢掉重抽。
//
// 所有生成函数都接受可注入的 RandomInt，测试才能断言「给定随机序列 → 确定输出」，
// 而不是只能测统计性质。

import { PASSPHRASE_WORDLIST } from "./password-generator.wordlist";
import type {
  GeneratedSecret,
  PassphraseOptions,
  PasswordOptions,
  RandomInt,
  StrengthLevel,
} from "./password-generator.types";

export const CHARSET = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  /** 与 Bitwarden 默认符号集一致：键盘首排、各系统输入法都好打、不会被 shell/CSV 吃掉。 */
  special: "!@#$%^&*",
} as const;

/** 视觉形近字符：大 i / 小 L / 数字 1，大 O / 小 o / 数字 0。需要口头传达或手抄时开。 */
export const AMBIGUOUS = "Il1O0o";

export const LENGTH_RANGE = { min: 5, max: 128 } as const;
export const WORDS_RANGE = { min: 3, max: 20 } as const;
export const MIN_COUNT_RANGE = { min: 1, max: 9 } as const;

/**
 * 熵分档阈值（bit）。取值参照通行口径：
 * <36 挡不住离线字典爆破；36–59 够用但别用在主账号；60–99 当前算力下离线爆破不现实；≥100 长期富余。
 */
export const STRENGTH_THRESHOLDS = { fair: 36, good: 60, strong: 100 } as const;

const UINT32_RANGE = 4294967296; // 2^32

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

/** 默认随机源：crypto.getRandomValues + 拒绝采样，无模偏。 */
export const randomInt: RandomInt = (max: number): number => {
  if (!Number.isInteger(max) || max <= 0) {
    throw new RangeError(`randomInt(max) 需要正整数，收到 ${max}`);
  }
  if (max === 1) return 0;
  const c = globalThis.crypto;
  if (!c?.getRandomValues) {
    // Node 18+ / 所有现代浏览器都有（注意：getRandomValues 不像 crypto.subtle 那样要求安全上下文，
    // http 的内网页面同样可用）。走到这里说明环境过老，不静默降级到 Math.random——
    // 那会让调用方以为拿到了强随机。
    throw new Error("[hulian] PasswordGenerator 需要 crypto.getRandomValues，当前环境不支持");
  }
  const buf = new Uint32Array(1);
  // 丢掉 [limit, 2^32) 这段：它是 2^32 除以 max 除不尽剩下的尾巴，留着就会让前 (2^32 % max)
  // 个取值多一次命中机会。max 为 2 的幂时 limit 恰好等于 2^32，循环一次即出。
  const limit = UINT32_RANGE - (UINT32_RANGE % max);
  let x = 0;
  do {
    c.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
};

function pick(chars: string, rnd: RandomInt): string {
  return chars[rnd(chars.length)];
}

/** Fisher-Yates 洗牌（不改原数组）。用同一随机源，保证洗牌本身也无偏。 */
export function shuffle<T>(items: readonly T[], rnd: RandomInt = randomInt): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function stripAmbiguous(chars: string): string {
  return [...chars].filter((c) => !AMBIGUOUS.includes(c)).join("");
}

/** 归一后的密码参数：各字段确定，且各类下限之和不超过 length。 */
export interface ResolvedPasswordOptions extends Required<PasswordOptions> {
  /** 每个启用类别实际要求的最少个数（未启用为 0）。 */
  minima: { uppercase: number; lowercase: number; digits: number; special: number };
}

/**
 * 参数归一：clamp 范围、兜底非法组合、把「最少个数」算成可直接消费的数字。
 *
 * 两条刻意的设计决定：
 * - **勾选即保证出现**。勾了数字却生成出没有数字的密码，是密码策略校验最常见的翻车点，
 *   所以每个启用的类别下限至少 1（minDigits/minSpecial 只能在此之上抬高）。
 * - **不抛错**。参数由 UI 滑块喂进来，任何组合都得给出可用结果：四类全关回落到小写；
 *   下限总和超过长度时从符号、数字依次回退（长度下限 5 ≥ 四类各 1，总能收敛）。
 */
export function resolvePasswordOptions(options: PasswordOptions = {}): ResolvedPasswordOptions {
  const length = clamp(options.length ?? 14, LENGTH_RANGE.min, LENGTH_RANGE.max);
  let { uppercase = true, lowercase = true, digits = true, special = true } = options;
  if (!uppercase && !lowercase && !digits && !special) lowercase = true;

  let minDigits = digits ? clamp(options.minDigits ?? 1, MIN_COUNT_RANGE.min, MIN_COUNT_RANGE.max) : 0;
  let minSpecial = special
    ? clamp(options.minSpecial ?? 1, MIN_COUNT_RANGE.min, MIN_COUNT_RANGE.max)
    : 0;
  const minUpper = uppercase ? 1 : 0;
  const minLower = lowercase ? 1 : 0;

  let overflow = minUpper + minLower + minDigits + minSpecial - length;
  while (overflow > 0 && minSpecial > 1) (minSpecial--, overflow--);
  while (overflow > 0 && minDigits > 1) (minDigits--, overflow--);

  return {
    length,
    uppercase,
    lowercase,
    digits,
    special,
    minDigits,
    minSpecial,
    avoidAmbiguous: options.avoidAmbiguous ?? false,
    minima: { uppercase: minUpper, lowercase: minLower, digits: minDigits, special: minSpecial },
  };
}

/** 按参数拼出实际可用的字符池（已剔除形近字符）。 */
export function buildPools(o: ResolvedPasswordOptions): Record<keyof typeof CHARSET, string> {
  const f = o.avoidAmbiguous ? stripAmbiguous : (s: string) => s;
  return {
    uppercase: o.uppercase ? f(CHARSET.uppercase) : "",
    lowercase: o.lowercase ? f(CHARSET.lowercase) : "",
    digits: o.digits ? f(CHARSET.digits) : "",
    special: o.special ? f(CHARSET.special) : "",
  };
}

/**
 * 生成字符密码。
 *
 * 顺序是「先按类别补足下限 → 剩余位从合并池取 → 整体洗牌」。最后那次洗牌不能省：
 * 不洗的话「前两位必是大写和小写」成了固定规律，攻击者可据此裁剪搜索空间。
 */
export function generatePassword(options: PasswordOptions = {}, rnd: RandomInt = randomInt): string {
  const o = resolvePasswordOptions(options);
  const pools = buildPools(o);
  const chars: string[] = [];

  for (const key of ["uppercase", "lowercase", "digits", "special"] as const) {
    const pool = pools[key];
    for (let i = 0; i < o.minima[key] && pool; i++) chars.push(pick(pool, rnd));
  }

  const all = pools.uppercase + pools.lowercase + pools.digits + pools.special;
  while (chars.length < o.length) chars.push(pick(all, rnd));

  return shuffle(chars, rnd).join("");
}

/**
 * 密码熵（bit）= 长度 × log2(池大小)。
 *
 * 这是**上界**：最少数字/最少符号这类约束会缩小合法空间，真实熵略低于此值（14 位默认参数下
 * 差距不到 1 bit）。行业惯例按上界报，这里保持一致，但强度分档留了余量不吃这点误差。
 */
export function passwordEntropy(options: PasswordOptions = {}): number {
  const o = resolvePasswordOptions(options);
  const pools = buildPools(o);
  const size = (pools.uppercase + pools.lowercase + pools.digits + pools.special).length;
  return size > 1 ? o.length * Math.log2(size) : 0;
}

export interface ResolvedPassphraseOptions extends Required<Omit<PassphraseOptions, "wordlist">> {
  wordlist: readonly string[];
}

export function resolvePassphraseOptions(
  options: PassphraseOptions = {},
): ResolvedPassphraseOptions {
  const wordlist =
    options.wordlist && options.wordlist.length > 0 ? options.wordlist : PASSPHRASE_WORDLIST;
  return {
    words: clamp(options.words ?? 6, WORDS_RANGE.min, WORDS_RANGE.max),
    separator: options.separator ?? "-",
    capitalize: options.capitalize ?? false,
    includeNumber: options.includeNumber ?? false,
    wordlist,
  };
}

/** 生成密码短语，如 `harbor-lantern-quiet-maple7-drift`。 */
export function generatePassphrase(
  options: PassphraseOptions = {},
  rnd: RandomInt = randomInt,
): string {
  const o = resolvePassphraseOptions(options);
  const words: string[] = [];
  for (let i = 0; i < o.words; i++) {
    const w = o.wordlist[rnd(o.wordlist.length)] ?? "";
    words.push(o.capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w);
  }
  if (o.includeNumber && words.length > 0) {
    const at = rnd(words.length);
    words[at] += String(rnd(10));
  }
  return words.join(o.separator);
}

/**
 * 短语熵（bit）= 词数 × log2(词库大小)，附加数字再加 log2(词数 × 10)。
 * capitalize 不计入——它是确定性变换，不增加候选空间。
 */
export function passphraseEntropy(options: PassphraseOptions = {}): number {
  const o = resolvePassphraseOptions(options);
  const unique = new Set(o.wordlist).size; // 词库有重复词时按去重后的规模算，不虚报
  if (unique < 2) return 0;
  const base = o.words * Math.log2(unique);
  return o.includeNumber ? base + Math.log2(o.words * 10) : base;
}

export function strengthOf(entropy: number): StrengthLevel {
  if (entropy >= STRENGTH_THRESHOLDS.strong) return "strong";
  if (entropy >= STRENGTH_THRESHOLDS.good) return "good";
  if (entropy >= STRENGTH_THRESHOLDS.fair) return "fair";
  return "weak";
}

/** 一次生成 + 度量。组件内部走的就是这个入口。 */
export function generateSecret(
  mode: "password",
  options: PasswordOptions,
  rnd?: RandomInt,
): GeneratedSecret;
export function generateSecret(
  mode: "passphrase",
  options: PassphraseOptions,
  rnd?: RandomInt,
): GeneratedSecret;
export function generateSecret(
  mode: "password" | "passphrase",
  options: PasswordOptions & PassphraseOptions = {},
  rnd: RandomInt = randomInt,
): GeneratedSecret {
  const value =
    mode === "password" ? generatePassword(options, rnd) : generatePassphrase(options, rnd);
  const entropy = mode === "password" ? passwordEntropy(options) : passphraseEntropy(options);
  return { value, mode, entropy, strength: strengthOf(entropy) };
}
