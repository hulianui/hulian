import { describe, it, expect, vi, afterEach } from "vitest";
import {
  AMBIGUOUS,
  CHARSET,
  buildPools,
  generatePassphrase,
  generatePassword,
  generateSecret,
  passphraseEntropy,
  passwordEntropy,
  randomInt,
  resolvePassphraseOptions,
  resolvePasswordOptions,
  shuffle,
  strengthOf,
} from "./password-generator.core";
import { PASSPHRASE_WORDLIST } from "./password-generator.wordlist";

/** 确定性随机源：按给定序列循环吐值（对 max 取模保证落在合法区间）。 */
function seq(...values: number[]) {
  let i = 0;
  return (max: number) => values[i++ % values.length] % max;
}

describe("randomInt（默认 crypto 源）", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("max=1 恒返回 0，且不消耗随机数", () => {
    const getRandomValues = vi.fn();
    vi.stubGlobal("crypto", { getRandomValues });
    expect(randomInt(1)).toBe(0);
    expect(getRandomValues).not.toHaveBeenCalled();
  });

  it("落在 [0, max) 区间内", () => {
    for (let i = 0; i < 200; i++) {
      const v = randomInt(7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
    }
  });

  it("拒绝采样：落在模偏尾巴里的取值被丢弃重抽", () => {
    // max=10 时 limit = 2^32 - 6，落在 [limit, 2^32) 的 6 个值必须重抽，否则 0..5 会多分到一次机会
    const limit = 4294967296 - (4294967296 % 10);
    const feed = [limit, limit + 5, 42]; // 前两个都在尾巴里
    const getRandomValues = vi.fn((buf: Uint32Array) => {
      buf[0] = feed.shift() ?? 0;
      return buf;
    });
    vi.stubGlobal("crypto", { getRandomValues });
    expect(randomInt(10)).toBe(2); // 42 % 10
    expect(getRandomValues).toHaveBeenCalledTimes(3);
  });

  it("分布大体均匀（1000 次落 4 个桶，各桶不低于期望的一半）", () => {
    const hits = [0, 0, 0, 0];
    for (let i = 0; i < 1000; i++) hits[randomInt(4)]++;
    for (const h of hits) expect(h).toBeGreaterThan(125);
  });

  it("非正整数入参直接报错，不静默兜底", () => {
    expect(() => randomInt(0)).toThrow(RangeError);
    expect(() => randomInt(-3)).toThrow(RangeError);
    expect(() => randomInt(2.5)).toThrow(RangeError);
  });

  it("环境无 crypto 时抛错，不降级到 Math.random", () => {
    vi.stubGlobal("crypto", undefined);
    expect(() => randomInt(10)).toThrow(/crypto\.getRandomValues/);
  });
});

