// LaTeX 命令 → Unicode 符号表。
//
// 取值范围不是拍脑袋定的：对 22k 字符的真实初中数学题面（PaddleOCR-VL 识别产物）
// 做过命令频次统计，按实际出现的 34 个命令建表，覆盖到长尾。
// 频次前列：\angle 140 · \frac 99 · \circ 80 · \triangle 60 · \sqrt 55 · \times 51。
//
// 表里没有的命令一律按字面保留（界面上看得见 `\foo`），绝不静默吞掉 ——
// 吞掉会让题面缺一块而没人察觉，露出来至少能被发现并回来补表。

/** 直接替换成单个字符的命令。 */
export const MATH_SYMBOLS: Record<string, string> = {
  // 几何
  angle: "∠",
  triangle: "△",
  parallel: "∥",
  perp: "⊥",
  cong: "≌",
  sim: "∽",
  odot: "⊙",
  square: "□",
  circ: "°",
  prime: "′",
  // 运算与关系
  times: "×",
  div: "÷",
  cdot: "·",
  pm: "±",
  mp: "∓",
  neq: "≠",
  ne: "≠",
  leq: "≤",
  le: "≤",
  geq: "≥",
  ge: "≥",
  leqslant: "≤",
  geqslant: "≥",
  approx: "≈",
  equiv: "≡",
  propto: "∝",
  infty: "∞",
  // 希腊字母
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  theta: "θ",
  lambda: "λ",
  mu: "μ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  omega: "ω",
  Delta: "Δ",
  Omega: "Ω",
  // 集合与逻辑
  in: "∈",
  notin: "∉",
  subset: "⊂",
  subseteq: "⊆",
  cup: "∪",
  cap: "∩",
  varnothing: "∅",
  emptyset: "∅",
  // 省略与箭头
  ldots: "…",
  cdots: "…",
  dots: "…",
  therefore: "∴",
  because: "∵",
  rightarrow: "→",
  Rightarrow: "⇒",
  leftrightarrow: "↔",
  // 函数名按字面输出（数学惯例是正体）
  sin: "sin",
  cos: "cos",
  tan: "tan",
  cot: "cot",
  log: "log",
  ln: "ln",
};

/** 取一个参数、把参数当普通文本吐出的包装命令（\text{甲} → 甲）。 */
export const UNWRAP_COMMANDS = new Set(["text", "mathrm", "mathbf", "operatorname", "mbox"]);

/** 取一个参数、给参数加装饰线的命令。 */
export const DECORATE_COMMANDS: Record<string, "overline" | "hat"> = {
  overline: "overline",
  bar: "overline",
  widehat: "hat",
  hat: "hat",
};

/** 只影响定界符大小、不影响语义的命令，直接丢弃命令本身保留后面的符号。 */
export const SIZING_COMMANDS = new Set(["left", "right", "big", "Big", "bigg", "Bigg"]);

/** 纯排版空白。 */
export const SPACING_COMMANDS: Record<string, string> = {
  quad: " ",
  qquad: "  ",
  ",": " ",
  ";": " ",
  " ": " ",
};
