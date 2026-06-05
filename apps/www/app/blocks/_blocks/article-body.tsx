import { Avatar, Heading, Prose, Tag, Text } from "@hulianui/ui";

export function ArticleBodyBlock() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-3xl">
        {/* 文章头 */}
        <div className="flex flex-col gap-5">
          <Tag variant="soft" tone="brand" size="sm">
            弹性算力
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance className="text-foreground">
            我们如何把冷启动从 1.8s 砍到 400ms
          </Heading>
          <div className="flex flex-wrap items-center gap-2">
            <Avatar size="sm" fallback="周" />
            <Text size="sm" className="text-foreground">
              周慕白
            </Text>
            <Text size="sm" tone="muted">
              ·
            </Text>
            <Text size="sm" tone="muted">
              2026 年 5 月 14 日
            </Text>
            <Text size="sm" tone="muted">
              ·
            </Text>
            <Text size="sm" tone="muted">
              约 9 分钟阅读
            </Text>
          </div>
          <div
            className="aspect-[2/1] rounded-[var(--radius-sm,0.5rem)] bg-gradient-to-br from-primary/30 via-accent/15 to-bg"
            aria-hidden
          />
        </div>

        {/* 正文 */}
        <Prose className="mt-10">
          <p>
            冷启动一直是函数计算绕不开的话题。当一个长期空闲的函数突然被触发，用户要为运行时初始化、依赖加载与网络握手买单。在瀚云早期，这个数字稳定在
            1.8 秒左右——足以让一次交互显得迟钝。下面是我们把它压到 400 毫秒的完整过程。
          </p>

          <h2>从一条火焰图开始</h2>
          <p>
            优化的第一步永远是测量。我们为冷启动路径埋了细粒度的 span，把 1.8 秒拆成了几个清晰的阶段：镜像拉取、运行时初始化、依赖解析与用户代码执行。出乎意料的是，真正的大头并不在用户代码里。
          </p>
          <ul>
            <li>镜像拉取与解压：约 700ms，全程串行等待</li>
            <li>运行时初始化：约 600ms，每次都从零构建</li>
            <li>依赖解析：约 350ms，重复读取相同的模块</li>
            <li>用户代码首次执行：约 150ms</li>
          </ul>

          <h2>三管齐下</h2>
          <p>
            定位之后，我们没有寻找银弹，而是针对每个阶段各自下手：镜像分层让公共基底层可被复用并提前驻留；预热池在低峰期维持一小批已初始化的实例；运行时快照则把初始化后的内存状态冻结，下次直接恢复，跳过整段冷初始化。
          </p>

          <blockquote>
            性能优化没有魔法，只有把每一毫秒花在哪里看清楚，然后逐段把它拿回来。
          </blockquote>

          <p>
            其中收益最大的是运行时快照。它的核心思路是把进程在"初始化完成、即将处理第一个请求"的瞬间整体保存，恢复时无需重跑任何初始化逻辑：
          </p>
          <pre>
            <code>{`// 在初始化完成点冻结运行时状态
const snapshot = await runtime.snapshot();
await store.put(fnId, snapshot);

// 冷启动时直接恢复，跳过初始化
const restored = await runtime.restore(snapshot);
return restored.handle(request);`}</code>
          </pre>

          <h2>结果</h2>
          <p>
            三项叠加之后，P50 冷启动落在 400 毫秒以内，P99 也稳定在 700 毫秒上下。更重要的是，这条路径现在可观测、可回归——任何一次劣化都会在监控里立刻显形。这才是我们真正想要的护栏。
          </p>
        </Prose>
      </div>
    </section>
  );
}
