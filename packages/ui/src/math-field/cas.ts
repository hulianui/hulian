// 第 3 档判分比较器：交给 Compute Engine 判两个 LaTeX 是否数学等价。
// 只在 @hulianui/ui/math-field 这条 subpath 导出 —— Compute Engine 不随 mathlive 打包
// （mathlive 只通过 globalThis[Symbol.for("io.cortexjs.compute-engine")] 找它），
// 所以这里自己 import()，并把它声明成第二个 optional peer。
//
// 判分 SSOT 仍在服务端（见 question/grade.ts 顶部）：这个比较器给的是即时反馈与录题自测。

export const COMPUTE_ENGINE_INSTALL_HINT = "pnpm add mathlive @cortex-js/compute-engine";

interface BoxedLike {
  readonly isValid: boolean;
  isSame(rhs: BoxedLike): boolean;
  isEqual(rhs: BoxedLike): boolean | undefined;
}
interface ComputeEngineLike {
  parse(latex: string): BoxedLike;
}
type ComputeEngineCtor = new () => ComputeEngineLike;

export class ComputeEngineUnavailableError extends Error {
  constructor(cause?: unknown) {
    super(`[瑚琏] createCasComparator 需要安装 @cortex-js/compute-engine：${COMPUTE_ENGINE_INSTALL_HINT}`, { cause });
    this.name = "ComputeEngineUnavailableError";
  }
}

/** 剥掉 `$…$` / `$$…$$` / `\(…\)` 并 trim；比较器收到的是学生原样输入，可能带定界符。 */
export function stripMathDelimiters(text: string): string {
  let s = text.trim();
  if (s.startsWith("$$") && s.endsWith("$$") && s.length >= 4) s = s.slice(2, -2);
  else if (s.startsWith("$") && s.endsWith("$") && s.length >= 2) s = s.slice(1, -1);
  else if (s.startsWith("\\(") && s.endsWith("\\)") && s.length >= 4) s = s.slice(2, -2);
  return s.trim();
}

let pending: Promise<ComputeEngineLike> | null = null;

function loadComputeEngine(): Promise<ComputeEngineLike> {
  if (pending) return pending;
  // then().catch() 而不是 then(onOk, onErr)：成功路径里抛的错（含 mock 代理对缺失导出直接 throw）也要归成「不可用」。
  const attempt = import("@cortex-js/compute-engine")
    .then((mod: unknown) => {
      const ctor = (mod as { ComputeEngine?: unknown }).ComputeEngine;
      if (typeof ctor !== "function") throw new ComputeEngineUnavailableError("module resolved without ComputeEngine");
      return new (ctor as ComputeEngineCtor)();
    })
    .catch((error: unknown) => {
      throw error instanceof ComputeEngineUnavailableError ? error : new ComputeEngineUnavailableError(error);
    });
  pending = attempt;
  attempt.catch(() => {
    if (pending === attempt) pending = null;
  });
  return attempt;
}

/**
 * 返回一个同步比较器，直接喂 `gradeObjective(question, answer, { equivalent })`。
 * 解析失败、空串、任何异常一律 `false`（判分宁可漏判不可误判）。
 */
export async function createCasComparator(): Promise<(a: string, b: string) => boolean> {
  const ce = await loadComputeEngine();
  return (a, b) => {
    const left = stripMathDelimiters(a);
    const right = stripMathDelimiters(b);
    if (left === "" || right === "") return false;
    try {
      const x = ce.parse(left);
      const y = ce.parse(right);
      if (!x.isValid || !y.isValid) return false;
      if (x.isSame(y)) return true;
      return x.isEqual(y) === true;
    } catch {
      return false;
    }
  };
}

/** 测试专用。 */
export function resetComputeEngineForTests(): void {
  pending = null;
}