describe("shuffle", () => {
  it("不改原数组，元素集合不变", () => {
    const src = [1, 2, 3, 4, 5];
    const out = shuffle(src, seq(2, 0, 1, 0));
    expect(src).toEqual([1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("给定随机序列 → 确定输出", () => {
    // Fisher-Yates 恒取 j=0：i=2 换 a↔c 得 c,b,a；i=1 换 c↔b 得 b,c,a
    expect(shuffle(["a", "b", "c"], () => 0)).toEqual(["b", "c", "a"]);
  });
});

describe("resolvePasswordOptions", () => {
  it("clamp 长度到 5–128", () => {
    expect(resolvePasswordOptions({ length: 1 }).length).toBe(5);
    expect(resolvePasswordOptions({ length: 999 }).length).toBe(128);
  });

  it("四类全关时回落到小写，不产出空池", () => {
    const o = resolvePasswordOptions({
      uppercase: false,
      lowercase: false,
      digits: false,
      special: false,
    });
    expect(o.lowercase).toBe(true);
    expect(buildPools(o).lowercase).toBe(CHARSET.lowercase);
  });

  it("勾选即保证出现：启用类别的下限至少 1", () => {
    const o = resolvePasswordOptions({ minDigits: 0, minSpecial: 0 });
    expect(o.minima.digits).toBe(1);
    expect(o.minima.special).toBe(1);
  });

  it("关闭的类别下限归零", () => {
    const o = resolvePasswordOptions({ digits: false, special: false, minDigits: 5 });
    expect(o.minima.digits).toBe(0);
    expect(o.minima.special).toBe(0);
  });

  it("下限总和超长度时从符号、数字依次回退到 1", () => {
    const o = resolvePasswordOptions({ length: 5, minDigits: 9, minSpecial: 9 });
    const { uppercase, lowercase, digits, special } = o.minima;
    expect(uppercase + lowercase + digits + special).toBeLessThanOrEqual(5);
    expect(digits).toBeGreaterThanOrEqual(1);
    expect(special).toBeGreaterThanOrEqual(1);
  });
});

describe("generatePassword", () => {
  it("长度与请求一致", () => {
    for (const length of [5, 14, 64, 128]) {
      expect(generatePassword({ length })).toHaveLength(length);
    }
  });

  it("每个启用类别都真的出现，且满足最少个数", () => {
    for (let i = 0; i < 50; i++) {
      const pw = generatePassword({ length: 16, minDigits: 3, minSpecial: 2 });
      expect(pw).toMatch(/[A-Z]/);
      expect(pw).toMatch(/[a-z]/);
      expect(pw.replace(/[^0-9]/g, "").length).toBeGreaterThanOrEqual(3);
      expect([...pw].filter((c) => CHARSET.special.includes(c)).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("关闭的类别一个都不出现", () => {
    for (let i = 0; i < 30; i++) {
      const pw = generatePassword({ length: 20, uppercase: false, special: false });
      expect(pw).not.toMatch(/[A-Z]/);
      expect([...pw].some((c) => CHARSET.special.includes(c))).toBe(false);
    }
  });

  it("avoidAmbiguous 剔除 Il1O0o", () => {
    for (let i = 0; i < 50; i++) {
      const pw = generatePassword({ length: 32, avoidAmbiguous: true });
      expect([...pw].some((c) => AMBIGUOUS.includes(c))).toBe(false);
    }
  });

  it("下限字符被洗散，不固定堆在开头", () => {
    // 不洗牌的话前 4 位永远是「大写 小写 数字 符号」，位置可预测 = 搜索空间被裁剪
    const heads = new Set<string>();
    for (let i = 0; i < 60; i++) heads.add(generatePassword({ length: 12 })[0]);
    const kinds = new Set(
      [...heads].map((c) =>
        /[A-Z]/.test(c) ? "U" : /[a-z]/.test(c) ? "L" : /[0-9]/.test(c) ? "D" : "S",
      ),
    );
    expect(kinds.size).toBeGreaterThan(1);
  });

  it("注入随机源 → 输出确定可复现", () => {
    const a = generatePassword({ length: 10 }, seq(0, 1, 2, 3, 4));
    const b = generatePassword({ length: 10 }, seq(0, 1, 2, 3, 4));
    expect(a).toBe(b);
  });

  it("连续两次真实生成不重复", () => {
    expect(generatePassword({ length: 20 })).not.toBe(generatePassword({ length: 20 }));
  });
});

describe("passwordEntropy", () => {
  it("默认参数（14 位 × 70 池）约 85.8 bit", () => {
    expect(passwordEntropy()).toBeCloseTo(14 * Math.log2(70), 5);
  });

  it("只留小写时池 26", () => {
    const o = { length: 10, uppercase: false, digits: false, special: false };
    expect(passwordEntropy(o)).toBeCloseTo(10 * Math.log2(26), 5);
  });

  it("avoidAmbiguous 让熵下降（池变小）", () => {
    expect(passwordEntropy({ length: 14, avoidAmbiguous: true })).toBeLessThan(passwordEntropy());
  });

  it("长度翻倍熵翻倍", () => {
    expect(passwordEntropy({ length: 32 })).toBeCloseTo(passwordEntropy({ length: 16 }) * 2, 5);
  });
});

describe("generatePassphrase", () => {
  it("词数与分隔符生效", () => {
    const p = generatePassphrase({ words: 4, separator: "." });
    expect(p.split(".")).toHaveLength(4);
  });

  it("词数 clamp 到 3–20", () => {
    expect(generatePassphrase({ words: 1 }).split("-")).toHaveLength(3);
    expect(generatePassphrase({ words: 99 }).split("-")).toHaveLength(20);
  });

  it("capitalize 只大写首字母", () => {
    const p = generatePassphrase({ words: 3, capitalize: true });
    for (const w of p.split("-")) expect(w).toMatch(/^[A-Z][a-z]+$/);
  });

  it("includeNumber 在某个词尾追加一位数字", () => {
    const p = generatePassphrase({ words: 4, includeNumber: true });
    expect(p.replace(/[^0-9]/g, "")).toHaveLength(1);
    expect(p).toMatch(/[a-z]\d(-|$)/);
  });

  it("自定义词库只从该词库取词", () => {
    const p = generatePassphrase({ words: 5, wordlist: ["山", "海", "风"] });
    for (const w of p.split("-")) expect(["山", "海", "风"]).toContain(w);
  });

  it("空词库回落到内置表，不产出空串", () => {
    const p = generatePassphrase({ words: 3, wordlist: [] });
    for (const w of p.split("-")) expect(w.length).toBeGreaterThan(0);
  });
});

describe("passphraseEntropy", () => {
  it("词数 × log2(词库大小)", () => {
    expect(passphraseEntropy({ words: 6 })).toBeCloseTo(6 * Math.log2(PASSPHRASE_WORDLIST.length), 5);
  });

  it("capitalize 不加熵（确定性变换）", () => {
    expect(passphraseEntropy({ words: 5, capitalize: true })).toBe(passphraseEntropy({ words: 5 }));
  });

  it("includeNumber 加上位置 × 数字的熵", () => {
    const base = passphraseEntropy({ words: 5 });
    expect(passphraseEntropy({ words: 5, includeNumber: true })).toBeCloseTo(
      base + Math.log2(50),
      5,
    );
  });

  it("词库有重复词时按去重规模算，不虚报", () => {
    const dup = passphraseEntropy({ words: 4, wordlist: ["a", "b", "a", "b"] });
    expect(dup).toBeCloseTo(4 * Math.log2(2), 5);
  });

  it("词库不足 2 词时熵为 0", () => {
    expect(passphraseEntropy({ words: 5, wordlist: ["only"] })).toBe(0);
  });
});

describe("strengthOf", () => {
  it.each([
    [0, "weak"],
    [35.9, "weak"],
    [36, "fair"],
    [59.9, "fair"],
    [60, "good"],
    [99.9, "good"],
    [100, "strong"],
  ] as const)("%s bit → %s", (bits, level) => {
    expect(strengthOf(bits)).toBe(level);
  });
});

describe("generateSecret", () => {
  it("密码模式带回熵与分档", () => {
    const r = generateSecret("password", { length: 20 });
    expect(r.mode).toBe("password");
    expect(r.value).toHaveLength(20);
    expect(r.entropy).toBeGreaterThan(100);
    expect(r.strength).toBe("strong");
  });

  it("短语模式 3 词就是弱（32 bit），6 词才够，8 词很强", () => {
    // 这条断言是给使用者看的：短语看着长不等于熵高，词数才是唯一变量
    expect(generateSecret("passphrase", { words: 3 }).strength).toBe("weak");
    expect(generateSecret("passphrase", { words: 6 }).strength).toBe("good");
    expect(generateSecret("passphrase", { words: 10 }).strength).toBe("strong");
  });
});

describe("内置词库", () => {
  it("无重复词（重复会让实际熵低于账面值）", () => {
    expect(new Set(PASSPHRASE_WORDLIST).size).toBe(PASSPHRASE_WORDLIST.length);
  });

  it("全为 3–8 个小写字母", () => {
    for (const w of PASSPHRASE_WORDLIST) expect(w).toMatch(/^[a-z]{3,8}$/);
  });

  it("规模足够：单词熵不低于 10 bit", () => {
    expect(Math.log2(PASSPHRASE_WORDLIST.length)).toBeGreaterThanOrEqual(10);
  });
});
