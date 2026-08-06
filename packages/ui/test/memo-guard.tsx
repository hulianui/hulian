import { cloneElement, Profiler, type ReactElement } from "react";
import { act, render } from "@testing-library/react";
import { expect, vi } from "vitest";

/**
 * memo 护栏的统一判据：**父级稳定更新时，被测子树必须整棵 bail out**。
 *
 * 为什么放在 `test/` 而不是 `src/`：`package.json` 的 `files` 只收 `src` 与几个具名
 * 文件，放进 `src` 会被一起发进 npm 包；vitest 的 include 又是 `src/**\/*.test.{ts,tsx}`，
 * 放 `test/` 也不会被当成测试文件收集。两条都实测过。
 *
 * ## 判据：与「同一棵树被迫重渲一次要多久」比，而不是与 React 的 baseDuration 比
 *
 * 早先的写法是 `actualDuration < baseDuration * 0.1`，两个数的冷热状态不同：分子是本次
 * update 的实测耗时，分母 `baseDuration` 是该 fiber **上一次完整渲染**的估算 —— memo bail 之后
 * 它不再更新，实际停在挂载那一次的**冷**成本。于是比值随「这条测试在文件里排第几」漂移，
 * 两端都能假：`Kbd` 作为文件首个 render 时冷启动把分子顶到 4.94ms（假红）；`StatusDot` 实测
 * memo 生效 0.035–0.045、剥掉 memo 0.385–0.501，系数放到 0.5 就变成真·假绿（hulianui/hulian#106）。
 * 根子上的毛病是**动态范围只有 ~2.5 倍**，阈值不管取哪个都贴着边。
 *
 * 现在的分母由同一条测试现场测出：给被测元素补一个每轮都变的 `data-memo-probe`，memo 的浅比较
 * 必然失配 → 这一轮不可能 bail，它的耗时就是「没有 memo 时这次更新要花多少」。于是：
 *
 *   - memo 生效：稳定更新走 bail（~0.004ms），对照走完整更新（~0.03ms）→ 比值实测 0.01–0.19
 *   - memo 失效：两个相位是同一件事 → 比值 ≈ 1.0
 *
 * 两簇之间隔着约 5 倍，阈值 0.5 上下各留 2 倍以上。分子分母同机器、同 JIT 冷热、同文件位置，
 * 因此不再需要为每个组件各自拍系数，护栏也不再依赖排在 describe 首条。
 *
 * 两个相位各自连续采样后取**中位数**：GC / 调度噪声只制造尖刺（Kbd 实测 min 0.005 / med 0.006 /
 * max 0.016），中位数对尖刺免疫，又不像最小值那样在 memo 失效时可能撞出偏低的比值。
 * 两个相位必须**分段跑完**再换 —— 交替跑会让重渲的余波污染下一轮稳定更新的读数（实测把
 * bail 相位从 0.006 抬到 0.5）。
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
 * @param options.rounds 每个相位的采样轮数，默认 7。仍然抖动就加大轮数，不要放宽 ratio。
 * @param options.ratio bail 耗时相对「被迫重渲」耗时的上限比例，默认 0.5
 *   （两簇分别在 ~0.1 与 ~1.0，取中）。要调高必须在调用处附上该组件的实测数据。
 */
export async function expectMemoSkipsSubtree(
  element: () => ReactElement,
  options?: { rounds?: number; ratio?: number; structural?: boolean },
): Promise<void> {
  const rounds = options?.rounds ?? 7;
  const ratio = options?.ratio ?? 0.5;

  // 第一层是**不依赖时间**的：被测元素的类型必须真的是 memo 包出来的。
  // memo 被误删时这条立刻红，且判据是确定的，不受机器负载、JIT 冷热、用例位置影响。
  // 下面的耗时断言是第二层 —— 它抓的是另一类失败：memo 还在，但 props 每轮都换新引用
  // 导致 bail 不掉。两层缺一不可（picker-performance.test.tsx 早先就是这么分层的）。
  // structural: false 用于「被测根元素本身不是 memo、真正被 memo 的是它内部某层」的少数场景。
  if (options?.structural !== false) {
    const probe = element();
    expect(
      (probe.type as { $$typeof?: symbol })?.$$typeof,
      "被测元素的类型不是 memo 包出来的 —— memo 被删了，或者护栏测错了元素",
    ).toBe(Symbol.for("react.memo"));
  }
  const onRender = vi.fn();
  // probe 为 undefined 时 props 逐轮全等 → memo 应当 bail；给上每轮都变的 data-memo-probe 后
  // 浅比较必然失配 → 拿到「没有 memo 时这次更新要花多少」。data-* 任何组件都能安全接住。
  const tree = (version: number, probe?: number) => (
    <div data-parent-version={String(version)}>
      <Profiler id="memo-guard" onRender={onRender}>
        {probe === undefined
          ? element()
          : // 被测元素的 props 类型是 unknown（工厂函数返回 ReactElement），cloneElement 的重载
            // 因此认不出 data-* —— 这里的目的本就是「塞一个组件不认识的 prop 让浅比较失配」。
            cloneElement(element(), { "data-memo-probe": probe } as Record<string, unknown>)}
      </Profiler>
    </div>
  );

  const { rerender, unmount } = render(tree(0));
  await act(async () => undefined);

  const sample = async (version: number, probe?: number) => {
    onRender.mockClear();
    rerender(tree(version, probe));
    await act(async () => undefined);
    // 取该轮的**第一次**提交：父级更新本身。有些组件在被迫重渲后会 setState 追加一次
    // `nested-update` 提交（IssueReporter 就是），那是级联的次生工作，把它算进来会悄悄放大
    // 分母、削弱护栏；只比较两个相位的直接更新才是同一件事对同一件事。
    const commit = onRender.mock.calls[0];
    expect(commit?.[1], `第 ${version} 轮不是 update 提交，护栏没测到父级更新`).toBe("update");
    return commit?.[2] as number;
  };

  await sample(-1); // 丢弃首轮：它背着这条测试自己的 JIT 冷启动成本

  const bailed: number[] = [];
  for (let round = 1; round <= rounds; round += 1) bailed.push(await sample(round));
  const forced: number[] = [];
  for (let round = 1; round <= rounds; round += 1) forced.push(await sample(1000 + round, round));
  unmount();

  const median = (list: number[]) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)];
  const medBailed = median(bailed);
  const medForced = median(forced);
  const fmt = (list: number[]) => list.map((n) => n.toFixed(3)).join(", ");
  expect(
    medBailed,
    `子树没有 bail out：稳定父更新耗时中位数 ${medBailed.toFixed(3)}ms，` +
      `需 < 被迫重渲中位数 ${medForced.toFixed(3)}ms × ${ratio}（memo 失效时两者应当相当）。` +
      `\n  稳定父更新: [${fmt(bailed)}]\n  被迫重渲:   [${fmt(forced)}]`,
  ).toBeLessThan(medForced * ratio);
}
