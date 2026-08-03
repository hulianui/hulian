// LaTeX 命令 → Unicode 符号表。
//
// 取值范围不是拍脑袋定的：对 22k 字符的真实初中数学题面（PaddleOCR-VL 识别产物）
// 做过命令频次统计，按实际出现的 34 个命令建表，覆盖到长尾。
// 频次前列：\angle 140 · \frac 99 · \circ 80 · \triangle 60 · \sqrt 55 · \times 51。
//
// 第二轮（2026-08）把样本口径从初中扩到全学段：1324 道题的题干 + 解析（PaddleOCR-VL 与
// moonshot vision 对上海/杭州真卷的转录）。向量与集合/逻辑记号是高中的主力，初中样本里
// 几乎不出现，上一轮因此看不到 —— 补入的频次前列：
// \overrightarrow 169 · \vec 113 · \Rightarrow 52 · \mathbb 16 · \Leftrightarrow 10。
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
  backsim: "∽",
  // 集合构建式 {x ∣ x>0} 的竖线是关系符 U+2223，不是键盘上的 ASCII 竖线
  mid: "∣",
  langle: "⟨",
  rangle: "⟩",
  // \frown 单独出现时是弧符号；「弧 AB」的规范写法是 \overset{\frown}{AB}
  frown: "⌢",
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
  varphi: "φ",
  Delta: "Δ",
  Gamma: "Γ",
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
  forall: "∀",
  // 省略与箭头
  ldots: "…",
  cdots: "…",
  dots: "…",
  therefore: "∴",
  because: "∵",
  rightarrow: "→",
  to: "→",
  Rightarrow: "⇒",
  leftrightarrow: "↔",
  Leftrightarrow: "⇔",
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
export const DECORATE_COMMANDS: Record<string, "overline" | "hat" | "arrow" | "underline"> = {
  overline: "overline",
  bar: "overline",
  widehat: "hat",
  hat: "hat",
  // TeX 里 \vec 是定宽短箭头、\overrightarrow 才满宽；这里两者都按内容宽度自适应。
  // 题面场景下两个记号都指向量，宽度差异没有信息量，而自适应能让 \vec{AB} 也盖得住。
  vec: "arrow",
  overrightarrow: "arrow",
  underline: "underline",
};

/**
 * \mathbb{R} → ℝ。剥壳成裸 `R` 是不行的：题面里实数集 ℝ 与变量 R 是两个东西，
 * 剥成同一个字母会让「定义域为 ℝ」读起来像「定义域为 R」。
 * C/H/N/P/Q/R/Z 用 BMP 的字母式符号（字体覆盖最广），其余落 SMP 的数学字母区。
 */
export const BLACKBOARD_LETTERS: Record<string, string> = {
  A: "𝔸",
  B: "𝔹",
  C: "ℂ",
  D: "𝔻",
  E: "𝔼",
  F: "𝔽",
  G: "𝔾",
  H: "ℍ",
  I: "𝕀",
  J: "𝕁",
  K: "𝕂",
  L: "𝕃",
  M: "𝕄",
  N: "ℕ",
  O: "𝕆",
  P: "ℙ",
  Q: "ℚ",
  R: "ℝ",
  S: "𝕊",
  T: "𝕋",
  U: "𝕌",
  V: "𝕍",
  W: "𝕎",
  X: "𝕏",
  Y: "𝕐",
  Z: "ℤ",
};

/**
 * LaTeX 里靠反斜杠转义的字面字符。
 * 与符号表不同，这是一个**有限闭集合**而非长尾，所以整套补齐、不按频次裁 ——
 * 漏掉一个就会在集合构建式 `\{x \mid x>0\}` 这类写法里露出反斜杠。
 */
export const ESCAPED_CHARS: Record<string, string> = {
  "{": "{",
  "}": "}",
  "%": "%",
  $: "$",
  "&": "&",
  "#": "#",
  _: "_",
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
