import { Profiler, type ReactElement } from "react";
import { act, render } from "@testing-library/react";
import { expect, vi } from "vitest";

/**
 * memo 护栏的统一判据：**父级稳定更新时，被测子树必须整棵 bail out**。
 *
 * 为什么放在 `test/` 而不是 `src/`：`package.json` 的 `files` 只收 `src` 与几个具名
 * 文件，放进 `src` 会被一起发进 npm 包；vitest 的 include 又是 `src/**\/*.test.{ts,tsx}`，
 * 放 `test/` 也不会被当成测试文件收集。两条都实测过。
 *
 * ## 判据：N 轮更新里取 actualDuration 的**最小值**
 *
 * 单轮读数不可靠 —— GC / 调度噪声会把某一轮的 `actualDuration` 从 0.05ms 尖刺到 1.7ms，
 * 并跑 47 个护栏文件时约 1/4 的运行会因此挂掉一条（假红）。
 *
 * 取最小值只压掉假红，不放宽假绿：**memo 真失效时每一轮都是完整渲染**，最快的那轮同样
 * 贴近 `baseDuration`，最小值一样过不了阈值。分母也取所有轮里 `baseDuration` 的最小值
 * （最严的取法 —— 用最大值会把阈值悄悄放宽）。
 *
 * 不要改成加大 `ratio` 来消抖：StatusDot 实测 memo 生效时比值 0.035–0.045、剥掉 memo 后
 * 0.385–0.501，`ratio` 放到 0.5 就变成真·假绿（见 issue #106）。
 *
 * ## 为什么 `element` 必须是工厂函数
 *
 * 每轮现造新元素。复用同一个元素对象时 React 靠 `oldProps === newProps` 自己就 bail out，
 * 删掉组件上的 `memo` 照样绿 —— 这是实测过的真·假绿，护栏会彻底失效。
 *
 * @example
 * it("稳定父更新时跳过标签子树", async () => {
 *   await expectMemoSkipsSubtree(() => <Chip tone="brand">稳定标签</Chip>);
 * });
 *
 * @param element 每轮现造被测元素的工厂函数。props 用稳定原语，别传每次新建的对象/函数。
 * @param options.rounds 采样轮数，默认 5。仍然抖动就加大轮数，不要放宽 ratio。
 * @param options.ratio actualDuration 相对 baseDuration 的上限比例，默认 0.1。
 *   要调高必须在调用处附上该组件的实测数据（memo 生效 / 剥掉 memo 两组比值）。
 */
export async function expectMemoSkipsSubtree(
  element: () => ReactElement,
  options?: { rounds?: number; ratio?: number },
): Promise<void> {
  const rounds = options?.rounds ?? 5;
  const ratio = options?.ratio ?? 0.1;
  const onRender = vi.fn();
  const tree = (version: number) => (
    <div data-parent-version={String(version)}>
      <Profiler id="memo-guard" onRender={onRender}>
        {element()}
      </Profiler>
    </div>
  );

  const { rerender, unmount } = render(tree(0));
  await act(async () => undefined);

  const actuals: number[] = [];
  const bases: number[] = [];
  for (let round = 1; round <= rounds; round += 1) {
    onRender.mockClear();
    rerender(tree(round));
    await act(async () => undefined);
    const update = onRender.mock.calls.at(-1);
    expect(update?.[1], `第 ${round} 轮不是 update 提交，护栏没测到父级更新`).toBe("update");
    actuals.push(update?.[2] as number);
    bases.push(update?.[3] as number);
  }
  unmount();

  const minActual = Math.min(...actuals);
  const minBase = Math.min(...bases);
  const fmt = (list: number[]) => list.map((n) => n.toFixed(3)).join(", ");
  expect(
    minActual,
    `子树没有 bail out：${rounds} 轮里最快的一轮 actualDuration=${minActual.toFixed(3)}ms，` +
      `需 < baseDuration 最小值 ${minBase.toFixed(3)}ms × ${ratio}。` +
      `\n  actualDuration: [${fmt(actuals)}]\n  baseDuration:   [${fmt(bases)}]`,
  ).toBeLessThan(minBase * ratio);
}
