// MathLive 的唯一加载点。组件与比较器都不静态 import "mathlive"：
//   1. mathlive 是 optional peer，静态 import 会让没装它的消费方在打包期就炸；
//   2. exports 的 node 条件解析到 SSR 构建（没有 MathfieldElement），只能在浏览器里动态取；
//   3. 体积：动态 import 让打包器把 MathLive 切成独立 chunk，@hulianui/ui/math-field 的 initial 只剩壳。

export const MATHLIVE_INSTALL_HINT = "pnpm add mathlive";

/** 组件用到的 MathfieldElement 实例面。收敛成结构化接口，对外类型不引用 mathlive。 */
export interface MathfieldLike extends HTMLElement {
  getValue(format?: string): string;
  setValue(value: string, options?: { silenceNotifications?: boolean }): void;
  disabled: boolean;
  readOnly: boolean;
  placeholder: string;
  mathVirtualKeyboardPolicy: "auto" | "manual" | "sandboxed";
  menuItems: readonly unknown[];
}

export type MathfieldCtor = (new () => MathfieldLike) & {
  soundsDirectory: string | null;
  fontsDirectory: string | null;
};

export interface MathLiveModule {
  MathfieldElement: MathfieldCtor;
}

export class MathLiveUnavailableError extends Error {
  constructor(cause?: unknown) {
    super(`[瑚琏] MathField 需要安装 mathlive：${MATHLIVE_INSTALL_HINT}`, { cause });
    this.name = "MathLiveUnavailableError";
  }
}

let pending: Promise<MathLiveModule> | null = null;

/**
 * 加载并初始化 MathLive。同一页面只跑一次；失败不缓存（装好依赖热更新后能恢复）。
 * 只能在浏览器调用（组件在 useEffect 里调）。
 */
export function loadMathLive(): Promise<MathLiveModule> {
  if (pending) return pending;
  // 成功路径里的任何异常（包括 vitest 的 mock 代理对缺失导出直接 throw）也一律归成「不可用」，
  // 所以是 then().catch() 而不是 then(onOk, onErr)：后者接不住 onOk 自己抛的错。
  const attempt = import("mathlive")
    .then((mod: unknown) => {
      const ctor = (mod as { MathfieldElement?: unknown }).MathfieldElement;
      // node 条件解析到的 SSR 构建没有这个类；坏包同理。
      if (typeof ctor !== "function") throw new MathLiveUnavailableError("mathlive resolved without MathfieldElement");
      const element = ctor as MathfieldCtor;
      // 音效不要；字体交给消费方 import "mathlive/fonts.css"（null = 不自行加载，缺字体只是回退不是白屏）。
      element.soundsDirectory = null;
      element.fontsDirectory = null;
      if (!customElements.get("math-field")) {
        customElements.define("math-field", element as unknown as CustomElementConstructor);
      }
      return { MathfieldElement: element };
    })
    .catch((error: unknown) => {
      throw error instanceof MathLiveUnavailableError ? error : new MathLiveUnavailableError(error);
    });
  pending = attempt;
  attempt.catch(() => {
    if (pending === attempt) pending = null;
  });
  return attempt;
}

/** 测试专用：清掉缓存的 promise（自定义元素注册表本身清不掉，测试里用同一个假类）。 */
export function resetMathLiveLoaderForTests(): void {
  pending = null;
}
