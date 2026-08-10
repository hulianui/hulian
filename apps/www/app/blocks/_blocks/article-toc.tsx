/** @jsxImportSource ../../../lib/fixture-jsx */
import { Avatar, Heading, Prose, Tag, Text } from "@hulianui/ui";

// 长文 + 侧边目录 Block —— 自包含、可整段复制。
// 博客文章页的「长文指南」版式变体：左正文（Prose）+ 右 sticky 目录锚点导航。
// 与 article-body 的「叙事案例」版式互补。无 scrollspy（纯锚点跳转，跨滚动容器也稳），文案内联。

interface Toc {
  id: string;
  label: string;
}

const TOC: Toc[] = [
  { id: "prep", label: "1 · 连接代码仓库" },
  { id: "build", label: "2 · 零配置构建" },
  { id: "preview", label: "3 · 预览环境" },
  { id: "release", label: "4 · 渐进发布与回滚" },
  { id: "observe", label: "5 · 接上可观测" },
  { id: "secure", label: "6 · 守住安全底线" },
  { id: "summary", label: "小结" },
];

export function ArticleTocBlock() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-5xl">
        {/* 文章头 */}
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <Tag variant="soft" tone="brand" size="sm">
            部署指南
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance className="text-foreground">
            从零到生产：上线前的 6 个检查点
          </Heading>
          <div className="flex flex-wrap items-center gap-2">
            <Avatar size="sm" fallback="林" />
            <Text size="sm" className="text-foreground">
              林知远
            </Text>
            <Text size="sm" tone="muted">·</Text>
            <Text size="sm" tone="muted">2026 年 6 月 1 日</Text>
            <Text size="sm" tone="muted">·</Text>
            <Text size="sm" tone="muted">约 12 分钟阅读</Text>
          </div>
        </div>

        {/* 正文 + 侧边目录 */}
        <div className="mt-12 lg:grid lg:grid-cols-[1fr_200px] lg:gap-12">
          <article className="min-w-0">
            <Prose className="max-w-none">
              <p>
                把一个项目稳稳地送到生产，靠的不是某个银弹，而是一串被反复验证的检查点。这份指南把瀚云团队上线前会逐条过一遍的流程拆开，希望能帮你少踩几个坑。
              </p>

              <h2 id="prep">连接代码仓库</h2>
              <p>
                一切从仓库开始。授权瀚云访问你的 Git 仓库后，每一次 push 都会触发一条可追溯的流水线。建议先在一个非主分支上跑通，确认权限与 Webhook 都就位。
              </p>

              <h2 id="build">零配置构建</h2>
              <p>
                瀚云会自动识别框架并生成构建配置，大多数项目无需手写一行 CI。如果你的项目结构特殊，再用 <code>hancloud.json</code> 覆盖默认值即可——约定优先于配置。
              </p>

              <h2 id="preview">预览环境</h2>
              <p>
                每个 Pull Request 都会得到一个独立、带真实数据的预览环境。把链接贴进评审，让产品和设计在合并前就能点到真东西，而不是对着截图猜。
              </p>

              <h2 id="release">渐进发布与回滚</h2>
              <p>
                生产发布默认走渐进式：先放一小部分流量，盯住关键指标，确认无异常再全量。一旦告警触发，一键回滚到上一个健康版本，整个过程通常在数秒内完成。
              </p>

              <h2 id="observe">接上可观测</h2>
              <p>
                日志、指标与链路追踪开箱即用。上线第一天就把核心链路的 SLO 配好，让任何一次劣化都能在监控里立刻显形——可观测不是事后补的，而是发布的护栏。
              </p>

              <h2 id="secure">守住安全底线</h2>
              <p>
                所有密钥走托管而非硬编码，权限按最小化原则分配。传输全程加密，审计日志默认开启。安全应该是底座，而不是一个等着被打开的开关。
              </p>

              <h2 id="summary">小结</h2>
              <p>
                六个检查点串起来，就是一条可观测、可回滚、可信赖的上线路径。把它固化成团队的肌肉记忆，发布就会从一件提心吊胆的事，变成一件平平无奇的日常。
              </p>
            </Prose>
          </article>

          {/* sticky 目录 */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24">
              <Text size="xs" tone="muted" weight="medium" className="mb-3 uppercase tracking-wide">
                本文目录
              </Text>
              <ul className="flex flex-col gap-2 border-l border-border">
                {TOC.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className="-ml-px block border-l-2 border-transparent pl-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                    >
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </section>
  );
}
