import Link from "next/link";
import { Card, CodeBlock, Heading, Tag, Text } from "@hulianui/ui";
import { REPLACE_LABEL, type InstallModel } from "../lib/install-model";

// 「安装与接入」面板 —— 区块/页面详情页的动作区。
//
// 在此之前详情页只有「标题 + 描述 + 预览/代码」，用户看完得自己绕去 /start 或 MCP
// 才知道怎么装；而 registry 里 providers / replace / slots / 递归依赖 / 目标文件早就齐了。
// 这里把那份数据原样摆到同屏，把「看到 → 装上 → 验过」接成一条直线。

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium">
        {label}
        {hint && <span className="ml-1 block text-xs font-normal text-muted sm:inline">{hint}</span>}
      </dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  );
}

const Mono = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-surface-hover px-1.5 py-0.5 font-mono text-xs">{children}</code>
);

export function InstallPanel({ model, kind }: { model: InstallModel; kind: "block" | "page" }) {
  const hasReplace = model.replace.length > 0;
  return (
    <Card variant="outline" className="overflow-hidden">
      <div className="border-b border-border bg-surface/40 px-5 py-3">
        <Heading level={2} size="base" weight="semibold">
          安装与接入
        </Heading>
        <Text tone="muted" size="sm" className="mt-0.5">
          数据来自本站 registry <Mono>v{model.version}</Mono>，与 shadcn CLI 实际拉取的是同一份。
        </Text>
      </div>

      <div className="px-5 py-4">
        <CodeBlock code={model.command} lang="bash" />

        <dl className="mt-2 divide-y divide-border">
          {model.registryDeps.length > 0 && (
            <Row label="递归安装" hint={`${model.registryDeps.length} 个区块`}>
              <ul className="flex flex-wrap gap-2">
                {model.registryDeps.map((dep) => (
                  <li key={dep.name}>
                    {dep.href ? (
                      <Link
                        href={dep.href}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {dep.title}
                        <span className="font-mono text-muted">{dep.name}</span>
                      </Link>
                    ) : (
                      <Mono>{dep.name}</Mono>
                    )}
                  </li>
                ))}
              </ul>
              <Text tone="muted" size="sm" className="mt-1.5">
                CLI 会先把这些区块写进你的工程，再写入本{kind === "page" ? "页" : "区块"}源码。
              </Text>
            </Row>
          )}

          <Row label="写入文件" hint={`${model.targets.length} 个`}>
            <ul className="space-y-1">
              {model.targets.map((t) => (
                <li key={t}>
                  <Mono>{t}</Mono>
                </li>
              ))}
            </ul>
          </Row>

          <Row label="需要 Provider">
            {model.providers.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {model.providers.map((p) => (
                  <Mono key={p}>{p}</Mono>
                ))}
              </span>
            ) : (
              <Text tone="muted" size="sm">
                无 —— 不依赖任何 Provider。
              </Text>
            )}
          </Row>

          <Row label="必须替换" hint={hasReplace ? "接入前逐项处理" : undefined}>
            {hasReplace ? (
              <span className="flex flex-wrap gap-1.5">
                {model.replace.map((r) => (
                  <Tag key={r} variant="soft" tone="warning" size="sm">
                    {REPLACE_LABEL[r]}
                  </Tag>
                ))}
              </span>
            ) : (
              <Text tone="muted" size="sm">
                无 —— 源码里没有需要替换的示例内容。
              </Text>
            )}
          </Row>

          {model.slots.length > 0 && (
            <Row label="可替换插槽">
              <span className="flex flex-wrap gap-1.5">
                {model.slots.map((s) => (
                  <Mono key={s}>{s}</Mono>
                ))}
              </span>
            </Row>
          )}

          <Row label="npm 依赖">
            {model.npmDeps.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {model.npmDeps.map((d) => (
                  <Mono key={d}>{d}</Mono>
                ))}
              </span>
            ) : (
              <Text tone="muted" size="sm">
                无额外依赖。
              </Text>
            )}
          </Row>
        </dl>

        {model.guardCommand && (
          <div className="mt-4">
            <Text size="sm" weight="medium">
              装完验一遍
            </Text>
            <Text tone="muted" size="sm" className="mb-2 mt-0.5">
              门禁按 conventions 的可执行规则扫上面这些目标文件；有错误级违规会非零退出。
            </Text>
            <CodeBlock code={model.guardCommand} lang="bash" />
          </div>
        )}
      </div>
    </Card>
  );
}
